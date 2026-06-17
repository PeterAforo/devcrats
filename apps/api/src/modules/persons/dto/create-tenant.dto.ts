import { IsString, IsEmail, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Kwame' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Asante' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'kwame@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+233 20 123 4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsUUID()
  estateId: string;

  @ApiProperty()
  @IsUUID()
  unitId: string;

  @ApiProperty()
  @IsUUID()
  landlordId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ enum: ['single', 'family', 'company'] })
  @IsOptional()
  @IsString()
  tenantType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  occupants?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsString()
  leaseStartDate: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsString()
  leaseEndDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  rentAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  depositAmount?: number;
}
