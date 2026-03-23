// API base URL injected at build time via EXPO_PUBLIC_API_URL.
// Defaults to localhost for iOS simulator and Expo Go on the same network.
// Android emulators must use http://10.0.2.2:3000/api/v1 instead.
const envUrl = process.env['EXPO_PUBLIC_API_URL'];

if (envUrl === 'undefined' || envUrl === 'null') {
  throw new Error('EXPO_PUBLIC_API_URL is set to the string "undefined" or "null". Check your .env file.');
}

if (envUrl && !envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
  throw new Error(`EXPO_PUBLIC_API_URL must start with http:// or https://. Got: ${envUrl}`);
}

export const API_BASE_URL = envUrl || 'http://localhost:3000/api/v1';
