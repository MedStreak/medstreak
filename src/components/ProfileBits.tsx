import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, themedStyles } from '../lib/theme';
import { KOFI_URL } from '../lib/social';

export function Avatar({
  uri,
  size = 44,
  shape = 'circle',
  ring,
  name,
}: {
  uri?: string | null;
  size?: number;
  shape?: string;
  ring?: string;
  name?: string;
}) {
  const r = shape === 'square' ? size * 0.12 : shape === 'squircle' ? size * 0.32 : size / 2;
  const border = ring ? { borderWidth: Math.max(2, size / 22), borderColor: ring } : null;
  return (
    <View style={[{ width: size, height: size, borderRadius: r, backgroundColor: colors.chipBg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, border]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ fontSize: size * 0.42, fontWeight: '800', color: colors.muted }}>{(name || '🙂').trim().slice(0, 1).toUpperCase()}</Text>
      )}
    </View>
  );
}

/** The recognition title only the app's creator carries. Decided by the server, never by the profile itself. */
export function CreatorBadge({ big }: { big?: boolean }) {
  return (
    <View style={[styles.badge, big && { paddingVertical: 6, paddingHorizontal: 12 }]}>
      <Text style={[styles.badgeText, big && { fontSize: 14 }]}>⭐ Creator of MedStreak</Text>
    </View>
  );
}

/** Always-available way to support the creator. No ads, ever. */
export function KofiCard() {
  return (
    <Pressable style={styles.kofi} onPress={() => Linking.openURL(KOFI_URL).catch(() => {})} accessibilityRole="link">
      <Text style={styles.kofiEmoji}>☕</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.kofiTitle}>Buy me a Ko-fi</Text>
        <Text style={styles.kofiSub}>MedStreak is free and ad-free forever. Tips keep it that way. 💖</Text>
      </View>
      <Text style={styles.kofiGo}>ko-fi.com/nessythelochness</Text>
    </Pressable>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    badge: { alignSelf: 'flex-start', backgroundColor: '#FFE08A', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8, borderWidth: 1, borderColor: '#E0A800' },
    badgeText: { color: '#6B4A00', fontWeight: '900', fontSize: 11 },
    kofi: { backgroundColor: '#29ABE0', borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 },
    kofiEmoji: { fontSize: 32 },
    kofiTitle: { color: '#fff', fontWeight: '900', fontSize: 16 },
    kofiSub: { color: '#EAF8FF', fontSize: 12, marginTop: 2, lineHeight: 16 },
    kofiGo: { color: '#fff', fontWeight: '800', fontSize: 12, textDecorationLine: 'underline', width: '100%' },
  }),
);
