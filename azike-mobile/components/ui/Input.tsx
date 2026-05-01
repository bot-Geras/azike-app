
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 mb-1 font-medium">{label}</Text>
      )}
      <TextInput
        className={`border rounded-lg px-4 py-3 text-base ${
          error ? 'border-error bg-red-50' : 'border-gray-300 bg-white'
        } ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-error text-xs mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-gray-400 text-xs mt-1">{hint}</Text>
      )}
    </View>
  );
}