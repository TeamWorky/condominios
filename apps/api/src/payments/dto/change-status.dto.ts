import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@condominios/shared/enums/payment-status.enum';
import { PaymentMethod } from '@condominios/shared/enums/payment-method.enum';

export class ChangeStatusDto {
  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: 'Target payment status',
  })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.TRANSFER,
    description: 'Payment method (recommended when marking as PAID)',
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    example: 'TRX-001',
    description: 'Payment reference or receipt number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  reference?: string;
}
