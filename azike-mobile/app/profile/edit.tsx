import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { UserIcon, CameraIcon } from 'react-native-heroicons/outline';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    id_number: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.first_name || form.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }
    if (!form.last_name || form.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!form.phone_number || !/^254[17]\d{8}$/.test(form.phone_number)) {
      newErrors.phone_number = 'Valid phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await api.put('/auth/profile', form);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-5">
        {/* Profile Image */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage} className="relative">
            <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center">
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-24 h-24 rounded-full" />
              ) : user?.profile_picture_url ? (
                <Image source={{ uri: user.profile_picture_url }} className="w-24 h-24 rounded-full" />
              ) : (
                <UserIcon size={40} color="#2E7D32" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center">
              <CameraIcon size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm mt-2">Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-gray-700 mb-1">First Name</Text>
              <TextInput
                className={`bg-white border rounded-lg px-4 py-3 text-base ${
                  errors.first_name ? 'border-error' : 'border-gray-300'
                }`}
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
                className={`bg-white border rounded-lg px-4 py-3 text-base ${
                  errors.last_name ? 'border-error' : 'border-gray-300'
                }`}
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
              className={`bg-white border rounded-lg px-4 py-3 text-base ${
                errors.email ? 'border-error' : 'border-gray-300'
              }`}
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text className="text-error text-xs mt-1">{errors.email}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-700 mb-1">Phone Number</Text>
            <TextInput
              className={`bg-white border rounded-lg px-4 py-3 text-base ${
                errors.phone_number ? 'border-error' : 'border-gray-300'
              }`}
              value={form.phone_number}
              onChangeText={(text) => setForm({ ...form, phone_number: text })}
              keyboardType="phone-pad"
            />
            {errors.phone_number && (
              <Text className="text-error text-xs mt-1">{errors.phone_number}</Text>
            )}
          </View>

          <View>
            <Text className="text-gray-700 mb-1">ID Number (Optional)</Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
              value={form.id_number}
              onChangeText={(text) => setForm({ ...form, id_number: text })}
              placeholder="National ID or Passport"
            />
          </View>
        </View>

        <TouchableOpacity
          className={`rounded-lg py-4 mt-8 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}