export enum PaykuPaymentMethod {
  ALL = 99,
  WEBPAY = 1,
  ETPAY = 4,
  PAGO46 = 6,
  MACH = 9,
  FINTOC = 19,
  TENPO = 23,
  FLOID = 26,
  WEBPAY_PLUS_1_3 = 100,
  WEBPAY_PLUS_4_6 = 101,
  WEBPAY_PLUS_7_12 = 102,
}

export type PaykuTransactionStatus =
  | 'register'
  | 'pending'
  | 'success'
  | 'rejected';

export type PaykuGatewayStatus =
  | 'pending'
  | 'success'
  | 'rejected'
  | 'refunded partial'
  | 'refunded';

export interface CreateTransactionRequest {
  email: string;
  order: string;
  subject: string;
  amount: number;
  currency?: string;
  payment: PaykuPaymentMethod | number;
  urlreturn: string;
  urlnotify: string;
  expired?: string;
  additional_parameters?: Record<string, string>;
}

export interface TransactionCreateResponse {
  status: string;
  id: string;
  url: string;
}

export interface PaymentDetail {
  start: string;
  end: string;
  media: string;
  transaction_id: number;
  payment_key: string;
  transaction_key: string;
  deposit_date: string;
  verification_key: string;
  authorization_code: string;
  last_4_digits: string;
  installments: number;
  card_type: string;
  currency: string;
  additional_parameters?: Record<string, unknown>;
}

export interface GatewayResponse {
  status: PaykuGatewayStatus;
  message: string;
}

export interface NullifyDetail {
  status: string;
}

export interface TransactionDetailResponse {
  status: PaykuTransactionStatus;
  id: string;
  created_at: string;
  order: string;
  email: string;
  subject: string;
  amount: string;
  payment: PaymentDetail;
  nullify?: NullifyDetail;
  gateway_response: GatewayResponse;
}

export interface TransactionListResponse {
  transaction: TransactionDetailResponse[];
}

export interface TransactionListParams {
  page?: number;
  per_page?: number;
  date_init?: string;
  date_end?: string;
  success?: boolean;
  pending?: boolean;
  rejected?: boolean;
}
