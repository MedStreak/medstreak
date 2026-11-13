import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button, Card, SectionTitle } from '../../components/ui';
import { formatTime, fromHHmm, toHHmm } from '../../lib/dates';
import { colors, themedStyles } from '../../lib/theme';
import { useApp } from '../../state/AppState';

export default function MedsScreen() {
  const { data, deleteMed, updateSettings } = useApp();
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const meds = data.meds.filter((m) => m.active);
  const s = data.settings;
  const checkIn = `${String(s.checkInHour).padStart(2, '0')}:${String(s.checkInMinute).padStart(2, '0')}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionTitle>Reminders</SectionTitle>
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Dose reminders & check-in</Text>
          <Switch value={s.remindersOn} onValueChange={(v) => updateSettings({ remindersOn: v })} trackColor={{ true: colors.primary }} />
        </View>
        <Pressable style={[styles.rowBetween, { marginTop: 14 }]} onPress={() => setShowPicker(true)}>
          <Text style={styles.label}>Daily check-in time</Text>
          <Text style={styles.value}>{formatTime(checkIn)}</Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            mode="time"
            value={fromHHmm(checkIn)}
            onChange={(_, d) => {
              if (Platform.OS === 'android') setShowPicker(false);
              if (d) {
                const [h, m] = toHHmm(d).split(':').map(Number);
                updateSettings({ checkInHour: h, checkInMinute: m });
              }
            }}
          />
        )}
        {showPicker && Platform.OS === 'ios' && (
          <Button title="Done" kind="secondary" onPress={() => setShowPicker(false)} style={{ marginTop: 8 }} />
        )}
      </Card>

      <SectionTitle>My medications</SectionTitle>
      {meds.length === 0 && <Text style={styles.muted}>Nothing here yet.</Text>}
      {meds.map((m) => (
        <Pressable key={m.id} onPress={() => router.push({ pathname: '/med-form', params: { id: m.id } })}>
          <Card>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={[styles.dot, { backgroundColor: m.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{m.name}</Text>
                  <Text style={styles.muted}>
                    {m.dosage ? `${m.dosage} · ` : ''}
                    {m.times.map(formatTime).join(', ')}
                  </Text>
                  {m.pillsRemaining !== null && <Text style={styles.muted}>{m.pillsRemaining} pills left</Text>}
                </View>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() =>
                  Alert.alert('Remove medication?', `${m.name} will stop appearing. Your past history is kept.`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => deleteMed(m.id) },
                  ])
                }
              >
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          </Card>
        </Pressable>
      ))}
      <Button title="+ Add medication" onPress={() => router.push('/med-form')} style={{ marginTop: 6 }} />
      <Text style={styles.disclaimer}>
        MedStreak is a reminder and habit tool. It doesn’t give medical advice. Always follow your doctor’s or pharmacist’s instructions.
      </Text>
    </ScrollView>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600', color: colors.text },
  value: { fontSize: 16, fontWeight: '800', color: colors.primaryDark },
  dot: { width: 12, height: 40, borderRadius: 6 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted },
  remove: { color: colors.danger, fontWeight: '700' },
  disclaimer: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 20 },
}));
