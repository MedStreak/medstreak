import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field } from '../components/ui';
import { formatTime, fromHHmm, toHHmm } from '../lib/dates';
import { colors, pillColors, themedStyles } from '../lib/theme';
import { useApp } from '../state/AppState';

export default function MedForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, addMed, updateMed } = useApp();
  const router = useRouter();
  const existing = data.meds.find((m) => m.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [dosage, setDosage] = useState(existing?.dosage ?? '');
  const [times, setTimes] = useState<string[]>(existing?.times ?? ['08:00']);
  const [color, setColor] = useState(existing?.color ?? pillColors[data.meds.length % pillColors.length]);
  const [pills, setPills] = useState(existing?.pillsRemaining != null ? String(existing.pillsRemaining) : '');
  const [perDose, setPerDose] = useState(String(existing?.pillsPerDose ?? 1));
  const [refillDays, setRefillDays] = useState(String(existing?.refillDays ?? 7));
  const [editing, setEditing] = useState<number | null>(null);

  const save = () => {
    if (!name.trim()) return Alert.alert('Name needed', 'What’s this medication called?');
    if (times.length === 0) return Alert.alert('Add a time', 'Pick at least one time of day.');
    const payload = {
      name: name.trim(),
      dosage: dosage.trim(),
      times: Array.from(new Set(times)).sort(),
      color,
      pillsRemaining: pills.trim() === '' ? null : Math.max(0, parseInt(pills, 10) || 0),
      pillsPerDose: Math.max(1, parseInt(perDose, 10) || 1),
      refillDays: Math.max(1, parseInt(refillDays, 10) || 7),
    };
    if (existing) updateMed(existing.id, payload);
    else addMed(payload);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Vitamin D" autoFocus={!existing} />
      <Field label="Dosage (optional)" value={dosage} onChangeText={setDosage} placeholder="e.g. 10 mg" />

      <Text style={styles.label}>Times each day</Text>
      {times.map((t, i) => (
        <View key={i} style={styles.timeRow}>
          <Pressable style={styles.timeChip} onPress={() => setEditing(i)}>
            <Text style={styles.timeText}>{formatTime(t)}</Text>
          </Pressable>
          {times.length > 1 && (
            <Pressable onPress={() => setTimes(times.filter((_, j) => j !== i))} hitSlop={10}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          )}
        </View>
      ))}
      <Button title="+ Add another time" kind="secondary" onPress={() => setTimes([...times, '20:00'])} style={{ marginBottom: 16 }} />
      {editing !== null && (
        <>
          <DateTimePicker
            mode="time"
            value={fromHHmm(times[editing])}
            onChange={(_, d) => {
              if (Platform.OS === 'android') setEditing(null);
              if (d) setTimes(times.map((t, j) => (j === editing ? toHHmm(d) : t)));
            }}
          />
          {Platform.OS === 'ios' && <Button title="Done" kind="secondary" onPress={() => setEditing(null)} style={{ marginBottom: 16 }} />}
        </>
      )}

      <Text style={styles.label}>Color</Text>
      <View style={styles.colors}>
        {pillColors.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchOn]} />
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 8 }]}>Refill tracking (optional)</Text>
      <Field label="Pills remaining" value={pills} onChangeText={setPills} keyboardType="number-pad" placeholder="Leave blank to skip" />
      <Field label="Pills per dose" value={perDose} onChangeText={setPerDose} keyboardType="number-pad" />
      <Field label="Remind me when this many days are left" value={refillDays} onChangeText={setRefillDays} keyboardType="number-pad" />

      <Button title={existing ? 'Save changes' : 'Add medication'} onPress={save} />
    </ScrollView>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  container: { padding: 16, paddingBottom: 60 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 8, textTransform: 'uppercase' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  timeChip: { backgroundColor: colors.chipBg, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999 },
  timeText: { fontSize: 17, fontWeight: '800', color: colors.primaryDark },
  remove: { color: colors.danger, fontWeight: '700' },
  colors: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  swatchOn: { borderWidth: 3, borderColor: colors.text },
}));
