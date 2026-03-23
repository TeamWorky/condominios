import { httpClient, persistTokens, clearTokens } from './http.client';

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

// Authenticate the user and persist both tokens to secure storage.
export async function login(email: string, password: string): Promise<LoginResponse['data']> {
  const response = await httpClient.post<LoginResponse>('/auth/login', { email, password });
  const { accessToken, refreshToken, user } = response.data.data;
  await persistTokens(accessToken, refreshToken);
  return { accessToken, refreshToken, user };
}

// Invalidate the session on the server and clear all stored tokens.
export async function logout(refreshToken: string): Promise<void> {
  await httpClient.post('/auth/logout', { refreshToken });
  await clearTokens();
}

// Request a new access token using the refresh token.
export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await httpClient.post<LoginResponse>('/auth/refresh', { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  await persistTokens(accessToken, newRefreshToken);
  return { accessToken, refreshToken: newRefreshToken };
}
