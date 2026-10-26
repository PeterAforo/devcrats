import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeterDto, CreateReadingDto, CreateUtilityRateDto } from './dto';

@Injectable()
export class UtilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveRate(estateId: string, type: string) {
    const now = new Date();
    return this.prisma.utilityRate.findFirst({
      where: {
        estateId,
        type: type as any,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  // ─── RATES ──────────────────────────────────────────────
  async listRates(estateId: string) {
    return this.prisma.utilityRate.findMany({
      where: { estateId },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async createRate(dto: CreateUtilityRateDto) {
    // Close out the previous active rate for this type
    await this.prisma.utilityRate.updateMany({
      where: { estateId: dto.estateId, type: dto.type as any, effectiveTo: null },
      data: { effectiveTo: new Date(dto.effectiveFrom || Date.now()) },
    });
    return this.prisma.utilityRate.create({
      data: {
        estateId: dto.estateId,
        type: dto.type as any,
        ratePerUnit: dto.ratePerUnit,
        unit: dto.unit,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
      },
    });
  }

  // ─── METERS ─────────────────────────────────────────────
  async listMeters(estateId: string, type?: string) {
    const meters = await this.prisma.meter.findMany({
      where: { estateId, isActive: true, ...(type ? { type: type as any } : {}) },
      include: {
        unit: {
          include: {
            building: { include: { cluster: true } },
            leases: {
              where: { status: 'active' },
              take: 1,
              include: { tenant: { include: { user: { select: { firstName: true, lastName: true } } } } },
            },
          },
        },
        readings: { orderBy: { readingDate: 'desc' }, take: 2 },
      },
      orderBy: { meterNumber: 'asc' },
    });

    const rateCache = new Map<string, number>();
    for (const m of meters) {
      if (!rateCache.has(m.type)) {
        const rate = await this.getActiveRate(estateId, m.type);
        rateCache.set(m.type, rate ? Number(rate.ratePerUnit) : 0);
      }
    }

    return meters.map((m) => {
      const [latest, prev] = m.readings;
      const consumption = latest ? Number(latest.consumption ?? (prev ? Number(latest.reading) - Number(prev.reading) : 0)) : 0;
      const rate = rateCache.get(m.type) || 0;
      return {
        id: m.id,
        meterNumber: m.meterNumber,
        type: m.type,
        unit: { id: m.unit.id, unitNumber: m.unit.unitNumber, houseNumber: m.unit.houseNumber, building: m.unit.building?.name },
        tenant: m.unit.leases?.[0]?.tenant?.user
          ? `${m.unit.leases[0].tenant.user.firstName} ${m.unit.leases[0].tenant.user.lastName}`
          : null,
        currentReading: latest ? Number(latest.reading) : null,
        previousReading: prev ? Number(prev.reading) : null,
        consumption,
        cost: Math.round(consumption * rate * 100) / 100,
        rate,
        lastReadAt: latest?.readingDate || null,
      };
    });
  }

  async createMeter(dto: CreateMeterDto) {
    const unit = await this.prisma.unit.findFirst({ where: { id: dto.unitId, deletedAt: null } });
    if (!unit) throw new NotFoundException('Unit not found');
    return this.prisma.meter.create({
      data: {
        estateId: dto.estateId,
        unitId: dto.unitId,
        type: dto.type as any,
        meterNumber: dto.meterNumber,
      },
    });
  }

  async setMeterActive(meterId: string, isActive: boolean) {
    return this.prisma.meter.update({ where: { id: meterId }, data: { isActive } });
  }

  // ─── READINGS ───────────────────────────────────────────
  async listReadings(meterId: string) {
    return this.prisma.meterReading.findMany({
      where: { meterId },
      orderBy: { readingDate: 'desc' },
      take: 50,
    });
  }

  async createReading(dto: CreateReadingDto, userId: string) {
    const meter = await this.prisma.meter.findUnique({ where: { id: dto.meterId } });
    if (!meter) throw new NotFoundException('Meter not found');

    const prev = await this.prisma.meterReading.findFirst({
      where: { meterId: dto.meterId },
      orderBy: { readingDate: 'desc' },
    });
    if (prev && dto.reading < Number(prev.reading)) {
      throw new BadRequestException(`Reading (${dto.reading}) is lower than the previous reading (${prev.reading})`);
    }
    const consumption = prev ? dto.reading - Number(prev.reading) : null;

    return this.prisma.meterReading.create({
      data: {
        meterId: dto.meterId,
        reading: dto.reading,
        readingDate: dto.readingDate ? new Date(dto.readingDate) : new Date(),
        consumption,
        notes: dto.notes,
        readBy: userId,
      },
    });
  }

  // ─── SUMMARY ────────────────────────────────────────────
  async summary(estateId: string) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [readings, meters, rates] = await Promise.all([
      this.prisma.meterReading.findMany({
        where: { meter: { estateId }, readingDate: { gte: monthStart }, consumption: { not: null } },
        include: { meter: true },
      }),
      this.prisma.meter.count({ where: { estateId, isActive: true } }),
      this.prisma.utilityRate.findMany({
        where: { estateId, effectiveFrom: { lte: new Date() }, OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }] },
      }),
    ]);

    const rateByType = new Map(rates.map((r) => [r.type, Number(r.ratePerUnit)]));
    const byType: Record<string, { consumption: number; cost: number; meterCount: number }> = {};
    const meterCounts = await this.prisma.meter.groupBy({ by: ['type'], where: { estateId, isActive: true }, _count: true });
    for (const mc of meterCounts) {
      byType[mc.type] = { consumption: 0, cost: 0, meterCount: mc._count };
    }
    for (const r of readings) {
      const t = r.meter.type;
      if (!byType[t]) byType[t] = { consumption: 0, cost: 0, meterCount: 0 };
      const c = Number(r.consumption || 0);
      byType[t].consumption += c;
      byType[t].cost += c * (rateByType.get(t) || 0);
    }
    for (const t of Object.keys(byType)) {
      byType[t].consumption = Math.round(byType[t].consumption * 100) / 100;
      byType[t].cost = Math.round(byType[t].cost * 100) / 100;
    }
    return { byType, totalMeters: meters, activeRates: rates };
  }
}
