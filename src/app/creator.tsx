import React from 'react';
import { Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card } from '../components/ui';
import { colors, themedStyles } from '../lib/theme';

/** Why MedStreak exists, in the creator's own words. */
const CREATOR_STORY = [
  'Why did I create MedStreak? Honestly because I needed it. I struggle personally ALOT when it comes to medication management, reminding myself to take my meds etc. The whole goal was to create something extremely useful but still make it fun, something I\u2019d look forward to opening daily.',
  'This app is FREE for anyone with an ANDROID device & eventually I\u2019d love to have it uploaded to the Google Play App Store.. But it all comes at a cost. Regardless, with that in mind, this app was created to be CUSTOMIZED. I personally hate how boring most apps seem and look. Just truly gag worthy grey.',
  'I figured if I could really use this app maybe someone else could too! So that\u2019s the mission now: to spread the word, the peace & love! \u270c\ufe0f',
];

export default function CreatorScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>💊</Text>
      <Text style={styles.title}>Why I made MedStreak</Text>
      <Card>
        {CREATOR_STORY.map((para, i) => (
          <Text key={i} style={[styles.body, i > 0 && { marginTop: 12 }]}>{para}</Text>
        ))}
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
