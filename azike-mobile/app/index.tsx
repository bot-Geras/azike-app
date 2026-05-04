
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  
  if (!isHydrated) {
    return null; // Or a loading spinner
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/(tabs)" />;
}