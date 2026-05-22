import { IsString, IsIn, IsUUID, Length } from 'class-validator';

export class PaykuWebhookDto {
  @IsString()
  @Length(1, 255)
  transaction_id: string;

  @IsString()
  @Length(1, 255)
  payment_key: string;

  @IsString()
  @Length(1, 255)
  transaction_key: string;

  @IsString()
  @Length(1, 255)
  verification_key: string;

  @IsUUID()
  order: string;

  @IsIn(['success', 'failed'])
  status: 'success' | 'failed';
}
