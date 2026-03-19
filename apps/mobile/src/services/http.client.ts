import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

// Shared Axios instance for all API calls.
// The Authorization header is set by auth.service.ts after login.
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach the access token to every request if available.
// The token is set via setAuthToken() after a successful login.
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

httpClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  return config;
});
