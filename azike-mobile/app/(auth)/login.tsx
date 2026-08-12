import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/services/api';
export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();

  console.log('API_BASE_URL', API_BASE_URL);
  console.log( 'identifier', identifier)
  console.log( 'password', password)

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`[Login] Attempting sign-in for: ${identifier} at ${process.env.EXPO_PUBLIC_API_URL}`);
      await login(identifier, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('[Login Error]', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
     <SafeAreaView className="flex-1">
       <View className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">A</Text>
          </View>
          <Text className="text-3xl font-bold text-primary">AZIKE</Text>
          <Text className="text-gray-500 mt-2">Community Membership</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-1">Email or Phone</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
              placeholder="sarah@example.com or 254712345678"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-1">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text className="text-error text-sm">{error}</Text>
          ) : null}

          <TouchableOpacity
            className="bg-primary rounded-lg py-4 mt-4"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity>
            <Text className="text-primary text-center mt-2">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}