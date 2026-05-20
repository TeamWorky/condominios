export interface CreateSubscriptionClientRequest {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  country?: string;
  region?: string;
  city?: string;
  postal_code?: string;
  additional_parameters?: Record<string, string>;
}

export interface SubscriptionClientResponse {
  status: string;
  id: string;
  email: string;
  name: string;
}

export interface SubscriptionClientListResponse {
  data: SubscriptionClientResponse[];
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  trial_period_days?: number;
}

export interface SubscriptionPlanResponse {
  status: string;
  id: string;
  name: string;
  amount: number;
  currency: string;
}

export interface SubscriptionPlanListResponse {
  data: SubscriptionPlanResponse[];
}

export interface CreateSubscriptionRequest {
  client_id: string;
  plan_id: string;
  additional_parameters?: Record<string, string>;
}

export interface SubscriptionResponse {
  status: string;
  id: string;
  client_id: string;
  plan_id: string;
}

export interface CreateSubscriptionTransactionRequest {
  subscription_id: string;
  amount?: number;
  additional_parameters?: Record<string, string>;
}

export interface SubscriptionTransactionResponse {
  status: string;
  id: string;
  subscription_id: string;
  amount: number;
}
