import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsString()
  @MinLength(1)
  password: string;

  @ApiPropertyOptional({ example: '123456', description: 'TOTP code when MFA is enabled' })
  @IsOptional()
  @IsString()
  mfaCode?: string;
}
