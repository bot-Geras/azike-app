import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { router } from "expo-router";
import {
  UserIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from "react-native-heroicons/outline";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          queryClient.clear();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F5F5F0]"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="bg-[#1A3C2E] pt-14 pb-16 px-6">
        <Text className="text-[#8EB89A] text-xs tracking-widest uppercase font-medium mb-1 mt-6">
          My Account
        </Text>
        <Text className="text-white text-2xl font-bold tracking-tight">
          {user?.first_name} {user?.last_name}
        </Text>
        <Text className="text-white/50 text-sm mt-1">{user?.email}</Text>
      </View>

      {/* Floating Avatar Card */}
      <View className="mx-5 -mt-8 bg-white rounded-2xl shadow-md p-4 flex-row items-center gap-4">
        <View className="w-16 h-16 rounded-full bg-[#D4E6D0] items-center justify-center border-2 border-[#8EB89A]">
          {user?.profile_picture_url ? (
            <Image
              source={{ uri: user.profile_picture_url }}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <UserIcon size={28} color="#1A3C2E" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[#1A3C2E] font-semibold text-base">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            {user?.phone_number}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-[#F0F7F1] px-3 py-1.5 rounded-full"
          onPress={() => router.push("/profile/edit")}
        >
          <Text className="text-[#1A3C2E] text-xs font-medium">Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Sections */}
      <View className="px-5 mt-6">
        {/* Account */}
        <Text className="text-[#9CA3AF] text-xs tracking-widest uppercase font-medium mb-2 ml-1">
          Account
        </Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-5">
          <MenuItem
            icon={<CreditCardIcon size={18} color="#1A3C2E" />}
            label="Payment Methods"
            onPress={() => router.push("/profile/payments")}
          />
          <MenuItem
            icon={<BellIcon size={18} color="#1A3C2E" />}
            label="Notifications"
            onPress={() => router.push("/profile/notifications")}
          />
          <MenuItem
            icon={<ShieldCheckIcon size={18} color="#1A3C2E" />}
            label="Privacy & Security"
            onPress={() => router.push("/profile/security")}
            last
          />
        </View>

        {/* Support */}
        <Text className="text-[#9CA3AF] text-xs tracking-widest uppercase font-medium mb-2 ml-1">
          Support
        </Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-5">
          <MenuItem
            icon={<QuestionMarkCircleIcon size={18} color="#1A3C2E" />}
            label="Help & Support"
            onPress={() => router.push("/profile/support")}
            last
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 flex-row items-center mb-8"
          onPress={handleLogout}
        >
          <View className="w-8 h-8 bg-[#FEE2E2] rounded-full items-center justify-center mr-3">
            <ArrowRightOnRectangleIcon size={16} color="#DC2626" />
          </View>
          <Text className="text-[#DC2626] font-semibold text-sm flex-1">
            Log out
          </Text>
          <ChevronRightIcon size={16} color="#FCA5A5" />
        </TouchableOpacity>

        <Text className="text-gray-300 text-xs text-center mb-8">
          v1.0.0 · AZIKE Community
        </Text>
      </View>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between px-4 py-3.5 ${!last ? "border-b border-gray-50" : ""}`}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center">
        <View className="w-8 h-8 bg-[#F0F7F1] rounded-full items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-[#1C1C1E] text-sm font-medium">{label}</Text>
      </View>
      <ChevronRightIcon size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
