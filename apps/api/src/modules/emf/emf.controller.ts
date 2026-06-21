import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmfService } from './emf.service';

@ApiTags('EMF')
@ApiBearerAuth()
@Controller('emf')
export class EmfController {
  constructor(private readonly emfService: EmfService) {}

  @Get('components')
  @ApiOperation({ summary: 'List fee components' })
  @ApiQuery({ name: 'estateId', required: false })
  findAll(@Query('estateId') estateId?: string) {
    return this.emfService.findAll(estateId);
  }

  @Get('components/:id')
  @ApiOperation({ summary: 'Get fee component by ID' })
  findOne(@Param('id') id: string) {
    return this.emfService.findById(id);
  }

  @Post('components')
  @ApiOperation({ summary: 'Create fee component' })
  create(@Body() dto: any) {
    return this.emfService.create(dto);
  }

  @Put('components/:id')
  @ApiOperation({ summary: 'Update fee component' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.emfService.update(id, dto);
  }

  @Delete('components/:id')
  @ApiOperation({ summary: 'Delete fee component (soft)' })
  remove(@Param('id') id: string) {
    return this.emfService.remove(id);
  }
}
