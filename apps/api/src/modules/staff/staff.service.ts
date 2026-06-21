import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StaffService {
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

  // ─── STAFF ────────────────────────────────────────────
  async findAllStaff(estateId?: string) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;

    return this.prisma.staff.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(dto: { firstName: string; lastName: string; email: string; phone?: string; role: string; estateId: string; salary?: number; address?: string }) {
    // Create user account first
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new BadRequestException('Email already in use');

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash('EstateIQ@2024', 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'security_staff',
        estateId: dto.estateId,
      },
    });

    return this.prisma.staff.create({
      data: {
        userId: user.id,
        estateId: dto.estateId,
        role: dto.role as any,
        salary: dto.salary,
        hireDate: new Date(),
        address: dto.address,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
    });
  }

  async updateStaff(id: string, dto: { role?: string; salary?: number; firstName?: string; lastName?: string; phone?: string; address?: string; photoUrl?: string }) {
    const staff = await this.prisma.staff.findUnique({ where: { id }, include: { user: true } });
    if (!staff) throw new NotFoundException('Staff not found');

    if (dto.role || dto.salary !== undefined || dto.address !== undefined || dto.photoUrl !== undefined) {
      const data: any = {};
      if (dto.role) data.role = dto.role;
      if (dto.salary !== undefined) data.salary = dto.salary;
      if (dto.address !== undefined) data.address = dto.address;
      if (dto.photoUrl !== undefined) data.photoUrl = dto.photoUrl;
      await this.prisma.staff.update({ where: { id }, data });
    }

    if (dto.firstName || dto.lastName || dto.phone) {
      const userData: any = {};
      if (dto.firstName) userData.firstName = dto.firstName;
      if (dto.lastName) userData.lastName = dto.lastName;
      if (dto.phone) userData.phone = dto.phone;
      await this.prisma.user.update({ where: { id: staff.userId }, data: userData });
    }

    return this.prisma.staff.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
    });
  }

  async deleteStaff(id: string) {
    await this.prisma.staff.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Staff deleted' };
  }

  async uploadPhoto(id: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (JPEG, PNG, WebP, SVG) are allowed');
    }

    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new NotFoundException('Staff not found');

    const ext = path.extname(file.originalname);
    const filename = `staff-photo-${id}-${Date.now()}${ext}`;
    let photoUrl: string;

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
      if (!response.ok) throw new BadRequestException('Photo upload failed');
      const data = await response.json() as { url: string };
      photoUrl = data.url;
    } else {
      const filePath = path.join(this.uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      photoUrl = `/uploads/${filename}`;
    }

    return this.prisma.staff.update({
      where: { id },
      data: { photoUrl },
    });
  }

  // ─── VENDORS ────────────────────────────────────────────
  async findAllVendors(estateId?: string) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;

    return this.prisma.vendor.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createVendor(dto: { estateId: string; name: string; specialty?: string; contactName?: string; phone?: string; email?: string; address?: string }) {
    return this.prisma.vendor.create({ data: dto as any });
  }

  async updateVendor(id: string, dto: any) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const data: any = {};
    for (const key of ['name', 'specialty', 'contactName', 'phone', 'email', 'address', 'rating', 'isActive']) {
      if (dto[key] !== undefined) data[key] = dto[key];
    }

    return this.prisma.vendor.update({ where: { id }, data });
  }

  async deleteVendor(id: string) {
    await this.prisma.vendor.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Vendor deleted' };
  }
}
