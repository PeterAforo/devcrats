import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstateDto, CreateBuildingDto, CreateUnitDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EstatesService {
  private readonly uploadDir: string;
  private readonly blobToken: string;
  private readonly isProduction: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.blobToken = this.configService.get<string>('BLOB_READ_WRITE_TOKEN', '');
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!this.isProduction && !fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async createEstate(dto: CreateEstateDto, userId: string) {
    return this.prisma.estate.create({
      data: { ...dto, createdBy: userId },
    });
  }

  async findAllEstates(page = 1, limit = 20, search?: string) {
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.estate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { clusters: true, _count: { select: { buildings: true, users: true } } },
      }),
      this.prisma.estate.count({ where }),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findEstateById(id: string) {
    const estate = await this.prisma.estate.findUnique({
      where: { id },
      include: {
        clusters: true,
        buildings: { include: { units: true, cluster: true } },
        amenities: { include: { amenity: true } },
        _count: { select: { users: true, buildings: true } },
      },
    });
    if (!estate) throw new NotFoundException('Estate not found');
    return estate;
  }

  async updateEstate(id: string, dto: Partial<CreateEstateDto>) {
    await this.findEstateById(id);
    return this.prisma.estate.update({ where: { id }, data: dto });
  }

  async deleteEstate(id: string) {
    await this.findEstateById(id);
    return this.prisma.estate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createBuilding(estateId: string, dto: CreateBuildingDto) {
    await this.findEstateById(estateId);
    return this.prisma.building.create({
      data: { ...dto, estateId },
    });
  }

  async findBuildingsByEstate(estateId: string) {
    return this.prisma.building.findMany({
      where: { estateId, deletedAt: null },
      include: { units: true, _count: { select: { units: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createUnit(buildingId: string, dto: CreateUnitDto) {
    const building = await this.prisma.building.findUnique({ where: { id: buildingId } });
    if (!building) throw new NotFoundException('Building not found');

    return this.prisma.unit.create({
      data: {
        ...dto,
        buildingId,
        unitType: (dto.unitType as any) || 'one_bed',
      },
    });
  }

  async findUnitsByBuilding(buildingId: string) {
    return this.prisma.unit.findMany({
      where: { buildingId, deletedAt: null },
      orderBy: { unitNumber: 'asc' },
    });
  }

  async findUnitById(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        building: { include: { estate: true } },
        leases: { where: { status: 'active' }, include: { tenant: { include: { user: true } } } },
      },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async updateUnit(id: string, dto: Partial<CreateUnitDto>) {
    await this.findUnitById(id);
    return this.prisma.unit.update({ where: { id }, data: dto as any });
  }

  async deleteUnit(id: string) {
    await this.findUnitById(id);
    return this.prisma.unit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async uploadLogo(id: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (JPEG, PNG, WebP, SVG) are allowed');
    }

    await this.findEstateById(id);

    const ext = path.extname(file.originalname);
    const filename = `estate-logo-${id}-${Date.now()}${ext}`;
    let logoUrl: string;

    if (this.isProduction && this.blobToken) {
      const response = await fetch(`https://blob.vercel-storage.com/${filename}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.blobToken}`,
          'x-content-type': file.mimetype,
          'x-api-version': '7',
        },
        body: new Uint8Array(file.buffer),
      });
      if (!response.ok) throw new BadRequestException('Logo upload failed');
      const data = await response.json() as { url: string };
      logoUrl = data.url;
    } else {
      const filePath = path.join(this.uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      logoUrl = `/uploads/${filename}`;
    }

    return this.prisma.estate.update({
      where: { id },
      data: { logoUrl },
    });
  }

  async getOccupancyStats(estateId: string) {
    const units = await this.prisma.unit.findMany({
      where: {
        building: { estateId },
        deletedAt: null,
      },
      select: { status: true },
    });

    const total = units.length;
    const occupied = units.filter((u: { status: string }) => u.status === 'occupied').length;
    const vacant = units.filter((u: { status: string }) => u.status === 'vacant').length;
    const underMaintenance = units.filter((u: { status: string }) => u.status === 'under_maintenance').length;
    const reserved = units.filter((u: { status: string }) => u.status === 'reserved').length;

    return {
      total,
      occupied,
      vacant,
      underMaintenance,
      reserved,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  }
}
