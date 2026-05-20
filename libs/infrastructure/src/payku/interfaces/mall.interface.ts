export interface CreateMallTransactionRequest {
  email: string;
  order: string;
  subject: string;
  amount: number;
  currency?: string;
  payment: number;
  urlreturn: string;
  urlnotify: string;
  stores: MallStore[];
  additional_parameters?: Record<string, string>;
}

export interface MallStore {
  store_id: string;
  amount: number;
  order: string;
  subject: string;
}

export interface MallTransactionResponse {
  status: string;
  id: string;
  url: string;
}
