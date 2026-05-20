export interface ConciliationParams {
  date_init?: string;
  date_end?: string;
  page?: number;
  per_page?: number;
}

export interface ConciliationResponse {
  data: ConciliationRecord[];
}

export interface ConciliationRecord {
  id: string;
  transaction_id: string;
  amount: number;
  status: string;
  created_at: string;
}
