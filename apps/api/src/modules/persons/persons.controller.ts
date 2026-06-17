import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PersonsService } from './persons.service';
import { CreateTenantDto, CreateLandlordDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Persons')
@ApiBearerAuth()
@Controller()
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  // ─── TENANTS ────────────────────────────────────────────

  @Post('tenants')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'Register a new tenant (landlord adds tenant)' })
  createTenant(@Body() dto: CreateTenantDto, @CurrentUser('id') userId: string) {
    return this.personsService.createTenant(dto, userId);
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List all tenants' })
  @ApiQuery({ name: 'estateId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAllTenants(
    @Query('estateId') estateId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.personsService.findAllTenants(estateId, page || 1, limit || 20, search);
  }

  @Get('tenants/:id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  findTenant(@Param('id') id: string) {
    return this.personsService.findTenantById(id);
  }

  @Delete('tenants/:id')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'Remove tenant' })
  removeTenant(@Param('id') id: string) {
    return this.personsService.deleteTenant(id);
  }

  // ─── LANDLORDS ──────────────────────────────────────────

  @Post('landlords')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Register a new landlord' })
  createLandlord(@Body() dto: CreateLandlordDto, @CurrentUser('id') userId: string) {
    return this.personsService.createLandlord(dto, userId);
  }

  @Get('landlords')
  @ApiOperation({ summary: 'List all landlords' })
  @ApiQuery({ name: 'estateId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAllLandlords(
    @Query('estateId') estateId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.personsService.findAllLandlords(estateId, page || 1, limit || 20, search);
  }

  @Get('landlords/:id')
  @ApiOperation({ summary: 'Get landlord by ID' })
  findLandlord(@Param('id') id: string) {
    return this.personsService.findLandlordById(id);
  }

  @Delete('landlords/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Remove landlord' })
  removeLandlord(@Param('id') id: string) {
    return this.personsService.deleteLandlord(id);
  }
}
