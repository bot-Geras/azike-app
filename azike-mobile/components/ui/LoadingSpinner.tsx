
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({ 
  message, 
  size = 'large', 
  color = '#2E7D32' 
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 justify-center items-center p-5">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-gray-500 mt-3 text-center">{message}</Text>
      )}
    </View>
  );
}