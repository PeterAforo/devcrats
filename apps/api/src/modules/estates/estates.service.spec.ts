import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EstatesService } from './estates.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  estate: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  building: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  unit: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('EstatesService', () => {
  let service: EstatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstatesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EstatesService>(EstatesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEstate', () => {
    it('should create an estate with provided data', async () => {
      const dto = { name: 'East Legon Hills', address: '14 Boundary Rd, Accra' };
      const userId = 'user-123';
      const expected = { id: 'estate-1', ...dto, createdBy: userId };
      mockPrismaService.estate.create.mockResolvedValue(expected);

      const result = await service.createEstate(dto as any, userId);
      expect(result).toEqual(expected);
      expect(mockPrismaService.estate.create).toHaveBeenCalledWith({
        data: { ...dto, createdBy: userId },
      });
    });
  });

  describe('findAllEstates', () => {
    it('should return paginated list of estates', async () => {
      const estates = [
        { id: '1', name: 'Estate A', address: 'Accra' },
        { id: '2', name: 'Estate B', address: 'Kumasi' },
      ];
      mockPrismaService.estate.findMany.mockResolvedValue(estates);
      mockPrismaService.estate.count.mockResolvedValue(2);

      const result = await service.findAllEstates(1, 20);
      expect(result.data).toEqual(estates);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should apply search filter', async () => {
      mockPrismaService.estate.findMany.mockResolvedValue([]);
      mockPrismaService.estate.count.mockResolvedValue(0);

      await service.findAllEstates(1, 20, 'Legon');
      expect(mockPrismaService.estate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: 'Legon' }) }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findEstateById', () => {
    it('should return estate when found', async () => {
      const estate = { id: '1', name: 'Estate A', buildings: [], amenities: [], _count: { users: 5, buildings: 2 } };
      mockPrismaService.estate.findUnique.mockResolvedValue(estate);

      const result = await service.findEstateById('1');
      expect(result).toEqual(estate);
    });

    it('should throw NotFoundException when estate not found', async () => {
      mockPrismaService.estate.findUnique.mockResolvedValue(null);
      await expect(service.findEstateById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
