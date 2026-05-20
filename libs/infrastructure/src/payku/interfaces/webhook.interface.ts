export interface PaykuWebhookPayload {
  transaction_id: string;
  payment_key: string;
  transaction_key: string;
  verification_key: string;
  order: string;
  status: 'success' | 'failed';
}
