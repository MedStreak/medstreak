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
import { NotificationResponder } from '../components/NotificationResponder';
import { applyLook, colors } from '../lib/theme';
import { AppProvider, useApp } from '../state/AppState';

installCrashHandler();

/** Applies the chosen theme and remounts the screens when it changes so every colour updates. */
function Themed() {
  const { data } = useApp();
  const { theme: themeId, accent, corners } = data.settings;
  const theme = applyLook({ theme: themeId, accent, corners });
  return (
    <React.Fragment key={`${theme.id}|${accent ?? ''}|${corners}`}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      <ThemeFx fx={theme.fx} />
      <CrashPrompt />
    </React.Fragment>
  );
}

export default function RootLayout() {
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
