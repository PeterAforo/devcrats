import { Controller, Get, Post, Put, Delete, Body, Param, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GateAccessService } from './gate-access.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Gate Access')
@ApiBearerAuth()
@Controller('gate-access')
export class GateAccessController {
  constructor(private readonly gateAccessService: GateAccessService) {}

  private resolveEstateId(role: string, userEstateId?: string, queryEstateId?: string): string | undefined {
    if (role === 'super_admin') return queryEstateId;
    return userEstateId;
  }

  // ─── GATES ───────────────────────────────────────────

  @Post('gates')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Create a gate' })
  createGate(
    @Body() dto: any,
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
  ) {
    if (role !== 'super_admin') {
      dto.estateId = userEstateId;
    }
    if (!dto.estateId) {
      throw new ForbiddenException('estateId is required');
    }
    return this.gateAccessService.createGate(dto);
  }

  @Get('gates')
  @ApiOperation({ summary: 'List all gates' })
  findAllGates(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.findAllGates(estateId);
  }

  @Put('gates/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Update a gate' })
  updateGate(@Param('id') id: string, @Body() dto: any) {
    return this.gateAccessService.updateGate(id, dto);
  }

  @Delete('gates/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Deactivate a gate' })
  deleteGate(@Param('id') id: string) {
    return this.gateAccessService.deleteGate(id);
  }

  // ─── GUARD SHIFTS ───────────────────────────────────────

  @Post('shifts/start')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Start a guard shift' })
  startShift(
    @Body() dto: any,
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
  ) {
    if (role !== 'super_admin') {
      dto.estateId = userEstateId;
    }
    if (!dto.estateId) {
      throw new ForbiddenException('estateId is required');
    }
    return this.gateAccessService.startShift(dto);
  }

  @Post('shifts/:id/end')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'End a guard shift' })
  endShift(@Param('id') id: string) {
    return this.gateAccessService.endShift(id);
  }

  @Get('shifts/active')
  @ApiOperation({ summary: 'Get active guard shifts' })
  getActiveShifts(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.getActiveShifts(estateId);
  }

  @Get('shifts/history')
  @ApiOperation({ summary: 'Get guard shift history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getShiftHistory(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.getShiftHistory(estateId, page || 1, limit || 20);
  }

  // ─── ACCESS PASSES ───────────────────────────────────────

  @Post('passes')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Create an access pass' })
  createAccessPass(
    @Body() dto: any,
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
  ) {
    if (role !== 'super_admin') {
      dto.estateId = userEstateId;
    }
    if (!dto.estateId) {
      throw new ForbiddenException('estateId is required');
    }
    return this.gateAccessService.createAccessPass(dto);
  }

  @Public()
  @Get('passes/verify/:pin')
  @ApiOperation({ summary: 'Verify access pass PIN (public for gate kiosk)' })
  verifyAccessPass(@Param('pin') pin: string) {
    return this.gateAccessService.verifyAccessPass(pin);
  }

  @Get('passes')
  @ApiOperation({ summary: 'List all access passes' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllAccessPasses(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.findAllAccessPasses(estateId, page || 1, limit || 20);
  }

  @Put('passes/:id/revoke')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Revoke an access pass' })
  revokeAccessPass(@Param('id') id: string) {
    return this.gateAccessService.revokeAccessPass(id);
  }

  @Put('passes/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Update an access pass' })
  updateAccessPass(@Param('id') id: string, @Body() dto: any) {
    return this.gateAccessService.updateAccessPass(id, dto);
  }

  // ─── GATE OPERATIONS ─────────────────────────────────────

  @Post('check-in/invite/:inviteId')
  @ApiOperation({ summary: 'Check in visitor via invite' })
  checkInViaInvite(
    @Param('inviteId') inviteId: string,
    @Body() body: { gateId: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.gateAccessService.checkInViaInvite(inviteId, body.gateId, userId);
  }

  @Post('check-in/pass/:passId')
  @ApiOperation({ summary: 'Check in via access pass' })
  checkInViaPass(
    @Param('passId') passId: string,
    @Body() body: { gateId: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.gateAccessService.checkInViaPass(passId, body.gateId, userId);
  }

  @Post('check-in/walk-in')
  @ApiOperation({ summary: 'Check in walk-in visitor' })
  checkInWalkIn(
    @Body() dto: any,
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @CurrentUser('id') userId: string,
  ) {
    if (role !== 'super_admin') {
      dto.estateId = userEstateId;
    }
    if (!dto.estateId) {
      throw new ForbiddenException('estateId is required');
    }
    dto.processedBy = userId;
    return this.gateAccessService.checkInWalkIn(dto);
  }

  @Post('check-out/:gateLogId')
  @ApiOperation({ summary: 'Check out visitor' })
  checkOut(@Param('gateLogId') gateLogId: string) {
    return this.gateAccessService.checkOut(gateLogId);
  }

  // ─── GATE LOGS ───────────────────────────────────────────

  @Get('logs')
  @ApiOperation({ summary: 'Get gate logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'personType', required: false })
  @ApiQuery({ name: 'gateId', required: false })
  @ApiQuery({ name: 'activeOnly', required: false })
  getGateLogs(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('personType') personType?: string,
    @Query('gateId') gateId?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.getGateLogs(estateId, {
      page,
      limit,
      personType,
      gateId,
      activeOnly: activeOnly === 'true',
    });
  }

  @Get('logs/active')
  @ApiOperation({ summary: 'Get active visitors on estate' })
  getActiveVisitors(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.getActiveVisitors(estateId);
  }

  @Get('logs/stats')
  @ApiOperation({ summary: 'Get gate statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getGateStats(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.getGateStats(
      estateId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // ─── VEHICLES ───────────────────────────────────────────

  @Post('vehicles')
  @Roles('super_admin', 'estate_manager', 'landlord', 'tenant')
  @ApiOperation({ summary: 'Register a vehicle' })
  registerVehicle(
    @Body() dto: any,
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
  ) {
    if (role !== 'super_admin') {
      dto.estateId = userEstateId;
    }
    if (!dto.estateId) {
      throw new ForbiddenException('estateId is required');
    }
    return this.gateAccessService.registerVehicle(dto);
  }

  @Get('vehicles/lookup/:plate')
  @ApiOperation({ summary: 'Look up vehicle by license plate' })
  findVehicleByPlate(
    @Param('plate') plate: string,
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.findVehicleByPlate(estateId, plate);
  }

  @Get('vehicles')
  @ApiOperation({ summary: 'List all vehicles' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAllVehicles(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.findAllVehicles(estateId, page || 1, limit || 20);
  }

  @Put('vehicles/:id')
  @Roles('super_admin', 'estate_manager', 'landlord', 'tenant')
  @ApiOperation({ summary: 'Update vehicle' })
  updateVehicle(@Param('id') id: string, @Body() dto: any) {
    return this.gateAccessService.updateVehicle(id, dto);
  }

  @Delete('vehicles/:id')
  @Roles('super_admin', 'estate_manager', 'landlord', 'tenant')
  @ApiOperation({ summary: 'Delete vehicle' })
  deleteVehicle(@Param('id') id: string) {
    return this.gateAccessService.deleteVehicle(id);
  }

  // ─── BLACKLIST ───────────────────────────────────────────

  @Post('blacklist')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Add person to blacklist' })
  addToBlacklist(
    @Body() dto: any,
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @CurrentUser('id') userId: string,
  ) {
    if (role !== 'super_admin') {
      dto.estateId = userEstateId;
    }
    if (!dto.estateId) {
      throw new ForbiddenException('estateId is required');
    }
    dto.addedBy = userId;
    return this.gateAccessService.addToBlacklist(dto);
  }

  @Delete('blacklist/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Remove from blacklist' })
  removeFromBlacklist(@Param('id') id: string) {
    return this.gateAccessService.removeFromBlacklist(id);
  }

  @Get('blacklist/check')
  @ApiOperation({ summary: 'Check if person is blacklisted' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'phone', required: false })
  checkBlacklist(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
    @Query('name') name?: string,
    @Query('phone') phone?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.checkBlacklist(estateId, name, phone);
  }

  @Get('blacklist')
  @ApiOperation({ summary: 'Get blacklist' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getBlacklist(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    if (!estateId) throw new ForbiddenException('estateId is required');
    return this.gateAccessService.getBlacklist(estateId, page || 1, limit || 20);
  }
}
