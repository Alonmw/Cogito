import { Tabs } from 'expo-router';
import React from 'react';

// Import a component for icons (e.g., from expo-vector-icons or a custom one)
// For now, we'll use placeholder Text components. Replace later.
import { Text } from 'react-native';
import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed

// Placeholder Icon component - Replace with actual icons later
const TabBarIcon = ({ name, color }: { name: string; color: string }) => {
  // Replace with actual icon component like Ionicons, FontAwesome etc.
  // Example: <Ionicons name={name} size={24} color={color} />
  let iconInitial = name.charAt(0).toUpperCase();
  if (name === 'information-circle-outline') iconInitial = 'I';
  if (name === 'person-circle-outline') iconInitial = 'P';
  if (name === 'list-outline') iconInitial = 'H';
  if (name === 'chatbubble-outline') iconInitial = 'D';

  return <Text style={{ color: color, fontSize: 18, fontWeight: 'bold' }}>{iconInitial}</Text>;
};


export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tint, // Color for active tab
        tabBarInactiveTintColor: themeColors.tabIconDefault, // Color for inactive tabs
        tabBarStyle: {
          backgroundColor: themeColors.background, // Match theme background
          borderTopColor: themeColors.tabIconDefault, // Subtle border
        },
        headerShown: false, // We are using a custom header in the ChatScreen
      }}>
      {/* Dialogue/Chat Tab */}
      <Tabs.Screen
        name="index" // Corresponds to app/(tabs)/index.tsx (ChatScreen)
        options={{
          title: 'Dialogue',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} />
          ),
        }}
      />
      {/* History Tab */}
      <Tabs.Screen
        name="history" // Corresponds to app/(tabs)/history.tsx (Create this file next)
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'list' : 'list-outline'} color={color} />
          ),
        }}
      />
      {/* Info Tab */}
      <Tabs.Screen
        name="info" // Corresponds to app/(tabs)/info.tsx (Create this file next)
        options={{
          title: 'Info',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'information-circle' : 'information-circle-outline'} color={color} />
          ),
        }}
      />
      {/* Profile Tab */}
      <Tabs.Screen
        name="profile" // Corresponds to app/(tabs)/profile.tsx (Create this file next)
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
