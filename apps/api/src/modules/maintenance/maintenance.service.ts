import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(data: {
    estateId: string; unitId?: string; tenantId?: string; title: string;
    description: string; category: string; priority?: string;
  }, userId: string) {
    return this.prisma.serviceRequest.create({
      data: {
        estateId: data.estateId,
        unitId: data.unitId,
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        category: data.category as any,
        priority: (data.priority as any) || 'normal',
        createdBy: userId,
      },
      include: { unit: { include: { building: true } }, tenant: { include: { user: true } } },
    });
  }

  async findAll(estateId?: string, status?: string, page = 1, limit = 20) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          unit: { include: { building: true } },
          tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        unit: { include: { building: { include: { estate: true } } } },
        tenant: { include: { user: true } },
        attachments: true,
      },
    });
    if (!request) throw new NotFoundException('Service request not found');
    return request;
  }

  async updateStatus(id: string, status: string, assignedTo?: string) {
    await this.findById(id);
    const data: any = { status };
    if (assignedTo) data.assignedTo = assignedTo;
    if (status === 'completed') data.completedAt = new Date();
    return this.prisma.serviceRequest.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.serviceRequest.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getStats(estateId: string) {
    const [total, open, inProgress, completed] = await Promise.all([
      this.prisma.serviceRequest.count({ where: { estateId, deletedAt: null } }),
      this.prisma.serviceRequest.count({ where: { estateId, status: 'submitted', deletedAt: null } }),
      this.prisma.serviceRequest.count({ where: { estateId, status: 'in_progress', deletedAt: null } }),
      this.prisma.serviceRequest.count({ where: { estateId, status: 'completed', deletedAt: null } }),
    ]);
    return { total, open, inProgress, completed };
  }
}
