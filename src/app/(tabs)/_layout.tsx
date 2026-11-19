import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { currentFontFamily } from '../../lib/fonts';
import { colors, getTheme, sceneBg } from '../../lib/theme';
import { useApp } from '../../state/AppState';

/** Cute emoji tab icons: full-color when selected, softly faded otherwise. */
const tab = (title: string, emoji: string, size = 1) => ({
  title,
  tabBarIcon: ({ focused }: { focused: boolean }) => {
    const fs = (focused ? 31 : 26) * size;
    // Fixed-height box + explicit line height + system font so emoji never get clipped by a theme font's metrics.
    return (
      <View style={{ height: 42, minWidth: 42, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'System', fontSize: fs, lineHeight: Math.round(fs * 1.3), includeFontPadding: false, textAlign: 'center', opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
      </View>
    );
  },
});

export default function TabsLayout() {
  const { data } = useApp();
  const insets = useSafeAreaInsets();
  const mascot = getTheme(data.settings.theme).mascot;
  const ic = data.settings.tabIcons ?? {};
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 12, fontFamily: currentFontFamily() },
        headerStyle: { backgroundColor: sceneBg() },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: colors.text, fontFamily: currentFontFamily() },
        sceneStyle: { backgroundColor: sceneBg() },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 76 + insets.bottom, paddingTop: 6, paddingBottom: 8 + insets.bottom },
      }}
    >
      <Tabs.Screen name="index" options={tab('Today', ic.index || mascot)} />
      <Tabs.Screen name="meds" options={tab('Meds', ic.meds || '💊')} />
      <Tabs.Screen name="calendar" options={tab('History', ic.calendar || '🗓️')} />
      <Tabs.Screen name="goals" options={tab('Goals', ic.goals || '🏆')} />
      <Tabs.Screen name="chat" options={tab('Cheers', ic.chat || '🦄')} />
      <Tabs.Screen name="themes" options={tab('Themes', ic.themes || '🎨')} />
    </Tabs>
  );
}
