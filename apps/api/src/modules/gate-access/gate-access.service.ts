import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GateAccessService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── GATES ───────────────────────────────────────────

  async createGate(data: {
    estateId: string;
    name: string;
    type?: string;
    description?: string;
  }) {
    return this.prisma.gate.create({
      data: {
        estateId: data.estateId,
        name: data.name,
        type: data.type || 'entry_exit',
        description: data.description,
      },
    });
  }

  async findAllGates(estateId: string) {
    return this.prisma.gate.findMany({
      where: { estateId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateGate(id: string, data: { name?: string; type?: string; description?: string; isActive?: boolean }) {
    return this.prisma.gate.update({
      where: { id },
      data,
    });
  }

  async deleteGate(id: string) {
    return this.prisma.gate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ─── GUARD SHIFTS ───────────────────────────────────────

  async startShift(data: {
    estateId: string;
    gateId: string;
    guardId: string;
    notes?: string;
  }) {
    // End any active shift for this guard at this gate
    await this.prisma.guardShift.updateMany({
      where: {
        guardId: data.guardId,
        gateId: data.gateId,
        endTime: null,
      },
      data: { endTime: new Date() },
    });

    return this.prisma.guardShift.create({
      data: {
        estateId: data.estateId,
        gateId: data.gateId,
        guardId: data.guardId,
        startTime: new Date(),
        notes: data.notes,
      },
      include: {
        gate: true,
        guard: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async endShift(shiftId: string) {
    return this.prisma.guardShift.update({
      where: { id: shiftId },
      data: { endTime: new Date() },
    });
  }

  async getActiveShifts(estateId: string) {
    return this.prisma.guardShift.findMany({
      where: { estateId, endTime: null },
      include: {
        gate: true,
        guard: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getShiftHistory(estateId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.guardShift.findMany({
        where: { estateId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startTime: 'desc' },
        include: {
          gate: true,
          guard: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.guardShift.count({ where: { estateId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── ACCESS PASSES ───────────────────────────────────────

  async createAccessPass(data: {
    estateId: string;
    holderName: string;
    holderPhone?: string;
    passType: string;
    company?: string;
    validFrom: Date;
    validUntil: Date;
    allowedDays: string[];
    allowedTimeStart?: string;
    allowedTimeEnd?: string;
    notes?: string;
  }) {
    const pin = Math.random().toString().slice(2, 8);

    return this.prisma.accessPass.create({
      data: {
        estateId: data.estateId,
        holderName: data.holderName,
        holderPhone: data.holderPhone,
        passType: data.passType,
        company: data.company,
        pin,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        allowedDays: data.allowedDays,
        allowedTimeStart: data.allowedTimeStart,
        allowedTimeEnd: data.allowedTimeEnd,
        notes: data.notes,
      },
    });
  }

  async verifyAccessPass(pin: string) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const pass = await this.prisma.accessPass.findFirst({
      where: {
        pin,
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
        allowedDays: { has: currentDay },
      },
    });

    if (!pass) {
      throw new NotFoundException('Invalid or expired access pass');
    }

    // Check time restrictions
    if (pass.allowedTimeStart || pass.allowedTimeEnd) {
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      if (pass.allowedTimeStart && currentTime < pass.allowedTimeStart) {
        throw new ForbiddenException('Access not allowed at this time (before start time)');
      }
      if (pass.allowedTimeEnd && currentTime > pass.allowedTimeEnd) {
        throw new ForbiddenException('Access not allowed at this time (after end time)');
      }
    }

    return pass;
  }

  async findAllAccessPasses(estateId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.accessPass.findMany({
        where: { estateId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.accessPass.count({ where: { estateId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async revokeAccessPass(id: string) {
    return this.prisma.accessPass.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateAccessPass(id: string, data: {
    holderName?: string;
    holderPhone?: string;
    validFrom?: Date;
    validUntil?: Date;
    allowedDays?: string[];
    allowedTimeStart?: string;
    allowedTimeEnd?: string;
    notes?: string;
  }) {
    return this.prisma.accessPass.update({
      where: { id },
      data,
    });
  }

  // ─── GATE OPERATIONS ─────────────────────────────────────

  async checkInViaInvite(inviteId: string, gateId: string, processedBy: string) {
    const invite = await this.prisma.visitorInvite.findUnique({
      where: { id: inviteId },
      include: { tenant: true },
    });

    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.isUsed) throw new ForbiddenException('Invite already used');
    if (invite.expiresAt < new Date()) throw new ForbiddenException('Invite expired');

    await this.prisma.visitorInvite.update({
      where: { id: inviteId },
      data: { isUsed: true },
    });

    return this.prisma.gateLog.create({
      data: {
        estateId: invite.estateId,
        visitorInviteId: inviteId,
        gateId,
        personType: 'visitor',
        visitorName: invite.visitorName,
        visitorPhone: invite.visitorPhone,
        purpose: invite.purpose,
        entryTime: new Date(),
        authorizedBy: invite.tenantId,
        processedBy,
      },
    });
  }

  async checkInViaPass(passId: string, gateId: string, processedBy: string) {
    const pass = await this.prisma.accessPass.findUnique({
      where: { id: passId },
    });

    if (!pass) throw new NotFoundException('Access pass not found');
    if (!pass.isActive) throw new ForbiddenException('Access pass is inactive');

    return this.prisma.gateLog.create({
      data: {
        estateId: pass.estateId,
        accessPassId: passId,
        gateId,
        personType: pass.passType,
        visitorName: pass.holderName,
        visitorPhone: pass.holderPhone,
        purpose: `${pass.passType} - ${pass.company || 'N/A'}`,
        entryTime: new Date(),
        processedBy,
      },
    });
  }

  async checkInWalkIn(data: {
    estateId: string;
    gateId: string;
    visitorName: string;
    visitorPhone?: string;
    purpose: string;
    vehiclePlate?: string;
    notes?: string;
    processedBy: string;
  }) {
    return this.prisma.gateLog.create({
      data: {
        estateId: data.estateId,
        gateId: data.gateId,
        personType: 'visitor',
        visitorName: data.visitorName,
        visitorPhone: data.visitorPhone,
        purpose: data.purpose,
        vehiclePlate: data.vehiclePlate,
        notes: data.notes,
        entryTime: new Date(),
        isWalkIn: true,
        processedBy: data.processedBy,
      },
    });
  }

  async checkOut(gateLogId: string) {
    return this.prisma.gateLog.update({
      where: { id: gateLogId },
      data: { exitTime: new Date() },
    });
  }

  // ─── GATE LOGS ───────────────────────────────────────────

  async getGateLogs(estateId: string, filters: {
    page?: number;
    limit?: number;
    personType?: string;
    gateId?: string;
    activeOnly?: boolean;
  } = {}) {
    const { page = 1, limit = 20, personType, gateId, activeOnly } = filters;

    const where: any = { estateId };
    if (personType) where.personType = personType;
    if (gateId) where.gateId = gateId;
    if (activeOnly) where.exitTime = null;

    const [data, total] = await Promise.all([
      this.prisma.gateLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { entryTime: 'desc' },
        include: {
          gate: true,
          visitorInvite: {
            include: {
              tenant: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          accessPass: true,
        },
      }),
      this.prisma.gateLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getActiveVisitors(estateId: string) {
    return this.prisma.gateLog.findMany({
      where: { estateId, exitTime: null },
      orderBy: { entryTime: 'desc' },
      include: {
        gate: true,
        visitorInvite: {
          include: {
            tenant: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        accessPass: true,
      },
    });
  }

  async getGateStats(estateId: string, startDate?: Date, endDate?: Date) {
    const where: any = { estateId };
    if (startDate || endDate) {
      where.entryTime = {};
      if (startDate) where.entryTime.gte = startDate;
      if (endDate) where.entryTime.lte = endDate;
    }

    const [totalEntries, activeVisitors, byType] = await Promise.all([
      this.prisma.gateLog.count({ where }),
      this.prisma.gateLog.count({ where: { ...where, exitTime: null } }),
      this.prisma.gateLog.groupBy({
        by: ['personType'],
        where,
        _count: true,
      }),
    ]);

    return {
      totalEntries,
      activeVisitors,
      byType: byType.reduce((acc, item) => {
        acc[item.personType] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ─── VEHICLES ───────────────────────────────────────────

  async registerVehicle(data: {
    estateId: string;
    licensePlate: string;
    ownerName: string;
    unitId?: string;
    parkingSlot?: string;
    color?: string;
    make?: string;
    model?: string;
  }) {
    return this.prisma.vehicle.create({
      data,
    });
  }

  async findVehicleByPlate(estateId: string, licensePlate: string) {
    return this.prisma.vehicle.findFirst({
      where: {
        estateId,
        licensePlate: { mode: 'insensitive', equals: licensePlate },
        deletedAt: null,
      },
      include: {
        unit: {
          include: {
            building: true,
          },
        },
      },
    });
  }

  async findAllVehicles(estateId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { estateId, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          unit: {
            include: {
              building: true,
            },
          },
        },
      }),
      this.prisma.vehicle.count({ where: { estateId, deletedAt: null } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateVehicle(id: string, data: {
    ownerName?: string;
    unitId?: string;
    parkingSlot?: string;
    color?: string;
    make?: string;
    model?: string;
  }) {
    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async deleteVehicle(id: string) {
    return this.prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─── BLACKLIST ───────────────────────────────────────────

  async addToBlacklist(data: {
    estateId: string;
    name: string;
    phone?: string;
    reason: string;
    addedBy: string;
  }) {
    return this.prisma.blacklist.create({
      data,
    });
  }

  async removeFromBlacklist(id: string) {
    return this.prisma.blacklist.delete({
      where: { id },
    });
  }

  async checkBlacklist(estateId: string, name?: string, phone?: string) {
    const where: any = { estateId };
    if (name) where.name = { mode: 'insensitive', contains: name };
    if (phone) where.phone = phone;

    return this.prisma.blacklist.findFirst({
      where,
    });
  }

  async getBlacklist(estateId: string, page = 1, limit = 20) {
    const [data, total] = await Promise.all([
      this.prisma.blacklist.findMany({
        where: { estateId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blacklist.count({ where: { estateId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
