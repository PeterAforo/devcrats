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
}
