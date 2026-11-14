import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { saveCrash } from '../lib/crash';
import { colors } from '../lib/theme';

interface State {
  failed: boolean;
}

/** Catches screen errors so the app shows a friendly message instead of closing. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    saveCrash(error, false);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 56 }}>😵‍💫</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 8 }}>Something went wrong</Text>
        <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 21 }}>
          Your medications and streaks are safe. Tap below to try again. You’ll be offered a chance to send a report next time you open the app.
        </Text>
        <Pressable
          onPress={() => this.setState({ failed: false })}
          style={{ backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16, marginTop: 20 }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
