import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UtilitiesService } from './utilities.service';
import { CreateMeterDto, CreateReadingDto, CreateUtilityRateDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Utilities')
@ApiBearerAuth()
@Controller('utilities')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Get('rates')
  @ApiOperation({ summary: 'List utility rates for an estate' })
  @ApiQuery({ name: 'estateId', required: true })
  listRates(@Query('estateId') estateId: string) {
    return this.utilitiesService.listRates(estateId);
  }

  @Post('rates')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Create a utility rate' })
  createRate(@Body() dto: CreateUtilityRateDto) {
    return this.utilitiesService.createRate(dto);
  }

  @Get('meters')
  @ApiOperation({ summary: 'List meters with latest readings, consumption and cost' })
  @ApiQuery({ name: 'estateId', required: true })
  @ApiQuery({ name: 'type', required: false })
  listMeters(@Query('estateId') estateId: string, @Query('type') type?: string) {
    return this.utilitiesService.listMeters(estateId, type);
  }

  @Post('meters')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Register a utility meter' })
  createMeter(@Body() dto: CreateMeterDto) {
    return this.utilitiesService.createMeter(dto);
  }

  @Put('meters/:id/status')
  @Roles('super_admin', 'estate_manager')
  setMeterStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.utilitiesService.setMeterActive(id, isActive);
  }

  @Get('meters/:id/readings')
  @ApiOperation({ summary: 'Meter reading history' })
  listReadings(@Param('id') id: string) {
    return this.utilitiesService.listReadings(id);
  }

  @Post('readings')
  @Roles('super_admin', 'estate_manager', 'landlord')
  @ApiOperation({ summary: 'Record a meter reading (consumption auto-computed)' })
  createReading(@Body() dto: CreateReadingDto, @CurrentUser('id') userId: string) {
    return this.utilitiesService.createReading(dto, userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Utility consumption/cost summary for the current month' })
  @ApiQuery({ name: 'estateId', required: true })
  summary(@Query('estateId') estateId: string) {
    return this.utilitiesService.summary(estateId);
  }
}
