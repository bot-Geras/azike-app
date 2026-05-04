
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function AuthLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) return null;

  // if (isAuthenticated) {
  //   return <Redirect href="/(tabs)" />;
  // }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
