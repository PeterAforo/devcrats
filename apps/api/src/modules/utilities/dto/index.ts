import { IsString, IsNumber, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeterDto {
  @ApiProperty()
  @IsUUID()
  estateId: string;

  @ApiProperty()
  @IsUUID()
  unitId: string;

  @ApiProperty({ enum: ['electricity', 'water', 'gas', 'internet', 'waste_collection'] })
  @IsEnum(['electricity', 'water', 'gas', 'internet', 'waste_collection'] as any)
  type: string;

  @ApiProperty({ example: 'MTR-00123' })
  @IsString()
  meterNumber: string;
}

export class CreateReadingDto {
  @ApiProperty()
  @IsUUID()
  meterId: string;

  @ApiProperty({ example: 4520.5 })
  @IsNumber()
  reading: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateUtilityRateDto {
  @ApiProperty()
  @IsUUID()
  estateId: string;

  @ApiProperty({ enum: ['electricity', 'water', 'gas', 'internet', 'waste_collection'] })
  @IsEnum(['electricity', 'water', 'gas', 'internet', 'waste_collection'] as any)
  type: string;

  @ApiProperty({ example: 0.9 })
  @IsNumber()
  ratePerUnit: number;

  @ApiProperty({ example: 'kWh' })
  @IsString()
  unit: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;
}
