import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { checkForUpdate, dismissUpdate, dismissedVersion, downloadAndInstall, type UpdateInfo } from '../lib/update';
import { colors, radius, themedStyles } from '../lib/theme';

/** Shows "new version available" with a one-tap download. Android only; checks GitHub Releases. */
export function UpdateBanner() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const check = useCallback(async () => {
    const u = await checkForUpdate();
    if (u && (await dismissedVersion()) !== u.version) setInfo(u);
    else setInfo(null);
  }, []);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => sub.remove();
  }, [check]);

  if (!info) return null;
  return (
    <View style={styles.box}>
      <Text style={styles.title}>🎉 MedStreak {info.version} is ready!</Text>
      <Text style={styles.sub}>Tap Update now. When Android asks, press Install. Your data stays.</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.btn, progress !== null && { opacity: 0.6 }]}
          disabled={progress !== null}
          onPress={async () => {
            setProgress(0);
            try {
              await downloadAndInstall(info.url, setProgress);
            } catch {
              // Couldn't download here (offline, or the phone blocked it): fall back to the browser download.
              Linking.openURL(info.url).catch(() => {});
            } finally {
              setProgress(null);
            }
          }}
        >
          <Text style={styles.btnText}>{progress === null ? 'Update now' : `Downloading ${Math.round(progress * 100)}%`}</Text>
        </Pressable>
        <Pressable
          style={styles.later}
          onPress={() => {
            dismissUpdate(info.version);
            setInfo(null);
          }}
        >
          <Text style={styles.laterText}>Later</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    box: { backgroundColor: colors.chipBg, borderRadius: radius.md, borderWidth: 2, borderColor: colors.primary, padding: 14, marginBottom: 12 },
    title: { fontSize: 16, fontWeight: '800', color: colors.text },
    sub: { color: colors.muted, marginTop: 4, lineHeight: 19 },
    row: { flexDirection: 'row', gap: 10, marginTop: 10 },
    btn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 22 },
    btnText: { color: '#fff', fontWeight: '800' },
    later: { paddingVertical: 10, paddingHorizontal: 14 },
    laterText: { color: colors.muted, fontWeight: '700' },
  }),
);
