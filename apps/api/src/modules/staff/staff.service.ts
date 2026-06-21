import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── STAFF ────────────────────────────────────────────
  async findAllStaff(estateId?: string) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;

    return this.prisma.staff.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(dto: { firstName: string; lastName: string; email: string; phone?: string; role: string; estateId: string; salary?: number }) {
    // Create user account first
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new BadRequestException('Email already in use');

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('EstateIQ@2024', 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'security_staff',
        estateId: dto.estateId,
      },
    });

    return this.prisma.staff.create({
      data: {
        userId: user.id,
        estateId: dto.estateId,
        role: dto.role as any,
        salary: dto.salary,
        hireDate: new Date(),
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
    });
  }

  async updateStaff(id: string, dto: { role?: string; salary?: number; firstName?: string; lastName?: string; phone?: string }) {
    const staff = await this.prisma.staff.findUnique({ where: { id }, include: { user: true } });
    if (!staff) throw new NotFoundException('Staff not found');

    if (dto.role || dto.salary !== undefined) {
      const data: any = {};
      if (dto.role) data.role = dto.role;
      if (dto.salary !== undefined) data.salary = dto.salary;
      await this.prisma.staff.update({ where: { id }, data });
    }

    if (dto.firstName || dto.lastName || dto.phone) {
      const userData: any = {};
      if (dto.firstName) userData.firstName = dto.firstName;
      if (dto.lastName) userData.lastName = dto.lastName;
      if (dto.phone) userData.phone = dto.phone;
      await this.prisma.user.update({ where: { id: staff.userId }, data: userData });
    }

    return this.prisma.staff.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
    });
  }

  async deleteStaff(id: string) {
    await this.prisma.staff.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Staff deleted' };
  }

  // ─── VENDORS ────────────────────────────────────────────
  async findAllVendors(estateId?: string) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;

    return this.prisma.vendor.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createVendor(dto: { estateId: string; name: string; specialty?: string; contactName?: string; phone?: string; email?: string; address?: string }) {
    return this.prisma.vendor.create({ data: dto as any });
  }

  async updateVendor(id: string, dto: any) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const data: any = {};
    for (const key of ['name', 'specialty', 'contactName', 'phone', 'email', 'address', 'rating', 'isActive']) {
      if (dto[key] !== undefined) data[key] = dto[key];
    }

    return this.prisma.vendor.update({ where: { id }, data });
  }

  async deleteVendor(id: string) {
    await this.prisma.vendor.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Vendor deleted' };
  }
}
