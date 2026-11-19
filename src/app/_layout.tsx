import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { CheckInModal } from '../components/CheckInModal';
import { CrashPrompt } from '../components/CrashPrompt';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeFx } from '../components/ThemeFx';
import { installCrashHandler } from '../lib/crash';
import { fontMap, installTextFont, setCurrentFont, type FontKey } from '../lib/fonts';
import { NotificationResponder } from '../components/NotificationResponder';
import { applyLook, colors } from '../lib/theme';
import { AppProvider, useApp } from '../state/AppState';

installCrashHandler();
installTextFont();

/** Applies the chosen theme and remounts the screens when it changes so every colour updates. */
function Themed() {
  const { data } = useApp();
  const { theme: themeId, accent, corners, customTheme, particle } = data.settings;
  const theme = applyLook({ theme: themeId, accent, corners, custom: customTheme });
  setCurrentFont((theme.font as FontKey | undefined) ?? null);
  const particleId = particle ?? theme.particle ?? null;
  return (
    <React.Fragment key={`${theme.id}|${accent ?? ''}|${corners}|${themeId === 'custom' ? JSON.stringify(customTheme) : ''}`}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="creator"
          options={{ title: 'Creator', headerStyle: { backgroundColor: colors.bg }, headerTitleStyle: { color: colors.text } }}
        />
        <Stack.Screen
          name="profile"
          options={{ title: 'Profile', headerStyle: { backgroundColor: colors.bg }, headerTitleStyle: { color: colors.text } }}
        />
        <Stack.Screen
          name="profile-edit"
          options={{ title: 'Edit profile', headerStyle: { backgroundColor: colors.bg }, headerTitleStyle: { color: colors.text } }}
        />
        <Stack.Screen
          name="med-form"
          options={{
            presentation: 'modal',
            title: 'Medication',
            headerStyle: { backgroundColor: colors.bg },
            headerTitleStyle: { color: colors.text },
          }}
        />
      </Stack>
      <NotificationResponder />
      <CheckInModal />
      <CelebrationOverlay />
      <ThemeFx fx={theme.fx} particle={particleId} speed={theme.speed ?? 1} />
      <CrashPrompt />
    </React.Fragment>
  );
}

export default function RootLayout() {
  const [fontsReady, fontError] = useFonts(fontMap());
  if (!fontsReady && !fontError) return null;
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <Themed />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
