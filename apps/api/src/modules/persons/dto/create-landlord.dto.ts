import { IsString, IsEmail, IsOptional, IsUUID, IsEnum, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLandlordDto {
  @ApiProperty({ example: 'Nana' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Akufo-Mensah' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'nana@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+233 20 789 0123' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsUUID()
  estateId: string;

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
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Unit IDs owned by this landlord' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  unitIds?: string[];

  @ApiPropertyOptional({ enum: ['self_occupied', 'rented'] })
  @IsOptional()
  @IsString()
  occupancyType?: string;

  @ApiPropertyOptional({ example: 'GCB Bank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankCode?: string;
}
