import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Complaints')
@ApiBearerAuth()
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'File a complaint' })
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.complaintsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List complaints' })
  @ApiQuery({ name: 'estateId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('estateId') estateId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.complaintsService.findAll(estateId, status, page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  findOne(@Param('id') id: string) {
    return this.complaintsService.findById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update complaint status' })
  updateStatus(@Param('id') id: string, @Body() dto: { status: string; resolution?: string }) {
    return this.complaintsService.updateStatus(id, dto.status, dto.resolution);
  }

  @Post(':id/updates')
  @ApiOperation({ summary: 'Add update to complaint' })
  addUpdate(@Param('id') id: string, @Body() dto: { message: string; isInternal?: boolean }, @CurrentUser('id') userId: string) {
    return this.complaintsService.addUpdate(id, dto.message, userId, dto.isInternal);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete complaint' })
  remove(@Param('id') id: string) {
    return this.complaintsService.delete(id);
  }
}
