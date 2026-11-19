import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, SectionTitle } from '../components/ui';
import { dateKey } from '../lib/dates';
import { colors, radius, themedStyles } from '../lib/theme';
import { MOODS, SYMPTOMS, useMoodLogs } from '../lib/wellbeing';

/** Two-tap emoji check-in. Everything stays on this phone. */
export default function CheckIn() {
  const router = useRouter();
  const today = dateKey();
  const { logs, save } = useMoodLogs();
  const [mood, setMood] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (seeded) return;
    const e = logs[today];
    if (e) {
      setMood(e.mood);
      setSymptoms(e.symptoms);
      setNote(e.note);
      setSeeded(true);
    }
  }, [logs, today, seeded]);

  const tap = () => Haptics.selectionAsync().catch(() => {});
  const toggle = (e: string) => {
    tap();
    setSymptoms((s) => (s.includes(e) ? s.filter((x) => x !== e) : [...s, e]));
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.grid}>
        {MOODS.map((m) => (
          <Pressable
            key={m.l}
            onPress={() => {
              tap();
              setMood(m.e === mood ? null : m.e);
            }}
            style={[styles.tile, mood === m.e && styles.tileOn]}
          >
            <Text style={styles.big}>{m.e}</Text>
            <Text style={styles.cap}>{m.l}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Anything bugging you?</SectionTitle>
      <Text style={styles.sub}>Tap as many as you like.</Text>
      <View style={styles.grid}>
        {SYMPTOMS.map((m) => (
          <Pressable key={m.l} onPress={() => toggle(m.e + m.l)} style={[styles.tile, symptoms.includes(m.e + m.l) && styles.tileOn]}>
            <Text style={styles.big}>{m.e}</Text>
            <Text style={styles.cap}>{m.l}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Note (optional)</SectionTitle>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Started a new dose Monday"
        placeholderTextColor={colors.muted}
        multiline
        style={styles.input}
      />
      <Text style={styles.privacy}>🔒 Stays on your phone. It is never uploaded.</Text>
      <Button
        title="Save"
        onPress={async () => {
          await save(today, mood || symptoms.length || note.trim() ? { mood: mood ?? '', symptoms, note: note.trim() } : null);
          router.back();
        }}
        style={{ marginTop: 14 }}
      />
    </ScrollView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    content: { padding: 16, paddingBottom: 48 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12 },
    sub: { color: colors.muted, marginBottom: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tile: { width: '23%', minWidth: 74, flexGrow: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 2, borderColor: colors.border },
    tileOn: { borderColor: colors.primary, backgroundColor: colors.chipBg },
    big: { fontSize: 30 },
    cap: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: '700', textAlign: 'center' },
    input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 12, fontSize: 16, color: colors.text, minHeight: 60, textAlignVertical: 'top' },
    privacy: { color: colors.muted, marginTop: 10 },
  }),
);
