import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api.config';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// In-memory cache of the access token to avoid async reads on every request.
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

// Persist both tokens to secure storage and update the in-memory cache.
export async function persistTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  authToken = accessToken;
}

// Remove both tokens from secure storage and clear the in-memory cache.
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  authToken = null;
}

// Load the persisted access token into memory on app startup.
export async function initializeAuth(): Promise<void> {
  authToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 30s timeout accounts for slow mobile connections (3G/4G).
  timeout: 30000,
});

httpClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  return config;
});

// Attempt a silent token refresh on 401 responses before failing the request.
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!storedRefresh) {
          await clearTokens();
          return Promise.reject(error);
        }
        // Use plain axios (not httpClient) to avoid triggering this interceptor again.
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: storedRefresh,
        });
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
        await persistTokens(accessToken, newRefreshToken);
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return httpClient.request(originalRequest);
      } catch {
        await clearTokens();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
