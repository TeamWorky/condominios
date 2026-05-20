export interface BankInfo {
  id: string;
  name: string;
  sbif_code: string;
}

export interface BankListResponse {
  data: BankInfo[];
}

export interface PaymentMethodInfo {
  id: number;
  name: string;
  description: string;
}

export interface PaymentMethodListResponse {
  data: PaymentMethodInfo[];
}
