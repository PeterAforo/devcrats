import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create service request' })
  create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.maintenanceService.createRequest(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List service requests' })
  @ApiQuery({ name: 'estateId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  findAll(
    @Query('estateId') estateId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.maintenanceService.findAll(estateId, status, page || 1, limit || 20);
  }

  @Get('stats/:estateId')
  @ApiOperation({ summary: 'Get maintenance stats' })
  getStats(@Param('estateId') estateId: string) {
    return this.maintenanceService.getStats(estateId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service request by ID' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update service request status' })
  updateStatus(@Param('id') id: string, @Body() dto: { status: string; assignedTo?: string }) {
    return this.maintenanceService.updateStatus(id, dto.status, dto.assignedTo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service request' })
  remove(@Param('id') id: string) {
    return this.maintenanceService.delete(id);
  }
}
