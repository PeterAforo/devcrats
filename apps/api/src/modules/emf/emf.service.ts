import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmfService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(estateId?: string) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;

    console.log('EMF Service - findAll:', { estateId, where });

    const components = await this.prisma.feeComponent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    console.log('EMF Service - findAll result:', { count: components.length, components });

    return { data: components, total: components.length };
  }

  async findById(id: string) {
    const component = await this.prisma.feeComponent.findUnique({ where: { id } });
    if (!component) throw new NotFoundException('Fee component not found');
    return component;
  }

  async create(dto: {
    estateId: string;
    name: string;
    description?: string;
    category: string;
    chargeType?: string;
    amount: number;
    frequency: string;
    landlordSplit?: number;
    tenantSplit?: number;
  }) {
    console.log('EMF Service - create:', { dto });

    const result = await this.prisma.feeComponent.create({
      data: {
        estateId: dto.estateId,
        name: dto.name,
        description: dto.description,
        category: dto.category as any,
        chargeType: (dto.chargeType as any) || 'flat',
        amount: dto.amount,
        frequency: (dto.frequency as any) || 'monthly',
        landlordSplit: dto.landlordSplit ?? 30,
        tenantSplit: dto.tenantSplit ?? 70,
      },
    });

    console.log('EMF Service - create result:', result);
    return result;
  }

  async update(
    id: string,
    dto: {
      name?: string;
      description?: string;
      category?: string;
      chargeType?: string;
      amount?: number;
      frequency?: string;
      landlordSplit?: number;
      tenantSplit?: number;
      isActive?: boolean;
    },
  ) {
    await this.findById(id);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.chargeType !== undefined) data.chargeType = dto.chargeType;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.frequency !== undefined) data.frequency = dto.frequency;
    if (dto.landlordSplit !== undefined) data.landlordSplit = dto.landlordSplit;
    if (dto.tenantSplit !== undefined) data.tenantSplit = dto.tenantSplit;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.feeComponent.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.feeComponent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
