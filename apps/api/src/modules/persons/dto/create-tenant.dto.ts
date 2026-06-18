import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFamilyMemberDto {
  @ApiProperty({ example: 'Ama' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Asante' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'spouse' })
  @IsString()
  relationship: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '+233 24 555 6789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ enum: ['ghana_card', 'passport'] })
  @IsOptional()
  @IsEnum(['ghana_card', 'passport'])
  idType?: string;

  @ApiPropertyOptional({ example: 'GHA-123456789-0' })
  @IsOptional()
  @IsString()
  idNumber?: string;
}

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

  @ApiPropertyOptional({ enum: ['ghana_card', 'passport'] })
  @IsOptional()
  @IsString()
  idType?: string;

  @ApiPropertyOptional({ example: 'GHA-123456789-0' })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idDocumentUrl?: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

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

  @ApiPropertyOptional({ type: [CreateFamilyMemberDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFamilyMemberDto)
  familyMembers?: CreateFamilyMemberDto[];

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
