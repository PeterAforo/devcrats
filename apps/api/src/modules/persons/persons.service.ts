import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto, CreateLandlordDto } from './dto';

@Injectable()
export class PersonsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── TENANTS ────────────────────────────────────────────

  async createTenant(dto: CreateTenantDto, createdBy: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash('Welcome@123', 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'tenant',
        estateId: dto.estateId,
      },
    });

    const tenant = await this.prisma.tenant.create({
      data: {
        userId: user.id,
        estateId: dto.estateId,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        employerName: dto.employerName || dto.companyName,
        employerPhone: dto.employerPhone,
      },
    });

    // Create lease
    await this.prisma.lease.create({
      data: {
        unitId: dto.unitId,
        tenantId: tenant.id,
        landlordId: dto.landlordId,
        status: 'active',
        rentAmount: dto.rentAmount || 0,
        startDate: new Date(dto.leaseStartDate),
        endDate: new Date(dto.leaseEndDate),
        depositAmount: dto.depositAmount,
        createdBy,
      },
    });

    // Update unit status
    await this.prisma.unit.update({
      where: { id: dto.unitId },
      data: { status: 'occupied' },
    });

    return this.findTenantById(tenant.id);
  }

  async findAllTenants(estateId?: string, page = 1, limit = 20, search?: string) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true } },
          leases: {
            where: { status: 'active' },
            include: {
              unit: { include: { building: { include: { estate: true } } } },
              landlord: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true, createdAt: true } },
        leases: {
          include: {
            unit: { include: { building: { include: { estate: true } } } },
            landlord: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async deleteTenant(id: string) {
    const tenant = await this.findTenantById(id);
    await this.prisma.tenant.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.user.update({ where: { id: tenant.user.id }, data: { isActive: false, deletedAt: new Date() } });
    return { message: 'Tenant removed' };
  }

  // ─── LANDLORDS ──────────────────────────────────────────

  async createLandlord(dto: CreateLandlordDto, createdBy: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash('Welcome@123', 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'landlord',
        estateId: dto.estateId,
      },
    });

    const landlord = await this.prisma.landlord.create({
      data: {
        userId: user.id,
        estateId: dto.estateId,
        bankName: dto.bankName,
        bankAccountNo: dto.bankAccountNo,
        bankAccountName: dto.bankAccountName,
        bankCode: dto.bankCode,
      },
    });

    return this.findLandlordById(landlord.id);
  }

  async findAllLandlords(estateId?: string, page = 1, limit = 20, search?: string) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.landlord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, isActive: true } },
          leases: { where: { status: 'active' }, select: { id: true } },
          _count: { select: { leases: true } },
        },
      }),
      this.prisma.landlord.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findLandlordById(id: string) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, isActive: true, createdAt: true } },
        leases: {
          where: { status: 'active' },
          include: {
            unit: { include: { building: { include: { estate: true } } } },
            tenant: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });
    if (!landlord) throw new NotFoundException('Landlord not found');
    return landlord;
  }

  async deleteLandlord(id: string) {
    const landlord = await this.findLandlordById(id);
    await this.prisma.landlord.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.user.update({ where: { id: landlord.user.id }, data: { isActive: false, deletedAt: new Date() } });
    return { message: 'Landlord removed' };
  }
}
