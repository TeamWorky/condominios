import { IsString, IsIn } from 'class-validator';

export class PaykuWebhookDto {
  @IsString()
  transaction_id: string;

  @IsString()
  payment_key: string;

  @IsString()
  transaction_key: string;

  @IsString()
  verification_key: string;

  @IsString()
  order: string;

  @IsIn(['success', 'failed'])
  status: 'success' | 'failed';
}
