
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false,
  icon,
  className = ''
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-primary',
    secondary: 'bg-gray-500',
    outline: 'bg-transparent border-2 border-primary',
    danger: 'bg-error'
  };

  const variantTextStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary',
    danger: 'text-white'
  };

  return (
    <TouchableOpacity
      className={`rounded-lg py-4 px-6 flex-row items-center justify-center ${
        variantStyles[variant]
      } ${disabled || loading ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2E7D32' : 'white'} />
      ) : (
        <View className="flex-row items-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-semibold text-base ${variantTextStyles[variant]}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}