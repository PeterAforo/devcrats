import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Block A' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  floors?: number;
}

export class CreateUnitDto {
  @ApiProperty({ example: 'A-101' })
  @IsString()
  unitNumber: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiPropertyOptional({ enum: ['studio', 'one_bed', 'two_bed', 'three_bed', 'penthouse', 'commercial'] })
  @IsOptional()
  @IsString()
  unitType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sizeSqft?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rentAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  features?: any;
}
