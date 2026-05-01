
import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuth();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.first_name || form.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }
    if (!form.last_name || form.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!form.phone_number || !/^254[17]\d{8}$/.test(form.phone_number)) {
      newErrors.phone_number = 'Invalid format. Use 2547XXXXXXXX';
    }
    if (!form.password || form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (form.password !== form.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form);
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please log in to continue.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-primary rounded-full items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">A</Text>
          </View>
          <Text className="text-2xl font-bold text-primary">Join AZIKE</Text>
          <Text className="text-gray-500 mt-1">Create your membership account</Text>
        </View>

        <View className="space-y-4">
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-gray-700 mb-1">First Name</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-base ${
                  errors.first_name ? 'border-error' : 'border-gray-300'
                }`}
                placeholder="Sarah"
                value={form.first_name}
                onChangeText={(text) => setForm({ ...form, first_name: text })}
              />
              {errors.first_name && (
                <Text className="text-error text-xs mt-1">{errors.first_name}</Text>
              )}
            </View>
            
            <View className="flex-1">
              <Text className="text-gray-700 mb-1">Last Name</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-base ${
                  errors.last_name ? 'border-error' : 'border-gray-300'
                }`}
                placeholder="Mwangi"
                value={form.last_name}
                onChangeText={(text) => setForm({ ...form, last_name: text })}
              />
              {errors.last_name && (
                <Text className="text-error text-xs mt-1">{errors.last_name}</Text>
              )}
            </View>
          </View>

          <View>
            <Text className="text-gray-700 mb-1">Email</Text>
            <TextInput
              className={`border rounded-lg px-4 py-3 text-base ${
                errors.email ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="sarah@example.com"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text className="text-error text-xs mt-1">{errors.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-700 mb-1">Phone Number</Text>
            <TextInput
              className={`border rounded-lg px-4 py-3 text-base ${
                errors.phone_number ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="254712345678"
              value={form.phone_number}
              onChangeText={(text) => setForm({ ...form, phone_number: text })}
              keyboardType="phone-pad"
            />
            {errors.phone_number && (
              <Text className="text-error text-xs mt-1">{errors.phone_number}</Text>
            )}
            <Text className="text-gray-400 text-xs mt-1">
              Format: 254 followed by 7XXXXXXXX
            </Text>
          </View>

          <View>
            <Text className="text-gray-700 mb-1">Password</Text>
            <TextInput
              className={`border rounded-lg px-4 py-3 text-base ${
                errors.password ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="Minimum 8 characters"
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              secureTextEntry
            />
            {errors.password && (
              <Text className="text-error text-xs mt-1">{errors.password}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-700 mb-1">Confirm Password</Text>
            <TextInput
              className={`border rounded-lg px-4 py-3 text-base ${
                errors.confirm_password ? 'border-error' : 'border-gray-300'
              }`}
              placeholder="Re-enter your password"
              value={form.confirm_password}
              onChangeText={(text) => setForm({ ...form, confirm_password: text })}
              secureTextEntry
            />
            {errors.confirm_password && (
              <Text className="text-error text-xs mt-1">{errors.confirm_password}</Text>
            )}
          </View>

          <TouchableOpacity
            className="bg-primary rounded-lg py-4 mt-6"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-gray-400 text-xs text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}