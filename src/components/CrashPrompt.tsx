import React, { useEffect, useState } from 'react';
import { Linking, Modal, Share, StyleSheet, Text, View } from 'react-native';
import { clearCrash, formatReport, githubIssueUrl, loadCrash, type CrashReport } from '../lib/crash';
import { colors, radius, themedStyles } from '../lib/theme';
import { Button } from './ui';

/** After a crash, offers to share the report. Nothing leaves the phone unless the person taps a button. */
export function CrashPrompt() {
  const [report, setReport] = useState<CrashReport | null>(null);
  useEffect(() => {
    loadCrash().then(setReport);
  }, []);
  if (!report) return null;
  const close = () => {
    clearCrash();
    setReport(null);
  };
  return (
    <Modal transparent animationType="fade" visible onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🛠️</Text>
          <Text style={styles.title}>MedStreak hit a problem</Text>
          <Text style={styles.text}>
            Sorry about that! Sending the report helps get it fixed. It has no medication or personal info, just the error and your app version.
          </Text>
          <Button title="Share report" onPress={() => Share.share({ message: formatReport(report) }).finally(close)} />
          <Button
            title="Report on GitHub (public)"
            kind="secondary"
            onPress={() => {
              Linking.openURL(githubIssueUrl(report));
              close();
            }}
            style={{ marginTop: 8 }}
          />
          <Button title="No thanks" kind="secondary" onPress={close} style={{ marginTop: 8 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(43,34,51,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 24, width: '100%', maxWidth: 380 },
    emoji: { fontSize: 44, textAlign: 'center' },
    title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 },
    text: { color: colors.muted, textAlign: 'center', lineHeight: 21, marginBottom: 16 },
  }),
);
