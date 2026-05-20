export interface CreateMarketplaceClientRequest {
  email: string;
  name: string;
  phone?: string;
  rut?: string;
  additional_parameters?: Record<string, string>;
}

export interface MarketplaceClientResponse {
  status: string;
  id: string;
  email: string;
  name: string;
}

export interface CreateMarketplaceAffiliationRequest {
  client_id: string;
  percentage: number;
  additional_parameters?: Record<string, string>;
}

export interface MarketplaceAffiliationResponse {
  status: string;
  id: string;
  client_id: string;
  percentage: number;
}
