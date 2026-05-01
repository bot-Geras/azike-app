
import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  padding?: boolean;
}

export function Card({ children, onPress, className = '', padding = true }: CardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${padding ? 'p-4' : ''} ${className}`}
      onPress={onPress}
    >
      {children}
    </CardComponent>
  );
}