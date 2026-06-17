import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, CreateInvoiceDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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
}
