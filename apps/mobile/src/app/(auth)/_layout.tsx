import { Stack } from 'expo-router';

// Auth stack layout — contains the login screen.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
