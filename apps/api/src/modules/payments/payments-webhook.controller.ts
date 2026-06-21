import { Controller, Post, Body, Headers, Req, RawBodyRequest, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PaystackService } from './gateways/paystack.service';
import { HubtelService, HubtelCallbackPayload } from './gateways/hubtel.service';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Payment Webhooks')
@Controller('webhooks')
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(
    private readonly paystackService: PaystackService,
    private readonly hubtelService: HubtelService,
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('paystack')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Paystack webhook handler' })
  async handlePaystackWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);

    if (!(await this.paystackService.validateWebhookSignature(rawBody, signature))) {
      this.logger.warn('Invalid Paystack webhook signature');
      return { status: 'invalid_signature' };
    }

    const event = body.event;
    const data = body.data;

    if (event === 'charge.success') {
      this.logger.log(`Paystack payment success: ${data.reference}`);

      try {
        // Find the pending payment by reference
        const payment = await this.prisma.payment.findFirst({
          where: { reference: data.reference, status: 'pending' },
          include: { invoice: true },
        });

        if (payment) {
          // Update payment status
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              gatewayRef: String(data.id),
              paidAt: new Date(data.paid_at),
            },
          });

          // Update invoice
          const invoice = payment.invoice;
          if (invoice) {
            const newAmountPaid = Number(invoice.amountPaid) + Number(payment.amount);
            const newStatus = newAmountPaid >= Number(invoice.total) ? 'paid' : 'partially_paid';
            await this.prisma.invoice.update({
              where: { id: invoice.id },
              data: { amountPaid: newAmountPaid, status: newStatus, paidDate: newStatus === 'paid' ? new Date() : undefined },
            });
          }

          // Auto-generate receipt
          await this.prisma.receipt.create({
            data: {
              number: `RCT-${Date.now().toString(36).toUpperCase()}`,
              paymentId: payment.id,
              receivedFrom: data.customer?.first_name ? `${data.customer.first_name} ${data.customer.last_name}` : undefined,
              description: `Payment via Paystack (${data.channel})`,
            },
          });
        }
      } catch (error) {
        this.logger.error('Error processing Paystack webhook', error);
      }
    }

    return { status: 'ok' };
  }

  @Post('hubtel')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Hubtel webhook/callback handler' })
  async handleHubtelCallback(@Body() body: HubtelCallbackPayload) {
    this.logger.log(`Hubtel callback: ${body.Data?.ClientReference} - ${body.Status}`);

    if (body.ResponseCode === '0000' && body.Status === 'Success') {
      try {
        const reference = body.Data.ClientReference;

        const payment = await this.prisma.payment.findFirst({
          where: { reference, status: 'pending' },
          include: { invoice: true },
        });

        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              gatewayRef: body.Data.CheckoutId,
              paidAt: new Date(),
            },
          });

          // Update invoice
          const invoice = payment.invoice;
          if (invoice) {
            const newAmountPaid = Number(invoice.amountPaid) + Number(payment.amount);
            const newStatus = newAmountPaid >= Number(invoice.total) ? 'paid' : 'partially_paid';
            await this.prisma.invoice.update({
              where: { id: invoice.id },
              data: { amountPaid: newAmountPaid, status: newStatus, paidDate: newStatus === 'paid' ? new Date() : undefined },
            });
          }

          // Auto-generate receipt
          await this.prisma.receipt.create({
            data: {
              number: `RCT-${Date.now().toString(36).toUpperCase()}`,
              paymentId: payment.id,
              description: `Payment via Hubtel (${body.Data.PaymentDetails?.Channel || 'Mobile Money'})`,
            },
          });
        }
      } catch (error) {
        this.logger.error('Error processing Hubtel callback', error);
      }
    }

    return { status: 'ok' };
  }
}
