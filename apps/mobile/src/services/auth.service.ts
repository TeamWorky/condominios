import { httpClient, setAuthToken } from './http.client';

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

// Authenticate the user and store the access token for subsequent requests.
export async function login(email: string, password: string): Promise<LoginResponse['data']> {
  const response = await httpClient.post<LoginResponse>('/auth/login', { email, password });
  const { accessToken, refreshToken, user } = response.data.data;
  setAuthToken(accessToken);
  return { accessToken, refreshToken, user };
}

// Remove the stored auth token (full logout is handled by the calling component).
export async function logout(refreshToken: string): Promise<void> {
  await httpClient.post('/auth/logout', { refreshToken });
  setAuthToken(null);
}

// Request a new access token using the refresh token.
export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await httpClient.post<LoginResponse>('/auth/refresh', { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  setAuthToken(accessToken);
  return { accessToken, refreshToken: newRefreshToken };
}
