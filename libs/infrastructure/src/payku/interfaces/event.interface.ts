export interface CreateEventRequest {
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  payment: number;
  urlreturn: string;
  urlnotify: string;
  additional_parameters?: Record<string, string>;
}

export interface EventResponse {
  status: string;
  id: string;
  name: string;
  url?: string;
}
