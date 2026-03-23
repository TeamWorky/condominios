import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initializeAuth } from '../services/http.client';

// Root navigation layout — all screens are defined as a Stack.
// Auth screens (login) and app screens (home) are grouped in separate sub-layouts.
export default function RootLayout() {
  useEffect(() => {
    // Restore persisted token into memory before any request is made.
    initializeAuth();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
