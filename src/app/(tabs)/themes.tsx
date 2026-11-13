import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card, SectionTitle } from '../../components/ui';
import { THEMES, colors, themedStyles } from '../../lib/theme';
import { useApp } from '../../state/AppState';

export default function ThemesScreen() {
  const { data, updateSettings } = useApp();
  const current = data.settings.theme;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>Make MedStreak feel like yours. Pick a look, it saves automatically.</Text>
      <SectionTitle>Themes</SectionTitle>
      {THEMES.map((t) => {
        const selected = t.id === current;
        return (
          <Pressable
            key={t.id}
            accessibilityRole="button"
            accessibilityLabel={`${t.name} theme${selected ? ', selected' : ''}`}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              updateSettings({ theme: t.id });
            }}
          >
            <Card style={[styles.card, selected && styles.cardSelected]}>
              <View style={[styles.preview, { backgroundColor: t.colors.bg, borderColor: t.colors.border }]}>
                <View style={[styles.previewBar, { backgroundColor: t.colors.primary }]} />
                <View style={styles.swatches}>
                  <View style={[styles.dot, { backgroundColor: t.colors.primary }]} />
                  <View style={[styles.dot, { backgroundColor: t.colors.accent }]} />
                  <View style={[styles.dot, { backgroundColor: t.colors.card, borderWidth: 1, borderColor: t.colors.border }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {t.emoji} {t.name}
                </Text>
                <Text style={styles.sub}>{t.dark ? 'Dark mode' : 'Light'}</Text>
              </View>
              {selected && <Text style={styles.check}>✓</Text>}
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    content: { padding: 16, paddingBottom: 40 },
    lead: { color: colors.muted, fontSize: 15, lineHeight: 21, marginBottom: 6 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: 'transparent' },
    cardSelected: { borderColor: colors.primary },
    preview: { width: 84, height: 56, borderRadius: 12, borderWidth: 1, padding: 8, justifyContent: 'space-between' },
    previewBar: { height: 10, width: '60%', borderRadius: 5 },
    swatches: { flexDirection: 'row', gap: 6 },
    dot: { width: 14, height: 14, borderRadius: 7 },
    name: { fontSize: 17, fontWeight: '800', color: colors.text },
    sub: { color: colors.muted, marginTop: 2 },
    check: { fontSize: 22, color: colors.primary, fontWeight: '900' },
  }),
);
