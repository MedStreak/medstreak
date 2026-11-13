import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { colors, getTheme } from '../../lib/theme';
import { useApp } from '../../state/AppState';

/** Cute emoji tab icons: full-color when selected, softly faded otherwise. */
const tab = (title: string, emoji: string) => ({
  title,
  tabBarIcon: ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: focused ? 28 : 23, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
  ),
});

export default function TabsLayout() {
  const { data } = useApp();
  const mascot = getTheme(data.settings.theme).mascot;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: '700' },
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={tab('Today', mascot)} />
      <Tabs.Screen name="meds" options={tab('Meds', '💊')} />
      <Tabs.Screen name="calendar" options={tab('History', '🗓️')} />
      <Tabs.Screen name="goals" options={tab('Goals', '🏆')} />
      <Tabs.Screen name="chat" options={tab('Chat', '💬')} />
      <Tabs.Screen name="themes" options={tab('Themes', '🎨')} />
    </Tabs>
  );
}
