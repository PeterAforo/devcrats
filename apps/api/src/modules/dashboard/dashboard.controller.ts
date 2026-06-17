import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats (role-aware)' })
  @ApiQuery({ name: 'estateId', required: false })
  async getStats(@CurrentUser() user: any, @Query('estateId') estateId?: string) {
    switch (user.role) {
      case 'super_admin':
      case 'estate_manager':
        return this.dashboardService.getAdminStats(estateId || user.estateId);
      case 'landlord':
        return this.dashboardService.getLandlordStats(user.id);
      case 'tenant':
        return this.dashboardService.getTenantStats(user.id);
      default:
        return this.dashboardService.getAdminStats(user.estateId);
    }
  }
}
