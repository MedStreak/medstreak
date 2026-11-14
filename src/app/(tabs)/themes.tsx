import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, SectionTitle } from '../../components/ui';
import { ACCENTS, THEMES, colors, themedStyles } from '../../lib/theme';
import { useApp } from '../../state/AppState';

const CORNERS = [
  { id: 'sharp', label: 'Sharp', r: 4 },
  { id: 'soft', label: 'Soft', r: 12 },
  { id: 'round', label: 'Bubbly', r: 22 },
];

export default function ThemesScreen() {
  const { data, updateSettings, streak } = useApp();
  const { theme: current, accent, corners, unlockedThemes } = data.settings;
  const tap = () => Haptics.selectionAsync().catch(() => {});

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>Make MedStreak feel like yours. Everything saves automatically.</Text>

      <SectionTitle>Theme</SectionTitle>
      {THEMES.map((t) => {
        const selected = t.id === current;
        const locked = t.unlock !== undefined && !unlockedThemes.includes(t.id);
        return (
          <Pressable
            key={t.id}
            accessibilityRole="button"
            accessibilityLabel={`${t.name} theme${selected ? ', selected' : ''}`}
            onPress={() => {
              tap();
              if (locked) {
                Alert.alert('Locked 🔒', `Reach a ${t.unlock}-day streak to unlock ${t.name}. Your best so far is ${streak.best} days. You can do it!`);
                return;
              }
              updateSettings({ theme: t.id });
            }}
          >
            <Card style={[styles.card, selected && styles.cardSelected, locked && { opacity: 0.55 }]}>
              <View style={[styles.preview, { backgroundColor: t.colors.bg, borderColor: t.colors.border }]}>
                <View style={[styles.previewHero, { backgroundColor: t.colors.hero }]}>
                  <Text style={{ fontSize: 14 }}>{t.mascot}</Text>
                </View>
                <View style={[styles.previewCard, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
                  <View style={[styles.previewDot, { backgroundColor: t.colors.primary }]} />
                  <View style={[styles.previewLine, { backgroundColor: t.colors.muted }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {t.emoji} {t.name}
                </Text>
                <Text style={styles.sub}>
                  {locked ? `🔒 Unlocks at a ${t.unlock}-day streak` : `${t.dark ? 'Dark mode' : 'Light'}${t.fx ? ' · ✨ Animated' : ''}`}
                </Text>
              </View>
              {selected && <Text style={styles.check}>✓</Text>}
            </Card>
          </Pressable>
        );
      })}

      <SectionTitle>Accent color</SectionTitle>
      <Text style={styles.sub}>Tints buttons, tabs and your streak card on top of any theme.</Text>
      <View style={styles.swatchRow}>
        <Pressable
          onPress={() => {
            tap();
            updateSettings({ accent: null });
          }}
          style={[styles.autoChip, accent === null && styles.swatchOn]}
        >
          <Text style={styles.autoText}>Theme</Text>
        </Pressable>
        {ACCENTS.map((a) => (
          <Pressable
            key={a.id}
            accessibilityLabel={`${a.name} accent`}
            onPress={() => {
              tap();
              updateSettings({ accent: a.id });
            }}
            style={[styles.swatch, { backgroundColor: a.color }, accent === a.id && styles.swatchOn]}
          />
        ))}
      </View>

      <SectionTitle>Corners</SectionTitle>
      <View style={styles.cornerRow}>
        {CORNERS.map((c) => {
          const on = corners === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                tap();
                updateSettings({ corners: c.id });
              }}
              style={[styles.cornerBox, { borderRadius: c.r }, on && styles.cornerOn]}
            >
              <Text style={[styles.cornerText, on && { color: '#fff' }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    content: { padding: 16, paddingBottom: 48 },
    lead: { color: colors.muted, fontSize: 15, lineHeight: 21, marginBottom: 6 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: colors.border },
    cardSelected: { borderColor: colors.primary },
    preview: { width: 92, height: 62, borderRadius: 12, borderWidth: 1, padding: 6, gap: 4 },
    previewHero: { height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    previewCard: { flex: 1, borderRadius: 6, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
    previewDot: { width: 8, height: 8, borderRadius: 4 },
    previewLine: { flex: 1, height: 3, borderRadius: 2, opacity: 0.5 },
    name: { fontSize: 17, fontWeight: '800', color: colors.text },
    sub: { color: colors.muted, marginTop: 2 },
    check: { fontSize: 22, color: colors.primary, fontWeight: '900' },
    swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: 'transparent' },
    swatchOn: { borderColor: colors.text },
    autoChip: { height: 40, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
    autoText: { fontWeight: '800', color: colors.text },
    cornerRow: { flexDirection: 'row', gap: 10 },
    cornerBox: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: colors.chipBg },
    cornerOn: { backgroundColor: colors.primary },
    cornerText: { fontWeight: '800', color: colors.text },
  }),
);
