import React from 'react';
import { Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card } from '../components/ui';
import { colors, themedStyles } from '../lib/theme';

/** Why MedStreak exists. The story text is written by the creator; update CREATOR_STORY below. */
const CREATOR_STORY =
  'This page is waiting for the creator to tell the story of why MedStreak was made. It will be added in an upcoming update.';

export default function CreatorScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>💊</Text>
      <Text style={styles.title}>Why I made MedStreak</Text>
      <Card>
        <Text style={styles.body}>{CREATOR_STORY}</Text>
      </Card>
      <Card>
        <Text style={styles.name}>Made by NesrynAstraRose</Text>
        <Text style={styles.body}>Free, with no ads and no fees. Built to help people keep up with their medications.</Text>
        <Button title="Say hi" style={{ marginTop: 12 }} onPress={() => Linking.openURL('mailto:simlusion@gmail.com').catch(() => {})} />
      </Card>
    </ScrollView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    content: { padding: 16, paddingBottom: 48 },
    emoji: { fontSize: 54, textAlign: 'center', marginTop: 8 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 },
    name: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
    body: { color: colors.text, fontSize: 16, lineHeight: 24 },
  }),
);
