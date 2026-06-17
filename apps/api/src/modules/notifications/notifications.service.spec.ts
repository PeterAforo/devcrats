import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    createMany: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const data = { userId: 'u1', type: 'payment', title: 'Payment Received', message: 'GH₵ 3,500 rent paid' };
      const expected = { id: 'n1', ...data };
      mockPrismaService.notification.create.mockResolvedValue(expected);

      const result = await service.create(data);
      expect(result).toEqual(expected);
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });
  });

  describe('findAllForUser', () => {
    it('should return paginated notifications with unread count', async () => {
      const notifications = [{ id: 'n1', title: 'Test', isRead: false }];
      mockPrismaService.notification.findMany.mockResolvedValue(notifications);
      mockPrismaService.notification.count
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // unread

      const result = await service.findAllForUser('u1');
      expect(result.data).toEqual(notifications);
      expect(result.meta.total).toBe(1);
      expect(result.meta.unreadCount).toBe(1);
    });

    it('should filter unread only when specified', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);
      mockPrismaService.notification.count.mockResolvedValue(0);

      await service.findAllForUser('u1', 1, 20, true);
      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'u1', isRead: false }),
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a specific notification as read', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.markAsRead('n1', 'u1');
      expect(result.count).toBe(1);
      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'n1', userId: 'u1' },
        data: expect.objectContaining({ isRead: true }),
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('u1');
      expect(result.count).toBe(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should return the unread count', async () => {
      mockPrismaService.notification.count.mockResolvedValue(7);

      const result = await service.getUnreadCount('u1');
      expect(result.count).toBe(7);
    });
  });

  describe('broadcast', () => {
    it('should create notifications for all users in estate', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }]);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 3 });

      const result = await service.broadcast('estate-1', 'alert', 'Fire Drill', 'Fire drill at 3 PM');
      expect(result.count).toBe(3);
      expect(mockPrismaService.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'u1', estateId: 'estate-1', title: 'Fire Drill' }),
          expect.objectContaining({ userId: 'u2', estateId: 'estate-1' }),
        ]),
      });
    });
  });
});
