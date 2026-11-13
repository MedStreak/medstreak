import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import type { ColorValue } from 'react-native';
import { colors } from '../../lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={icon} color={color as string} size={size} />
  ),
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={tab('Today', 'flame')} />
      <Tabs.Screen name="meds" options={tab('Meds', 'medkit')} />
      <Tabs.Screen name="calendar" options={tab('History', 'calendar')} />
      <Tabs.Screen name="goals" options={tab('Goals', 'trophy')} />
      <Tabs.Screen name="chat" options={tab('Chat', 'chatbubbles')} />
      <Tabs.Screen name="themes" options={tab('Themes', 'color-palette')} />
    </Tabs>
  );
}
