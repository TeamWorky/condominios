import { IsString, IsIn, IsUUID, Length } from 'class-validator';
import { PaykuWebhookPayload } from '@condominios/infrastructure/payku/interfaces/webhook.interface';

export class PaykuWebhookDto implements PaykuWebhookPayload {
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
