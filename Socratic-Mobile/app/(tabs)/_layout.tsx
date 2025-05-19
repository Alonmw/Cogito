// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';

// --- Import an icon set ---
import { Ionicons } from '@expo/vector-icons'; // Example: Using Ionicons
// --- End Import ---

import { Colors } from '@/src/constants/Colors'; // Adjust path if needed
import { useColorScheme } from '@/src/hooks/useColorScheme'; // Adjust path if needed
import { Platform } from 'react-native'; // For platform-specific styling

// Updated TabBarIcon component
const TabBarIcon = ({ name, color, focused }: { name: any; color: string; focused: boolean }) => {
  // Use the 'any' type for name initially, or a more specific IoniconsName type if you import it.
  // Add a focused prop to potentially use different icons for active state.
  return <Ionicons name={name} size={28} color={color} />;
};

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopColor: themeColors.tabIconDefault, // Subtle border
          borderTopWidth: StyleSheet.hairlineWidth, // Use hairline for a thin border
          // Add some shadow for iOS for a bit of depth (optional)
          ...(Platform.OS === 'ios' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -1 }, // Shadow on top
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }),
          // For Android, elevation can be used (optional)
          ...(Platform.OS === 'android' && {
            elevation: 0,
          }),
        },
        headerShown: false, // We are using a custom header in the ChatScreen
        tabBarShowLabel: false, // Set to false if you only want icons
      }}>
      {/* Dialogue/Chat Tab */}
      <Tabs.Screen
        name="index" // Corresponds to app/(tabs)/index.tsx (ChatScreen)
        options={{
          title: 'Dialogue',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} focused={focused} />
          ),
        }}
      />
      {/* History Tab */}
      <Tabs.Screen
        name="history" // Corresponds to app/(tabs)/history.tsx
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'list-circle' : 'list-circle-outline'} color={color} focused={focused} />
          ),
        }}
      />
      {/* Info Tab */}
      <Tabs.Screen
        name="info" // Corresponds to app/(tabs)/info.tsx
        options={{
          title: 'Info',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'information-circle' : 'information-circle-outline'} color={color} focused={focused}/>
          ),
        }}
      />
      {/* Profile Tab */}
      <Tabs.Screen
        name="profile" // Corresponds to app/(tabs)/profile.tsx
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} focused={focused}/>
          ),
        }}
      />
    </Tabs>
  );
}

