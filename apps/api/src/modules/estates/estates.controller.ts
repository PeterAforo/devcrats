import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { EstatesService } from './estates.service';
import { CreateEstateDto, CreateBuildingDto, CreateUnitDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Estates')
@ApiBearerAuth()
@Controller()
export class EstatesController {
  constructor(private readonly estatesService: EstatesService) {}

  @Post('estates')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Create a new estate' })
  create(@Body() dto: CreateEstateDto, @CurrentUser('id') userId: string) {
    return this.estatesService.createEstate(dto, userId);
  }

  @Get('estates')
  @ApiOperation({ summary: 'List all estates' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.estatesService.findAllEstates(page || 1, limit || 20, search);
  }

  @Get('estates/:id')
  @ApiOperation({ summary: 'Get estate by ID' })
  findOne(@Param('id') id: string) {
    return this.estatesService.findEstateById(id);
  }

  @Put('estates/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Update estate' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateEstateDto>) {
    return this.estatesService.updateEstate(id, dto);
  }

  @Delete('estates/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Soft delete estate' })
  remove(@Param('id') id: string) {
    return this.estatesService.deleteEstate(id);
  }

  @Post('estates/:id/buildings')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Add building to estate' })
  createBuilding(@Param('id') estateId: string, @Body() dto: CreateBuildingDto) {
    return this.estatesService.createBuilding(estateId, dto);
  }

  @Get('estates/:id/buildings')
  @ApiOperation({ summary: 'List buildings in estate' })
  findBuildings(@Param('id') estateId: string) {
    return this.estatesService.findBuildingsByEstate(estateId);
  }

  @Post('buildings/:id/units')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Add unit to building' })
  createUnit(@Param('id') buildingId: string, @Body() dto: CreateUnitDto) {
    return this.estatesService.createUnit(buildingId, dto);
  }

  @Get('buildings/:id/units')
  @ApiOperation({ summary: 'List units in building' })
  findUnits(@Param('id') buildingId: string) {
    return this.estatesService.findUnitsByBuilding(buildingId);
  }

  @Get('units/:id')
  @ApiOperation({ summary: 'Get unit by ID' })
  findUnit(@Param('id') id: string) {
    return this.estatesService.findUnitById(id);
  }

  @Put('units/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Update unit' })
  updateUnit(@Param('id') id: string, @Body() dto: Partial<CreateUnitDto>) {
    return this.estatesService.updateUnit(id, dto);
  }

  @Delete('units/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Soft delete unit' })
  removeUnit(@Param('id') id: string) {
    return this.estatesService.deleteUnit(id);
  }

  @Post('estates/:id/logo')
  @Roles('super_admin', 'estate_manager')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload estate logo' })
  uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.estatesService.uploadLogo(id, file);
  }

  @Get('estates/:id/occupancy-stats')
  @ApiOperation({ summary: 'Get occupancy statistics' })
  getOccupancyStats(@Param('id') estateId: string) {
    return this.estatesService.getOccupancyStats(estateId);
  }
}
