import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BackgroundImage } from '../components/BackgroundImage';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { CheckInModal } from '../components/CheckInModal';
import { CrashPrompt } from '../components/CrashPrompt';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeFx } from '../components/ThemeFx';
import { installCrashHandler } from '../lib/crash';
import { currentFontFamily, fontMap, installTextFont, setCurrentFont, type FontKey } from '../lib/fonts';
import { NotificationResponder } from '../components/NotificationResponder';
import { applyLook, colors, sceneBg } from '../lib/theme';
import { AppProvider, useApp } from '../state/AppState';

installCrashHandler();
installTextFont();

/** Applies the chosen theme and remounts the screens when it changes so every colour updates. */
function Themed() {
  const { data } = useApp();
  const { theme: themeId, accent, corners, customTheme, particle, bgImage, bgDim, bgSeeThrough } = data.settings;
  const theme = applyLook({ theme: themeId, accent, corners, custom: customTheme, bgImage: !!bgImage, seeThrough: bgSeeThrough });
  setCurrentFont((theme.font as FontKey | undefined) ?? null);
  const particleId = particle ?? theme.particle ?? null;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
    {bgImage ? <BackgroundImage uri={bgImage} dim={bgDim ?? 25} /> : null}
    <React.Fragment key={`${theme.id}|${accent ?? ''}|${corners}|${themeId === 'custom' ? JSON.stringify(customTheme) : ''}|${bgImage ? (bgSeeThrough ? 'bgs' : 'bg') : ''}`}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerTintColor: colors.text, headerTitleStyle: { color: colors.text, fontFamily: currentFontFamily() }, contentStyle: { backgroundColor: sceneBg() } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="creator"
          options={{ title: 'Creator', headerStyle: { backgroundColor: sceneBg() }, headerTitleStyle: { color: colors.text, fontFamily: currentFontFamily() } }}
        />
        <Stack.Screen
          name="profile"
          options={{ title: 'Profile', headerStyle: { backgroundColor: sceneBg() }, headerTitleStyle: { color: colors.text, fontFamily: currentFontFamily() } }}
        />
        <Stack.Screen
          name="profile-edit"
          options={{ title: 'Edit profile', headerStyle: { backgroundColor: sceneBg() }, headerTitleStyle: { color: colors.text, fontFamily: currentFontFamily() } }}
        />
        <Stack.Screen
          name="checkin"
          options={{ presentation: 'modal', title: 'Check-in', contentStyle: { backgroundColor: colors.bg }, headerStyle: { backgroundColor: colors.bg }, headerTitleStyle: { color: colors.text, fontFamily: currentFontFamily() } }}
        />
        <Stack.Screen
          name="emergency"
          options={{ title: 'Emergency card', headerStyle: { backgroundColor: sceneBg() }, headerTitleStyle: { color: colors.text, fontFamily: currentFontFamily() } }}
        />
        <Stack.Screen
          name="med-form"
          options={{
            presentation: 'modal',
            title: 'Medication',
            contentStyle: { backgroundColor: colors.bg },
            headerStyle: { backgroundColor: colors.bg },
            headerTitleStyle: { color: colors.text, fontFamily: currentFontFamily() },
          }}
        />
      </Stack>
      <NotificationResponder />
      <CheckInModal />
      <CelebrationOverlay />
      <ThemeFx fx={theme.fx} particle={particleId} speed={theme.speed ?? 1} />
      <CrashPrompt />
    </React.Fragment>
    </View>
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
