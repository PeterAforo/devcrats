import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private uploadDir: string;
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

  async uploadFile(file: Express.Multer.File, userId: string, metadata?: { estateId?: string; category?: string }) {
    if (!file) throw new BadRequestException('No file provided');

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) throw new BadRequestException('File too large (max 10MB)');

    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    let fileUrl: string;

    if (this.isProduction && this.blobToken) {
      // Upload to Vercel Blob in production
      fileUrl = await this.uploadToBlob(file.buffer, filename, file.mimetype);
    } else {
      // Local filesystem in development
      const filePath = path.join(this.uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      fileUrl = `/uploads/${filename}`;
    }

    const document = await this.prisma.document.create({
      data: {
        title: file.originalname,
        type: (metadata?.category || 'other'),
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId,
        estateId: metadata?.estateId,
      } as any,
    });

    return document;
  }

  private async uploadToBlob(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    const response = await fetch(`https://blob.vercel-storage.com/${filename}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.blobToken}`,
        'x-content-type': contentType,
        'x-api-version': '7',
      },
      body: new Uint8Array(buffer),
    });

    if (!response.ok) {
      this.logger.error('Vercel Blob upload failed', await response.text());
      throw new BadRequestException('File upload failed');
    }

    const data = await response.json() as { url: string };
    return data.url;
  }

  async getDocuments(estateId?: string, page = 1, limit = 20) {
    const where: any = { deletedAt: null };
    if (estateId) where.estateId = estateId;

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.document.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async deleteDocument(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new BadRequestException('Document not found');

    // Delete physical file
    const filePath = path.join(process.cwd(), doc.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
