import React, { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { checkNow, currentVersion, downloadAndInstall, type UpdateInfo } from '../lib/update';
import { colors, radius, themedStyles } from '../lib/theme';

const RELEASES = 'https://github.com/MedStreak/medstreak/releases/latest';

/** Permanent "Updates" card: shows the installed version and lets people check and install on demand. */
export function UpdatesCard() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const check = async () => {
    setBusy(true);
    setMsg(null);
    setInfo(null);
    const r = await checkNow();
    setBusy(false);
    if (r === 'current') setMsg("You're on the latest version. 🎉");
    else if (r === 'error') setMsg("Couldn't reach the update server. Check your internet and try again.");
    else setInfo(r);
  };

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.box}>
        <Text style={styles.title}>Updates</Text>
        <Text style={styles.sub}>MedStreak {currentVersion()}</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Updates</Text>
      <Text style={styles.sub}>You have MedStreak {currentVersion()}. Updates are free and keep all your data.</Text>
      {msg ? <Text style={styles.msg}>{msg}</Text> : null}
      {info ? <Text style={styles.msg}>🎉 Version {info.version} is ready to install.</Text> : null}
      <View style={styles.row}>
        {info ? (
          <Pressable
            style={[styles.btn, progress !== null && { opacity: 0.6 }]}
            disabled={progress !== null}
            onPress={async () => {
              setProgress(0);
              try {
                await downloadAndInstall(info.url, setProgress);
              } catch {
                Linking.openURL(info.url).catch(() => Linking.openURL(RELEASES).catch(() => {}));
              } finally {
                setProgress(null);
              }
            }}
          >
            <Text style={styles.btnText}>{progress === null ? 'Update now' : `Downloading ${Math.round(progress * 100)}%`}</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.btn, busy && { opacity: 0.6 }]} disabled={busy} onPress={check}>
            <Text style={styles.btnText}>{busy ? 'Checking…' : 'Check for updates'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    box: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 12 },
    title: { fontSize: 16, fontWeight: '800', color: colors.text },
    sub: { color: colors.muted, marginTop: 4, lineHeight: 19 },
    msg: { color: colors.text, marginTop: 8, fontWeight: '600' },
    row: { flexDirection: 'row', gap: 10, marginTop: 10 },
    btn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 22 },
    btnText: { color: '#fff', fontWeight: '800' },
  }),
);
