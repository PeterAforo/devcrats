import { IsString, IsEmail, IsOptional, IsUUID } from 'class-validator';
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
