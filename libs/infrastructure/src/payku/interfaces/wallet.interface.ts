export interface WalletTransferRequest {
  email: string;
  phone: string;
  subject: string;
  currency: string;
  order: string;
  amount: number;
  accountbank_name: string;
  accountbank_rut: string;
  accountbank_sbif: string;
  accountbank_type: string;
  accountbank_num: string;
  url_notify?: string;
  additional_parameters?: Record<string, string>;
}

export interface WalletTransferResponse {
  status: string;
  id: string;
  message?: string;
}

export interface WalletPayoutRequest extends WalletTransferRequest {}
export interface WalletPayoutResponse extends WalletTransferResponse {}

export interface WalletWithdrawRequest extends WalletTransferRequest {}
export interface WalletWithdrawResponse extends WalletTransferResponse {}

export interface WalletBalanceResponse {
  balance: number;
  currency: string;
}

export interface WalletListResponse {
  data: WalletDetailResponse[];
}

export interface WalletDetailResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
}

export interface PayoutDetailResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
}
