import { Controller, Get, Post, Body, Param, Query, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Receipts')
@ApiBearerAuth()
@Controller()
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  /** super_admin can use query param or see all; others scoped to their estate */
  private resolveEstateId(role: string, userEstateId?: string, queryEstateId?: string): string | undefined {
    if (role === 'super_admin') return queryEstateId;
    return userEstateId;
  }

  @Post('receipts')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Generate a receipt for a payment' })
  create(@Body() dto: CreateReceiptDto, @CurrentUser('id') userId: string) {
    return this.receiptsService.createReceipt(dto.paymentId, {
      ...dto,
      issuedBy: userId,
    });
  }

  @Get('receipts')
  @ApiOperation({ summary: 'List all receipts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'estateId', required: false })
  findAll(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('estateId') queryEstateId?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    return this.receiptsService.findAll(page || 1, limit || 20, search, estateId);
  }

  @Get('receipts/:id')
  @ApiOperation({ summary: 'Get receipt by ID' })
  findOne(@Param('id') id: string) {
    return this.receiptsService.findById(id);
  }

  @Get('receipts/:id/print')
  @ApiOperation({ summary: 'Get printable receipt HTML' })
  @Header('Content-Type', 'text/html')
  async print(@Param('id') id: string, @Res() res: any) {
    const html = await this.receiptsService.generatePrintableHtml(id);
    res.send(html);
  }

  @Get('receipts/by-number/:number')
  @ApiOperation({ summary: 'Get receipt by number' })
  findByNumber(@Param('number') number: string) {
    return this.receiptsService.findByNumber(number);
  }
}
