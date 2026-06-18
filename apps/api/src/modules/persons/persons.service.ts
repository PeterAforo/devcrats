import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto, CreateLandlordDto } from './dto';

@Injectable()
export class PersonsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── TENANTS ────────────────────────────────────────────

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    return pwd + '!1';
  }

  async createTenant(dto: CreateTenantDto, createdBy: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl || null,
        role: 'tenant',
        estateId: dto.estateId,
        idType: dto.idType as any || null,
        idNumber: dto.idNumber || null,
      },
    });

    const tenant = await this.prisma.tenant.create({
      data: {
        userId: user.id,
        estateId: dto.estateId,
        landlordId: dto.landlordId || null,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        employerName: dto.employerName || dto.companyName,
        employerPhone: dto.employerPhone,
        idType: dto.idType as any || null,
        idNumber: dto.idNumber || null,
        idDocumentUrl: dto.idDocumentUrl || null,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        nationality: dto.nationality || 'Ghanaian',
        occupation: dto.occupation || null,
        addedByLandlord: !!dto.landlordId,
      },
    });

    // Create family members if provided
    if (dto.familyMembers && dto.familyMembers.length > 0) {
      await this.prisma.familyMember.createMany({
        data: dto.familyMembers.map((fm: { firstName: string; lastName: string; relationship: string; dateOfBirth?: string; phone?: string; photoUrl?: string; idType?: string; idNumber?: string }) => ({
          tenantId: tenant.id,
          firstName: fm.firstName,
          lastName: fm.lastName,
          relationship: fm.relationship,
          dateOfBirth: fm.dateOfBirth ? new Date(fm.dateOfBirth) : null,
          phone: fm.phone || null,
          photoUrl: fm.photoUrl || null,
          idType: fm.idType as any || null,
          idNumber: fm.idNumber || null,
        })),
      });
    }

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

    const result = await this.findTenantById(tenant.id);
    return {
      ...result,
      credentials: {
        email: dto.email.toLowerCase(),
        tempPassword,
        message: `Login credentials for ${dto.firstName} ${dto.lastName}`,
      },
    };
  }

  async findAllTenants(estateId?: string, page = 1, limit = 20, search?: string, landlordId?: string) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;
    if (landlordId) where.landlordId = landlordId;
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
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true, avatarUrl: true, idType: true, idNumber: true } },
          familyMembers: true,
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
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true, avatarUrl: true, idType: true, idNumber: true, createdAt: true } },
        familyMembers: true,
        changeRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
        leases: {
          include: {
            unit: { include: { building: { include: { estate: true } } } },
            landlord: { include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } } },
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findTenantByUserId(userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true, avatarUrl: true, idType: true, idNumber: true, createdAt: true } },
        familyMembers: true,
        changeRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
        leases: {
          where: { status: 'active' },
          include: {
            unit: { include: { building: { include: { estate: true, cluster: true } } } },
            landlord: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant profile not found');
    return tenant;
  }

  async deleteTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    await this.prisma.tenant.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.user.update({ where: { id: tenant.userId }, data: { isActive: false, deletedAt: new Date() } });
    return { message: 'Tenant removed' };
  }

  // ─── TENANT CHANGE REQUESTS ───────────────────────────

  async createChangeRequest(tenantId: string, userId: string, field: string, newValue: string, reason?: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, include: { user: true } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (tenant.userId !== userId) throw new ForbiddenException('You can only request changes for your own profile');

    const oldValue = (tenant as any)[field] || (tenant.user as any)[field] || null;

    return this.prisma.tenantChangeRequest.create({
      data: { tenantId, field, oldValue: oldValue ? String(oldValue) : null, newValue, reason },
    });
  }

  async reviewChangeRequest(requestId: string, reviewerId: string, status: 'approved' | 'rejected', reviewNote?: string) {
    const request = await this.prisma.tenantChangeRequest.findUnique({ where: { id: requestId }, include: { tenant: true } });
    if (!request) throw new NotFoundException('Change request not found');

    const updated = await this.prisma.tenantChangeRequest.update({
      where: { id: requestId },
      data: { status, reviewedBy: reviewerId, reviewedAt: new Date(), reviewNote },
    });

    // If approved, apply the change
    if (status === 'approved') {
      const userFields = ['firstName', 'lastName', 'phone', 'email'];
      if (userFields.includes(request.field)) {
        await this.prisma.user.update({
          where: { id: request.tenant.userId },
          data: { [request.field]: request.newValue },
        });
      } else {
        await this.prisma.tenant.update({
          where: { id: request.tenantId },
          data: { [request.field]: request.newValue },
        });
      }
    }

    return updated;
  }

  async findChangeRequests(tenantId?: string, status?: string, page = 1, limit = 20) {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.tenantChangeRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        },
      }),
      this.prisma.tenantChangeRequest.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── FAMILY MEMBERS ──────────────────────────────────

  async addFamilyMember(tenantId: string, data: { firstName: string; lastName: string; relationship: string; dateOfBirth?: string; phone?: string; photoUrl?: string; idType?: string; idNumber?: string }) {
    await this.findTenantById(tenantId);
    return this.prisma.familyMember.create({
      data: {
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        relationship: data.relationship,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        phone: data.phone || null,
        photoUrl: data.photoUrl || null,
        idType: data.idType as any || null,
        idNumber: data.idNumber || null,
      },
    });
  }

  async removeFamilyMember(id: string) {
    await this.prisma.familyMember.delete({ where: { id } });
    return { message: 'Family member removed' };
  }

  async findFamilyMembers(tenantId: string) {
    return this.prisma.familyMember.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
  }

  // ─── LANDLORDS ──────────────────────────────────────────

  async createLandlord(dto: CreateLandlordDto, createdBy: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl || null,
        role: 'landlord',
        estateId: dto.estateId,
        idType: dto.idType as any || null,
        idNumber: dto.idNumber || null,
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

    // Create property ownerships if unit IDs provided
    if (dto.unitIds && dto.unitIds.length > 0) {
      await this.prisma.propertyOwnership.createMany({
        data: dto.unitIds.map((unitId: string) => ({
          landlordId: landlord.id,
          unitId,
          occupancyType: (dto.occupancyType as any) || 'self_occupied',
        })),
      });
    }

    const result = await this.findLandlordById(landlord.id);
    return {
      ...result,
      credentials: {
        email: dto.email.toLowerCase(),
        tempPassword,
        message: `Login credentials for ${dto.firstName} ${dto.lastName}`,
      },
    };
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
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, isActive: true, avatarUrl: true, idType: true, idNumber: true } },
          properties: { where: { isActive: true }, include: { unit: { include: { building: true } } } },
          leases: { where: { status: 'active' }, select: { id: true } },
          _count: { select: { leases: true, properties: true } },
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
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, isActive: true, avatarUrl: true, idType: true, idNumber: true, createdAt: true } },
        properties: {
          where: { isActive: true },
          include: { unit: { include: { building: { include: { estate: true } } } } },
        },
        leases: {
          where: { status: 'active' },
          include: {
            unit: { include: { building: { include: { estate: true } } } },
            tenant: { include: { user: { select: { firstName: true, lastName: true, phone: true, avatarUrl: true } } } },
          },
        },
      },
    });
    if (!landlord) throw new NotFoundException('Landlord not found');
    return landlord;
  }

  async findLandlordByUserId(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, isActive: true, avatarUrl: true, idType: true, idNumber: true, createdAt: true } },
        properties: {
          where: { isActive: true },
          include: { unit: { include: { building: { include: { estate: true, cluster: true } } } } },
        },
        leases: {
          where: { status: 'active' },
          include: {
            unit: { include: { building: true } },
            tenant: { include: { user: { select: { firstName: true, lastName: true, phone: true, avatarUrl: true } }, familyMembers: true } },
          },
        },
      },
    });
    if (!landlord) throw new NotFoundException('Landlord profile not found');
    return landlord;
  }

  async addPropertyToLandlord(landlordId: string, unitId: string, occupancyType: string = 'self_occupied') {
    const landlord = await this.prisma.landlord.findUnique({ where: { id: landlordId } });
    if (!landlord) throw new NotFoundException('Landlord not found');

    return this.prisma.propertyOwnership.create({
      data: {
        landlordId,
        unitId,
        occupancyType: occupancyType as any,
      },
      include: { unit: { include: { building: { include: { estate: true } } } } },
    });
  }

  async removePropertyFromLandlord(landlordId: string, unitId: string) {
    await this.prisma.propertyOwnership.deleteMany({ where: { landlordId, unitId } });
    return { message: 'Property removed from landlord' };
  }

  async deleteLandlord(id: string) {
    const landlord = await this.prisma.landlord.findUnique({ where: { id } });
    if (!landlord) throw new NotFoundException('Landlord not found');
    await this.prisma.landlord.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.user.update({ where: { id: landlord.userId }, data: { isActive: false, deletedAt: new Date() } });
    return { message: 'Landlord removed' };
  }

  // ─── LANDLORD-TENANT TREE ────────────────────────────

  async getLandlordTenantTree(estateId: string) {
    const landlords = await this.prisma.landlord.findMany({
      where: { estateId, deletedAt: null },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        properties: {
          where: { isActive: true },
          include: {
            unit: {
              include: {
                building: true,
                leases: {
                  where: { status: 'active' },
                  include: {
                    tenant: {
                      include: {
                        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
                        familyMembers: { select: { id: true, firstName: true, lastName: true, relationship: true, photoUrl: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return landlords.map((ll: any) => ({
      landlord: { id: ll.id, ...ll.user },
      properties: ll.properties.map((p: any) => ({
        unit: { id: p.unit.id, unitNumber: p.unit.unitNumber, houseNumber: p.unit.houseNumber, building: p.unit.building.name },
        occupancyType: p.occupancyType,
        tenants: p.unit.leases.map((l: any) => ({
          id: l.tenant.id,
          ...l.tenant.user,
          familyMembers: l.tenant.familyMembers,
          leaseStart: l.startDate,
          leaseEnd: l.endDate,
        })),
      })),
    }));
  }
}
