import { Stack } from 'expo-router';

// Root navigation layout — all screens are defined as a Stack.
// Auth screens (login) and app screens (home) are grouped in separate sub-layouts.
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
