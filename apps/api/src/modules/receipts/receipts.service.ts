import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate receipt number in format: DDMMYY-SEQ-HOUSE
   * e.g., 301025-1-00AC12
   */
  async generateReceiptNumber(houseNumber: string, date?: Date): Promise<string> {
    const d = date || new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const datePrefix = `${dd}${mm}${yy}`;

    // Get count of receipts created today for sequence
    const startOfDay = new Date(d);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(d);
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await this.prisma.receipt.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const seq = todayCount + 1;
    const house = houseNumber.replace(/\s+/g, '').toUpperCase();
    return `${datePrefix}-${seq}-${house}`;
  }

  async createReceipt(paymentId: string, data: {
    receivedFrom: string;
    houseNumber: string;
    cluster: string;
    contactNumber?: string;
    description: string;
    paymentPeriod: string;
    balanceDue?: number;
    issuedBy?: string;
  }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { receipt: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.receipt) return payment.receipt; // already has receipt

    const number = await this.generateReceiptNumber(data.houseNumber);

    return this.prisma.receipt.create({
      data: {
        paymentId,
        number,
        receivedFrom: data.receivedFrom,
        houseNumber: data.houseNumber,
        cluster: data.cluster,
        contactNumber: data.contactNumber,
        description: data.description,
        paymentPeriod: data.paymentPeriod,
        balanceDue: data.balanceDue,
        issuedBy: data.issuedBy,
      },
    });
  }

  async findAll(page = 1, limit = 20, search?: string, estateId?: string) {
    const where: any = {};
    if (estateId) {
      where.payment = { invoice: { estateId } };
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { receivedFrom: { contains: search, mode: 'insensitive' } },
        { houseNumber: { contains: search, mode: 'insensitive' } },
        { cluster: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payment: {
            select: { amount: true, method: true, paidAt: true },
          },
        },
      }),
      this.prisma.receipt.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            invoice: {
              include: { estate: true, unit: { include: { building: { include: { cluster: true } } } } },
            },
          },
        },
      },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async findByNumber(number: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { number },
      include: {
        payment: {
          include: {
            invoice: { include: { estate: true } },
          },
        },
      },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  /**
   * Generate printable receipt HTML matching DEVCRAS template
   */
  async generatePrintableHtml(id: string): Promise<string> {
    const receipt = await this.findById(id);
    const payment = receipt.payment;
    const estate = payment?.invoice?.estate;

    const dateStr = receipt.createdAt.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const amount = Number(payment.amount);
    const amountWords = this.numberToWords(amount);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${receipt.number}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #1a365d; margin: 0; padding: 40px; }
    .header { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 30px; }
    .logo-area { width: 120px; }
    .logo-area img { width: 100%; }
    .org-info { flex: 1; text-align: center; }
    .org-info h2 { margin: 0; color: #1a6b3d; font-size: 16px; }
    .org-info p { margin: 2px 0; font-size: 12px; }
    .date-line { text-align: right; margin: 10px 0; font-weight: bold; }
    .receipt-title { display: flex; justify-content: space-between; align-items: center; margin: 20px 0; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
    .receipt-title h1 { margin: 0; font-size: 20px; }
    .receipt-title .number { font-size: 18px; font-weight: bold; }
    .field-row { display: flex; margin: 12px 0; gap: 20px; }
    .field { flex: 1; }
    .field label { font-style: italic; font-size: 12px; display: block; }
    .field .value { border-bottom: 1px solid #333; padding: 4px 0; min-height: 20px; font-weight: 500; }
    .amount-box { border: 2px solid #1a365d; display: inline-block; padding: 10px 30px; font-size: 22px; font-weight: bold; margin: 20px 0; }
    .signature { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature div { text-align: center; }
    .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-style: italic; font-size: 11px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="org-info">
      <h2>${estate?.name || 'DEVCRAS'}</h2>
      <p>${estate?.address || 'No. 2, El Minya Crescent, Horizon, Devtraco Courts'}</p>
      <p>C/O P O Box AN 12284, Accra-North</p>
      <p>Tel.: 0202051105, 0244651183, 0242065588</p>
      <p>Email: info@devcras.com &nbsp; Website: www.devcras.com</p>
    </div>
  </div>

  <div class="date-line">Date: ${dateStr}</div>

  <div class="receipt-title">
    <h1>OFFICIAL RECEIPT</h1>
    <span class="number">No.: ${receipt.number}</span>
  </div>

  <div class="field-row">
    <div class="field" style="flex:2"><label>Received from</label><div class="value">${receipt.receivedFrom || '—'}</div></div>
  </div>

  <div class="field-row">
    <div class="field"><label>Hse No.</label><div class="value">${receipt.houseNumber || '—'}</div></div>
    <div class="field"><label>Cluster</label><div class="value">${receipt.cluster || '—'}</div></div>
    <div class="field"><label>Contact No.</label><div class="value">${receipt.contactNumber || '—'}</div></div>
  </div>

  <div class="field-row">
    <div class="field" style="flex:2"><label>The sum of</label><div class="value">${amountWords} Only</div></div>
  </div>

  <div class="field-row">
    <div class="field" style="flex:2"><label>Being</label><div class="value">${receipt.description || '—'}</div></div>
  </div>

  <div class="field-row">
    <div class="field" style="flex:2"><label>For</label><div class="value">${receipt.paymentPeriod || '—'}</div></div>
  </div>

  <div class="field-row">
    <div class="field"><label>Mode of Payment</label><div class="value">${payment.method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} on ${payment.paidAt ? payment.paidAt.toLocaleDateString('en-GB') : '—'}</div></div>
    <div class="field"><label>Balance Due</label><div class="value">${receipt.balanceDue ? `GHS ${Number(receipt.balanceDue).toFixed(2)}` : '—'}</div></div>
  </div>

  <div class="amount-box">GHS ${amount.toFixed(2)}</div>

  <div class="signature">
    <div></div>
    <div><p style="border-top:1px solid #333; padding-top:5px;">Signature &nbsp;&nbsp;&nbsp; SGD.</p></div>
  </div>

  <div class="footer">
    <p>Please refer all discrepancies to the Treasurer on 0202051105 or send an email to treasurer@devcras.com for reconciliation/resolution.</p>
  </div>
</body>
</html>`;
  }

  private numberToWords(amount: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (amount === 0) return 'Zero Ghana Cedis';

    const convert = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
      if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + convert(n % 1000000) : '');
    };

    const whole = Math.floor(amount);
    const pesewas = Math.round((amount - whole) * 100);

    let result = convert(whole) + ' Ghana Cedis';
    if (pesewas > 0) result += ' and ' + convert(pesewas) + ' Pesewas';
    return result;
  }
}
