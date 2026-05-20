export type PaykuNullificationStatus =
  | 'pending'
  | 'awaiting_funds'
  | 'waiting_bank_details'
  | 'complete'
  | 'reverse_deleted'
  | 'reverse_completed';

export interface CreateNullificationRequest {
  id: string;
  amount: number;
  subject: string;
}

export interface NullificationResponse {
  status: PaykuNullificationStatus;
  id: string;
}
