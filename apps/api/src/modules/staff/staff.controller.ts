import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';

@ApiTags('Staff & Vendors')
@ApiBearerAuth()
@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ─── STAFF ────────────────────────────────────────────
  @Get('staff')
  @ApiOperation({ summary: 'List all staff' })
  @ApiQuery({ name: 'estateId', required: false })
  findAllStaff(@Query('estateId') estateId?: string) {
    return this.staffService.findAllStaff(estateId);
  }

  @Post('staff')
  @ApiOperation({ summary: 'Add staff member' })
  createStaff(@Body() dto: any) {
    return this.staffService.createStaff(dto);
  }

  @Put('staff/:id')
  @ApiOperation({ summary: 'Update staff member' })
  updateStaff(@Param('id') id: string, @Body() dto: any) {
    return this.staffService.updateStaff(id, dto);
  }

  @Delete('staff/:id')
  @ApiOperation({ summary: 'Delete staff member' })
  deleteStaff(@Param('id') id: string) {
    return this.staffService.deleteStaff(id);
  }

  // ─── VENDORS ────────────────────────────────────────────
  @Get('vendors')
  @ApiOperation({ summary: 'List all vendors' })
  @ApiQuery({ name: 'estateId', required: false })
  findAllVendors(@Query('estateId') estateId?: string) {
    return this.staffService.findAllVendors(estateId);
  }

  @Post('vendors')
  @ApiOperation({ summary: 'Add vendor' })
  createVendor(@Body() dto: any) {
    return this.staffService.createVendor(dto);
  }

  @Put('vendors/:id')
  @ApiOperation({ summary: 'Update vendor' })
  updateVendor(@Param('id') id: string, @Body() dto: any) {
    return this.staffService.updateVendor(id, dto);
  }

  @Delete('vendors/:id')
  @ApiOperation({ summary: 'Delete vendor' })
  deleteVendor(@Param('id') id: string) {
    return this.staffService.deleteVendor(id);
  }
}
