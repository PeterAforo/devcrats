import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReceiptDto {
  @ApiProperty({ description: 'Payment ID to generate receipt for' })
  @IsUUID()
  paymentId: string;

  @ApiProperty({ example: 'Sarah Adwoa Mansa Ackah-Ayensu' })
  @IsString()
  receivedFrom: string;

  @ApiProperty({ example: 'AC12' })
  @IsString()
  houseNumber: string;

  @ApiProperty({ example: 'Bellavilla' })
  @IsString()
  cluster: string;

  @ApiPropertyOptional({ example: '0241476209' })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiProperty({ example: 'Estate Management Fee (EMF) for January 2026 and GHS133 part payment' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'January 2026' })
  @IsString()
  paymentPeriod: string;

  @ApiPropertyOptional({ example: 150.00 })
  @IsOptional()
  @IsNumber()
  balanceDue?: number;
}
