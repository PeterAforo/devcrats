import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmfService } from './emf.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('EMF')
@ApiBearerAuth()
@Controller('emf')
export class EmfController {
  constructor(private readonly emfService: EmfService) {}

  @Public()
  @Get('components')
  @ApiOperation({ summary: 'List fee components' })
  @ApiQuery({ name: 'estateId', required: false })
  findAll(@Query('estateId') estateId?: string) {
    return this.emfService.findAll(estateId);
  }

  @Public()
  @Get('components/:id')
  @ApiOperation({ summary: 'Get fee component by ID' })
  findOne(@Param('id') id: string) {
    return this.emfService.findById(id);
  }

  @Public()
  @Post('components')
  @ApiOperation({ summary: 'Create fee component' })
  create(@Body() dto: any) {
    return this.emfService.create(dto);
  }

  @Public()
  @Put('components/:id')
  @ApiOperation({ summary: 'Update fee component' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.emfService.update(id, dto);
  }

  @Public()
  @Delete('components/:id')
  @ApiOperation({ summary: 'Delete fee component (soft)' })
  remove(@Param('id') id: string) {
    return this.emfService.remove(id);
  }
}
