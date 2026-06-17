import { Controller, Post, Get, Delete, Param, Query, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, estateId: { type: 'string' }, category: { type: 'string' } } } })
  @ApiOperation({ summary: 'Upload a file' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { estateId?: string; category?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.uploadsService.uploadFile(file, userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  getDocuments(@Query('estateId') estateId?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.uploadsService.getDocuments(estateId, page || 1, limit || 20);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  deleteDocument(@Param('id') id: string) {
    return this.uploadsService.deleteDocument(id);
  }
}
