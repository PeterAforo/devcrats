import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; estateId?: string; type: string; title: string; message: string; data?: any }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        estateId: data.estateId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
      },
    });
  }

  async findAllForUser(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount } };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }

  async broadcast(estateId: string, type: string, title: string, message: string) {
    const users = await this.prisma.user.findMany({
      where: { estateId, isActive: true, deletedAt: null },
      select: { id: true },
    });

    const notifications = users.map((u: { id: string }) => ({
      userId: u.id,
      estateId,
      type,
      title,
      message,
    }));

    return this.prisma.notification.createMany({ data: notifications });
  }
}
