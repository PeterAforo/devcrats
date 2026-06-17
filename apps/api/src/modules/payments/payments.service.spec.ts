import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  invoice: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice with computed totals', async () => {
      const dto = {
        estateId: 'estate-1',
        unitId: 'unit-1',
        type: 'rent',
        dueDate: '2025-02-01',
        items: [{ description: 'Monthly Rent', quantity: 1, unitPrice: 3500 }],
      };
      const expected = { id: 'inv-1', invoiceNumber: 'INV-ABC123', subtotal: 3500, total: 3500 };
      mockPrismaService.invoice.create.mockResolvedValue(expected);

      const result = await service.createInvoice(dto as any, 'user-1');
      expect(result).toEqual(expected);
      expect(mockPrismaService.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estateId: 'estate-1',
            subtotal: 3500,
            total: 3500,
          }),
        }),
      );
    });
  });

  describe('findInvoiceById', () => {
    it('should return invoice when found', async () => {
      const invoice = { id: 'inv-1', invoiceNumber: 'INV-001', items: [], payments: [] };
      mockPrismaService.invoice.findUnique.mockResolvedValue(invoice);

      const result = await service.findInvoiceById('inv-1');
      expect(result).toEqual(invoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockPrismaService.invoice.findUnique.mockResolvedValue(null);
      await expect(service.findInvoiceById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordPayment', () => {
    it('should create payment and update invoice status', async () => {
      const invoice = { id: 'inv-1', total: 3500, amountPaid: 0 };
      mockPrismaService.invoice.findUnique.mockResolvedValue(invoice);
      mockPrismaService.payment.create.mockResolvedValue({ id: 'pay-1', amount: 3500, status: 'completed' });
      mockPrismaService.invoice.update.mockResolvedValue({});

      const dto = { invoiceId: 'inv-1', amount: 3500, method: 'mobile_money' };
      const result = await service.recordPayment(dto as any, 'user-1');

      expect(result.amount).toBe(3500);
      expect(mockPrismaService.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ status: 'paid' }),
        }),
      );
    });

    it('should mark as partially_paid when amount < total', async () => {
      const invoice = { id: 'inv-1', total: 3500, amountPaid: 0 };
      mockPrismaService.invoice.findUnique.mockResolvedValue(invoice);
      mockPrismaService.payment.create.mockResolvedValue({ id: 'pay-2', amount: 1000, status: 'completed' });
      mockPrismaService.invoice.update.mockResolvedValue({});

      const dto = { invoiceId: 'inv-1', amount: 1000, method: 'cash' };
      await service.recordPayment(dto as any, 'user-1');

      expect(mockPrismaService.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'partially_paid' }),
        }),
      );
    });
  });

  describe('getPaymentStats', () => {
    it('should return revenue and invoice counts', async () => {
      mockPrismaService.payment.aggregate.mockResolvedValue({ _sum: { amount: 458000 } });
      mockPrismaService.invoice.count
        .mockResolvedValueOnce(12) // pending
        .mockResolvedValueOnce(3); // overdue

      const result = await service.getPaymentStats('estate-1');
      expect(result.totalRevenue).toBe(458000);
      expect(result.pendingInvoices).toBe(12);
      expect(result.overdueInvoices).toBe(3);
    });
  });

  describe('findAllPayments', () => {
    it('should return paginated payments list', async () => {
      const payments = [{ id: 'p1', amount: 3500 }];
      mockPrismaService.payment.findMany.mockResolvedValue(payments);
      mockPrismaService.payment.count.mockResolvedValue(1);

      const result = await service.findAllPayments(undefined, 1, 20);
      expect(result.data).toEqual(payments);
      expect(result.meta.total).toBe(1);
    });
  });
});
