import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VisitorsService {
  constructor(private readonly prisma: PrismaService) {}

  async createInvite(data: {
    estateId: string; tenantId: string; visitorName: string;
    visitorPhone?: string; purpose: string; expectedArrival: string; duration?: string;
  }) {
    const pin = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(data.expectedArrival);
    expiresAt.setHours(expiresAt.getHours() + 24);

    return this.prisma.visitorInvite.create({
      data: {
        estateId: data.estateId,
        tenantId: data.tenantId,
        visitorName: data.visitorName,
        visitorPhone: data.visitorPhone,
        purpose: data.purpose,
        expectedArrival: new Date(data.expectedArrival),
        duration: data.duration,
        pin,
        expiresAt,
      },
    });
  }

  async findAllInvites(estateId?: string, page = 1, limit = 20) {
    const where: any = {};
    if (estateId) where.estateId = estateId;

    const [data, total] = await Promise.all([
      this.prisma.visitorInvite.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
          gateLog: true,
        },
      }),
      this.prisma.visitorInvite.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async verifyPin(pin: string) {
    const invite = await this.prisma.visitorInvite.findFirst({
      where: { pin, isUsed: false, expiresAt: { gte: new Date() } },
      include: { tenant: { include: { user: true } } },
    });
    if (!invite) throw new NotFoundException('Invalid or expired PIN');
    return invite;
  }

  async checkIn(inviteId: string, processedBy: string) {
    const invite = await this.prisma.visitorInvite.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('Invite not found');

    await this.prisma.visitorInvite.update({ where: { id: inviteId }, data: { isUsed: true } });

    return this.prisma.gateLog.create({
      data: {
        estateId: invite.estateId,
        visitorInviteId: inviteId,
        visitorName: invite.visitorName,
        visitorPhone: invite.visitorPhone,
        purpose: invite.purpose,
        entryTime: new Date(),
        processedBy,
        authorizedBy: invite.tenantId,
      },
    });
  }

  async checkOut(gateLogId: string) {
    return this.prisma.gateLog.update({
      where: { id: gateLogId },
      data: { exitTime: new Date() },
    });
  }

  async getGateLogs(estateId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.gateLog.findMany({
        where: { estateId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { entryTime: 'desc' },
      }),
      this.prisma.gateLog.count({ where: { estateId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
