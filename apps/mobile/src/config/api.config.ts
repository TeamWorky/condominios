// API base URL injected at build time via EXPO_PUBLIC_API_URL.
// Defaults to localhost for iOS simulator and Expo Go on the same network.
// Android emulators must use http://10.0.2.2:3000/api/v1 instead.
export const API_BASE_URL =
  process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000/api/v1';
