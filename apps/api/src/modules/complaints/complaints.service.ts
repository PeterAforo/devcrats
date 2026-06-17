import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    estateId: string; unitId?: string; tenantId?: string; title: string;
    description: string; category: string; urgency?: string; isAnonymous?: boolean;
  }, userId: string) {
    return this.prisma.complaint.create({
      data: {
        estateId: data.estateId,
        unitId: data.unitId,
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        category: data.category as any,
        urgency: data.urgency || 'normal',
        isAnonymous: data.isAnonymous || false,
        createdBy: userId,
      },
    });
  }

  async findAll(estateId?: string, status?: string, page = 1, limit = 20) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          unit: { include: { building: true } },
          tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
          updates: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        unit: { include: { building: { include: { estate: true } } } },
        tenant: { include: { user: true } },
        updates: { orderBy: { createdAt: 'asc' } },
        attachments: true,
      },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return complaint;
  }

  async updateStatus(id: string, status: string, resolution?: string) {
    await this.findById(id);
    const data: any = { status };
    if (resolution) data.resolution = resolution;
    if (status === 'closed') data.resolvedAt = new Date();
    return this.prisma.complaint.update({ where: { id }, data });
  }

  async addUpdate(complaintId: string, message: string, authorId: string, isInternal = false) {
    return this.prisma.complaintUpdate.create({
      data: { complaintId, message, authorId, isInternal },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.complaint.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
