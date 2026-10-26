import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminStats(estateId?: string) {
    const estateFilter = estateId ? { estateId } : {};

    const [totalUnits, occupiedUnits, totalTenants, totalLandlords, pendingMaintenance, openComplaints, totalRevenue] =
      await Promise.all([
        this.prisma.unit.count({ where: { deletedAt: null, building: estateFilter } }),
        this.prisma.unit.count({ where: { status: 'occupied', deletedAt: null, building: estateFilter } }),
        this.prisma.tenant.count({ where: { deletedAt: null, ...estateFilter } }),
        this.prisma.landlord.count({ where: { deletedAt: null, ...estateFilter } }),
        this.prisma.serviceRequest.count({ where: { status: { in: ['submitted', 'acknowledged', 'assigned'] }, deletedAt: null, ...estateFilter } }),
        this.prisma.complaint.count({ where: { status: { in: ['open', 'investigating'] }, deletedAt: null, ...estateFilter } }),
        this.prisma.payment.aggregate({ where: { status: 'completed', invoice: estateFilter }, _sum: { amount: true } }),
      ]);

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
      totalTenants,
      totalLandlords,
      pendingMaintenance,
      openComplaints,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async getLandlordStats(userId: string) {
    const landlord = await this.prisma.landlord.findUnique({
      where: { userId },
      include: {
        leases: {
          where: { status: 'active' },
          include: { unit: true, tenant: { include: { user: { select: { firstName: true, lastName: true } } } } },
        },
      },
    });

    if (!landlord) return { units: 0, tenants: 0, leases: [] };

    return {
      units: landlord.leases.length,
      tenants: landlord.leases.length,
      leases: landlord.leases,
    };
  }

  async getTenantStats(userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
      include: {
        leases: {
          where: { status: 'active' },
          include: { unit: { include: { building: { include: { estate: true } } } } },
        },
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
        complaints: { orderBy: { createdAt: 'desc' }, take: 5 },
        serviceRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!tenant) return { lease: null, recentPayments: [], recentComplaints: [], recentRequests: [] };

    return {
      lease: tenant.leases[0] || null,
      recentPayments: tenant.payments,
      recentComplaints: tenant.complaints,
      recentRequests: tenant.serviceRequests,
    };
  }

  async getAnalytics(estateId?: string) {
    const estateFilter = estateId ? { estateId } : {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const [payments, estates, maintenanceByCat, outstandingInvoices, tenantCount] = await Promise.all([
      this.prisma.payment.findMany({
        where: { status: 'completed', paidAt: { gte: yearAgo }, invoice: estateFilter },
        select: { amount: true, paidAt: true },
      }),
      this.prisma.estate.findMany({
        where: { deletedAt: null, ...(estateId ? { id: estateId } : {}) },
        select: {
          id: true,
          name: true,
          buildings: { select: { units: { where: { deletedAt: null }, select: { status: true } } } },
        },
      }),
      this.prisma.serviceRequest.groupBy({
        by: ['category'],
        where: { deletedAt: null, ...estateFilter },
        _count: true,
      }),
      this.prisma.invoice.findMany({
        where: { status: { in: ['sent', 'partially_paid', 'overdue'] }, ...estateFilter },
        select: { total: true, amountPaid: true },
      }),
      this.prisma.tenant.count({ where: { deletedAt: null, ...estateFilter } }),
    ]);

    // Monthly revenue for the last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyRevenue.push({ month: monthNames[d.getMonth()], amount: 0 });
    }
    for (const p of payments) {
      const d = p.paidAt || new Date();
      if (d < sixMonthsAgo) continue;
      const key = monthNames[d.getMonth()];
      const bucket = monthlyRevenue.find((m) => m.month === key);
      if (bucket) bucket.amount += Number(p.amount);
    }

    const occupancyByEstate = estates.map((e) => {
      const units = e.buildings.flatMap((b) => b.units);
      const occupied = units.filter((u) => u.status === 'occupied').length;
      return {
        name: e.name,
        units: units.length,
        occupancy: units.length > 0 ? Math.round((occupied / units.length) * 100) : 0,
      };
    });

    const totalMaint = maintenanceByCat.reduce((s, c) => s + c._count, 0);
    const maintenanceByCategory = maintenanceByCat
      .map((c) => ({ category: c.category, count: c._count, pct: totalMaint > 0 ? Math.round((c._count / totalMaint) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    const annualRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);
    const totalUnitsAll = occupancyByEstate.reduce((s, e) => s + e.units, 0);
    const avgOccupancy = occupancyByEstate.length > 0
      ? Math.round(occupancyByEstate.reduce((s, e) => s + e.occupancy, 0) / occupancyByEstate.length)
      : 0;
    const outstanding = outstandingInvoices.reduce((s, i) => s + (Number(i.total) - Number(i.amountPaid || 0)), 0);

    return {
      monthlyRevenue,
      occupancyByEstate,
      maintenanceByCategory,
      kpis: {
        annualRevenue,
        avgOccupancy,
        totalUnits: totalUnitsAll,
        totalTenants: tenantCount,
        outstanding: Math.round(outstanding * 100) / 100,
      },
    };
  }
}
