export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  condominios: Condominio[];
}

export interface Condominio {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  condominios: Condominio[];
  accessToken: string;
  refreshToken: string;
}

export interface SelectCondominioRequest {
  condominioId: string;
}

export interface SelectCondominioResponse {
  accessToken: string;
  refreshToken: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface AuthState {
  user: User | null;
  condominios: Condominio[];
  selectedCondominio: Condominio | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}
