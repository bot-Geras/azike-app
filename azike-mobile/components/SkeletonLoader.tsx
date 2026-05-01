
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing 
} from 'react-native-reanimated';
import { useEffect } from 'react';

export function SkeletonLoader({ className }: { className?: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      className={`bg-gray-200 rounded-lg ${className}`}
      style={animatedStyle}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <View className="bg-white rounded-xl overflow-hidden mb-4">
      <SkeletonLoader className="w-full h-40" />
      <View className="p-4">
        <SkeletonLoader className="w-3/4 h-6 mb-2" />
        <SkeletonLoader className="w-1/2 h-4 mb-1" />
        <SkeletonLoader className="w-2/3 h-4 mb-3" />
        <View className="flex-row justify-between">
          <SkeletonLoader className="w-20 h-5" />
          <SkeletonLoader className="w-16 h-5" />
        </View>
      </View>
    </View>
  );
}

export function MembershipCardSkeleton() {
  return (
    <View className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6">
      <View className="flex-row justify-between mb-6">
        <View>
          <SkeletonLoader className="w-24 h-4 bg-white/20 mb-2" />
          <SkeletonLoader className="w-40 h-8 bg-white/20" />
        </View>
        <SkeletonLoader className="w-16 h-6 bg-white/20 rounded-full" />
      </View>
      <SkeletonLoader className="w-32 h-4 bg-white/20 mb-2" />
      <SkeletonLoader className="w-48 h-6 bg-white/20 mb-6" />
      <SkeletonLoader className="w-full h-20 bg-white/20 rounded-lg" />
    </View>
  );
}