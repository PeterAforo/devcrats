import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto, CreateInvoiceDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── INVOICES ───────────────────────────────────────────

  async createInvoice(dto: CreateInvoiceDto, userId: string) {
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    const items = dto.items.map((item) => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice,
      total: (item.quantity || 1) * item.unitPrice,
    }));
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);

    return this.prisma.invoice.create({
      data: {
        estateId: dto.estateId,
        unitId: dto.unitId,
        invoiceNumber,
        type: dto.type,
        subtotal,
        total: subtotal,
        dueDate: new Date(dto.dueDate),
        notes: dto.notes,
        createdBy: userId,
        items: { create: items },
      },
      include: { items: true },
    });
  }

  async findAllInvoices(estateId?: string, status?: string, page = 1, limit = 20) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, unit: { include: { building: true } }, payments: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, payments: true, unit: { include: { building: { include: { estate: true } } } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  // ─── PAYMENTS ───────────────────────────────────────────

  async recordPayment(dto: CreatePaymentDto, userId: string) {
    const invoice = await this.findInvoiceById(dto.invoiceId);

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        method: dto.method as any,
        reference: dto.reference || `PAY-${Date.now().toString(36).toUpperCase()}`,
        gateway: dto.gateway,
        gatewayRef: dto.gatewayRef,
        status: 'completed',
        paidAt: new Date(),
      },
    });

    // Update invoice
    const newAmountPaid = Number(invoice.amountPaid) + dto.amount;
    const newStatus = newAmountPaid >= Number(invoice.total) ? 'paid' : 'partially_paid';
    await this.prisma.invoice.update({
      where: { id: dto.invoiceId },
      data: { amountPaid: newAmountPaid, status: newStatus, paidDate: newStatus === 'paid' ? new Date() : undefined },
    });

    return payment;
  }

  async findAllPayments(estateId?: string, page = 1, limit = 20) {
    const where: any = {};
    if (estateId) {
      where.invoice = { estateId };
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: { include: { unit: { include: { building: true } } } },
          tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPaymentStats(estateId: string) {
    const [totalRevenue, pendingInvoices, overdueInvoices] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { invoice: { estateId }, status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.count({ where: { estateId, status: { in: ['sent', 'partially_paid'] } } }),
      this.prisma.invoice.count({ where: { estateId, status: 'overdue' } }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingInvoices,
      overdueInvoices,
    };
  }
}
