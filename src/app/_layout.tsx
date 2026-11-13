import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { CheckInModal } from '../components/CheckInModal';
import { NotificationResponder } from '../components/NotificationResponder';
import { applyTheme, colors } from '../lib/theme';
import { AppProvider, useApp } from '../state/AppState';

/** Applies the chosen theme and remounts the screens when it changes so every colour updates. */
function Themed() {
  const { data } = useApp();
  const theme = applyTheme(data.settings.theme);
  return (
    <React.Fragment key={theme.id}>
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
    </React.Fragment>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Themed />
      </AppProvider>
    </SafeAreaProvider>
  );
}
