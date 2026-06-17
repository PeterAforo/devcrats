import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VisitorsService } from './visitors.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Visitors')
@ApiBearerAuth()
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post('invites')
  @ApiOperation({ summary: 'Create visitor invite' })
  createInvite(@Body() dto: any) {
    return this.visitorsService.createInvite(dto);
  }

  @Get('invites')
  @ApiOperation({ summary: 'List visitor invites' })
  @ApiQuery({ name: 'estateId', required: false })
  findAllInvites(@Query('estateId') estateId?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.visitorsService.findAllInvites(estateId, page || 1, limit || 20);
  }

  @Public()
  @Get('verify/:pin')
  @ApiOperation({ summary: 'Verify visitor PIN' })
  verifyPin(@Param('pin') pin: string) {
    return this.visitorsService.verifyPin(pin);
  }

  @Post('check-in/:inviteId')
  @ApiOperation({ summary: 'Check in visitor' })
  checkIn(@Param('inviteId') inviteId: string, @CurrentUser('id') userId: string) {
    return this.visitorsService.checkIn(inviteId, userId);
  }

  @Put('check-out/:gateLogId')
  @ApiOperation({ summary: 'Check out visitor' })
  checkOut(@Param('gateLogId') gateLogId: string) {
    return this.visitorsService.checkOut(gateLogId);
  }

  @Get('gate-logs/:estateId')
  @ApiOperation({ summary: 'Get gate logs' })
  getGateLogs(@Param('estateId') estateId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.visitorsService.getGateLogs(estateId, page || 1, limit || 20);
  }
}
