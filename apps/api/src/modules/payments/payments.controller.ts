import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, CreateInvoiceDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaystackService } from './gateways/paystack.service';
import { HubtelService } from './gateways/hubtel.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paystackService: PaystackService,
    private readonly hubtelService: HubtelService,
    private readonly config: ConfigService,
  ) {}

  @Post('invoices')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Create invoice' })
  createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser('id') userId: string) {
    return this.paymentsService.createInvoice(dto, userId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices' })
  @ApiQuery({ name: 'estateId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  findAllInvoices(
    @Query('estateId') estateId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.findAllInvoices(estateId, status, page || 1, limit || 20);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findInvoice(@Param('id') id: string) {
    return this.paymentsService.findInvoiceById(id);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Record a payment' })
  recordPayment(@Body() dto: CreatePaymentDto, @CurrentUser('id') userId: string) {
    return this.paymentsService.recordPayment(dto, userId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List payments' })
  @ApiQuery({ name: 'estateId', required: false })
  @ApiQuery({ name: 'page', required: false })
  findAllPayments(
    @Query('estateId') estateId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.findAllPayments(estateId, page || 1, limit || 20);
  }

  @Get('payments/stats/:estateId')
  @ApiOperation({ summary: 'Get payment statistics' })
  getStats(@Param('estateId') estateId: string) {
    return this.paymentsService.getPaymentStats(estateId);
  }

  @Get('payments/gateways')
  @ApiOperation({ summary: 'Get available payment gateways' })
  async getAvailableGateways() {
    const [paystack, hubtel] = await Promise.all([
      this.paystackService.isConfigured(),
      this.hubtelService.isConfigured(),
    ]);
    return { paystack, hubtel };
  }

  @Post('payments/initialize/paystack')
  @ApiOperation({ summary: 'Initialize Paystack payment' })
  async initPaystack(
    @Body() body: { invoiceId: string; email: string; amount: number; callbackUrl?: string },
    @CurrentUser('id') userId: string,
  ) {
    const reference = `PSK-${Date.now().toString(36).toUpperCase()}-${userId.slice(0, 8)}`;
    const frontendUrl = this.config.get('FRONTEND_URL', 'https://devcrats-api.vercel.app');

    // Create pending payment in DB
    await this.paymentsService.createPendingPayment({
      invoiceId: body.invoiceId,
      amount: body.amount,
      method: 'card',
      reference,
      gateway: 'paystack',
    });

    const result = await this.paystackService.initializeTransaction({
      email: body.email,
      amount: Math.round(body.amount * 100), // Convert GHS to pesewas
      reference,
      callbackUrl: body.callbackUrl || `${frontendUrl}/dashboard/payments?ref=${reference}`,
    });

    return result;
  }

  @Post('payments/initialize/hubtel')
  @ApiOperation({ summary: 'Initialize Hubtel payment' })
  async initHubtel(
    @Body() body: { invoiceId: string; amount: number; description?: string; customerName?: string; customerEmail?: string; customerPhone?: string },
    @CurrentUser('id') userId: string,
  ) {
    const reference = `HBT-${Date.now().toString(36).toUpperCase()}-${userId.slice(0, 8)}`;
    const apiUrl = this.config.get('API_URL', 'https://estateiq-api.vercel.app');
    const frontendUrl = this.config.get('FRONTEND_URL', 'https://devcrats-api.vercel.app');

    // Create pending payment in DB
    await this.paymentsService.createPendingPayment({
      invoiceId: body.invoiceId,
      amount: body.amount,
      method: 'mobile_money',
      reference,
      gateway: 'hubtel',
    });

    const result = await this.hubtelService.initializePayment({
      amount: body.amount,
      description: body.description || 'EstateIQ Payment',
      clientReference: reference,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerMsisdn: body.customerPhone,
      callbackUrl: `${apiUrl}/api/v1/webhooks/hubtel`,
      returnUrl: `${frontendUrl}/dashboard/payments?ref=${reference}`,
      cancellationUrl: `${frontendUrl}/dashboard/payments?cancelled=true`,
    });

    return result;
  }

  @Get('payments/verify/:reference')
  @ApiOperation({ summary: 'Verify payment status by reference' })
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.getPaymentByReference(reference);
  }
}
