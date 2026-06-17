import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Get all integrations' })
  getAll() {
    return this.integrationsService.getAll();
  }

  @Get(':provider')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Get integration by provider' })
  getOne(@Param('provider') provider: string) {
    return this.integrationsService.get(provider);
  }

  @Put(':provider')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update integration config' })
  update(@Param('provider') provider: string, @Body() dto: any) {
    return this.integrationsService.update(provider, dto);
  }

  @Put(':provider/toggle')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Toggle integration on/off' })
  toggle(@Param('provider') provider: string, @Body() dto: { isActive: boolean }) {
    return this.integrationsService.toggle(provider, dto.isActive);
  }
}
