import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PersonsService } from './persons.service';
import { CreateTenantDto, CreateLandlordDto, CreateFamilyMemberDto } from './dto';
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
  @ApiOperation({ summary: 'Register a new tenant (landlord adds tenant with ID, family, etc.)' })
  createTenant(@Body() dto: CreateTenantDto, @CurrentUser('id') userId: string) {
    return this.personsService.createTenant(dto, userId);
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List all tenants' })
  @ApiQuery({ name: 'estateId', required: false })
  @ApiQuery({ name: 'landlordId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAllTenants(
    @Query('estateId') estateId?: string,
    @Query('landlordId') landlordId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.personsService.findAllTenants(estateId, page || 1, limit || 20, search, landlordId);
  }

  @Get('tenants/me')
  @ApiOperation({ summary: 'Get current tenant profile (for logged-in tenant)' })
  findMyTenantProfile(@CurrentUser('id') userId: string) {
    return this.personsService.findTenantByUserId(userId);
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

  // ─── FAMILY MEMBERS ──────────────────────────────────

  @Post('tenants/:tenantId/family')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'Add a family member to tenant' })
  addFamilyMember(@Param('tenantId') tenantId: string, @Body() dto: CreateFamilyMemberDto) {
    return this.personsService.addFamilyMember(tenantId, dto);
  }

  @Get('tenants/:tenantId/family')
  @ApiOperation({ summary: 'Get tenant family members' })
  getFamilyMembers(@Param('tenantId') tenantId: string) {
    return this.personsService.findFamilyMembers(tenantId);
  }

  @Delete('family-members/:id')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'Remove a family member' })
  removeFamilyMember(@Param('id') id: string) {
    return this.personsService.removeFamilyMember(id);
  }

  // ─── TENANT CHANGE REQUESTS ───────────────────────────

  @Post('tenants/:tenantId/change-requests')
  @Roles('tenant')
  @ApiOperation({ summary: 'Tenant requests a profile change (requires landlord approval)' })
  createChangeRequest(
    @Param('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { field: string; newValue: string; reason?: string },
  ) {
    return this.personsService.createChangeRequest(tenantId, userId, body.field, body.newValue, body.reason);
  }

  @Get('change-requests')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'List tenant change requests (approval queue)' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  findChangeRequests(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
  ) {
    return this.personsService.findChangeRequests(tenantId, status, page || 1);
  }

  @Put('change-requests/:id/review')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'Approve or reject a tenant change request' })
  reviewChangeRequest(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() body: { status: 'approved' | 'rejected'; reviewNote?: string },
  ) {
    return this.personsService.reviewChangeRequest(id, reviewerId, body.status, body.reviewNote);
  }

  // ─── LANDLORDS ──────────────────────────────────────────

  @Post('landlords')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Register a new landlord with properties' })
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

  @Get('landlords/me')
  @ApiOperation({ summary: 'Get current landlord profile (for logged-in landlord)' })
  findMyLandlordProfile(@CurrentUser('id') userId: string) {
    return this.personsService.findLandlordByUserId(userId);
  }

  @Get('landlords/:id')
  @ApiOperation({ summary: 'Get landlord by ID' })
  findLandlord(@Param('id') id: string) {
    return this.personsService.findLandlordById(id);
  }

  @Post('landlords/:id/properties')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'Add a property to landlord' })
  addProperty(
    @Param('id') landlordId: string,
    @Body() body: { unitId: string; occupancyType?: string },
  ) {
    return this.personsService.addPropertyToLandlord(landlordId, body.unitId, body.occupancyType);
  }

  @Delete('landlords/:id/properties/:unitId')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'Remove a property from landlord' })
  removeProperty(@Param('id') landlordId: string, @Param('unitId') unitId: string) {
    return this.personsService.removePropertyFromLandlord(landlordId, unitId);
  }

  @Delete('landlords/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Remove landlord' })
  removeLandlord(@Param('id') id: string) {
    return this.personsService.deleteLandlord(id);
  }

  // ─── LANDLORD-TENANT TREE ────────────────────────────

  @Get('estates/:estateId/tree')
  @Roles('super_admin', 'estate_manager', 'security_staff')
  @ApiOperation({ summary: 'Get landlord-tenant hierarchy tree for an estate' })
  getLandlordTenantTree(@Param('estateId') estateId: string) {
    return this.personsService.getLandlordTenantTree(estateId);
  }
}
