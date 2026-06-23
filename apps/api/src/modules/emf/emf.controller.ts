import { Controller, Get, Post, Put, Delete, Body, Param, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmfService } from './emf.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('EMF')
@ApiBearerAuth()
@Controller('emf')
export class EmfController {
  constructor(private readonly emfService: EmfService) {}

  /** super_admin can use query param or see all; others scoped to their estate */
  private resolveEstateId(role: string, userEstateId?: string, queryEstateId?: string): string | undefined {
    if (role === 'super_admin') return queryEstateId;
    return userEstateId;
  }

  @Get('components')
  @ApiOperation({ summary: 'List fee components' })
  @ApiQuery({ name: 'estateId', required: false })
  findAll(
    @CurrentUser('role') role: string,
    @CurrentUser('estateId') userEstateId: string,
    @Query('estateId') queryEstateId?: string,
  ) {
    const estateId = this.resolveEstateId(role, userEstateId, queryEstateId);
    return this.emfService.findAll(estateId);
  }

  @Get('components/:id')
  @ApiOperation({ summary: 'Get fee component by ID' })
  findOne(@Param('id') id: string) {
    return this.emfService.findById(id);
  }

  @Post('components')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Create fee component' })
  create(
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
    return this.emfService.create(dto);
  }

  @Put('components/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Update fee component' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.emfService.update(id, dto);
  }

  @Delete('components/:id')
  @Roles('super_admin', 'estate_manager')
  @ApiOperation({ summary: 'Delete fee component (soft)' })
  remove(@Param('id') id: string) {
    return this.emfService.remove(id);
  }
}
