import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChatRoom } from '../../components/ChatRoom';
import { chatConfigured } from '../../lib/firebase';
import { colors, themedStyles } from '../../lib/theme';

export default function ChatScreen() {
  if (!chatConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>💬</Text>
        <Text style={styles.title}>Community chat isn’t connected yet</Text>
        <Text style={styles.text}>
          Add your Firebase keys to a .env file (see .env.example and the README) and restart the app to turn on live chat.
        </Text>
      </View>
    );
  }
  return <ChatRoom />;
}

const styles = themedStyles(() => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 56 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 8, textAlign: 'center' },
  text: { color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 21 },
}));
