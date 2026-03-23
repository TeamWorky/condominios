import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Guard: redirect unauthenticated users to login before rendering app screens.
export default function AppLayout() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('access_token').then((token) => {
      setIsAuthenticated(!!token);
      setIsChecking(false);
    });
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
