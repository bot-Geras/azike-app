
import { Tabs } from 'expo-router';
import { HomeIcon, TicketIcon, QrCodeIcon, UserIcon } from 'react-native-heroicons/outline';
import { HomeIcon as HomeSolid, TicketIcon as TicketSolid, QrCodeIcon as QrCodeSolid, UserIcon as UserSolid } from 'react-native-heroicons/solid';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => 
            focused ? <HomeSolid size={24} color={color} /> : <HomeIcon size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => 
            focused ? <TicketSolid size={24} color={color} /> : <TicketIcon size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="card"
        options={{
          title: 'My Card',
          tabBarIcon: ({ color, focused }) => 
            focused ? <QrCodeSolid size={24} color={color} /> : <QrCodeIcon size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => 
            focused ? <UserSolid size={24} color={color} /> : <UserIcon size={24} color={color} />
        }}
      />
    </Tabs>
  );
}