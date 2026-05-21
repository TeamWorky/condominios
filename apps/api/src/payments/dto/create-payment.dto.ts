import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsString,
  IsNumber,
  IsPositive,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@condominios/shared/enums/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ example: 150000, description: 'Payment amount (must be positive)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: '2026-01', description: 'Billing period in YYYY-MM format' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Period must be in YYYY-MM format',
  })
  period: string;

  @ApiProperty({ example: '2026-01-31', description: 'Payment due date' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.TRANSFER,
    description: 'Payment method',
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'TRX-001', description: 'Payment reference number' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  reference?: string;

  @ApiPropertyOptional({ example: 'Monthly maintenance fee', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unit ID (set automatically from URL param)' })
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Resident ID (optional)',
  })
  @IsUUID()
  @IsOptional()
  residentId?: string;
}
