import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
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
  getAll(@Query('category') category?: string) {
    if (category) return this.integrationsService.getByCategory(category);
    return this.integrationsService.getAll();
  }

  @Get(':provider')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Get integration by provider' })
  getOne(@Param('provider') provider: string) {
    return this.integrationsService.get(provider);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a custom integration' })
  create(@Body() dto: { provider: string; category: string; displayName: string; description?: string; credentials?: Record<string, string>; config?: Record<string, string> }) {
    return this.integrationsService.create(dto);
  }

  @Put(':provider')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update integration credentials and config' })
  update(@Param('provider') provider: string, @Body() dto: { credentials?: Record<string, string>; config?: Record<string, string>; isActive?: boolean; isSandbox?: boolean }) {
    return this.integrationsService.update(provider, dto);
  }

  @Put(':provider/toggle')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Toggle integration on/off' })
  toggle(@Param('provider') provider: string, @Body() dto: { isActive: boolean }) {
    return this.integrationsService.toggle(provider, dto.isActive);
  }

  @Delete(':provider')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete a custom integration' })
  remove(@Param('provider') provider: string) {
    return this.integrationsService.remove(provider);
  }
}
