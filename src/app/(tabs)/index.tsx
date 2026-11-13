import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ProgressBar, SectionTitle } from '../../components/ui';
import { formatTime } from '../../lib/dates';
import { colors, getTheme, themedStyles } from '../../lib/theme';
import { dosesForDay, motivationalMessage, nextMilestone } from '../../lib/streak';
import { useApp } from '../../state/AppState';

export default function TodayScreen() {
  const { data, today, streak, toggleDose, answerPrompt } = useApp();
  const router = useRouter();
  const slots = dosesForDay(data.meds, today);
  const done = new Set(data.logs[today] ?? []);
  const takenCount = slots.filter((s) => done.has(s.key)).length;
  const next = nextMilestone(streak.current);

  const lowSupply = data.meds.filter((m) => {
    if (!m.active || m.pillsRemaining === null) return false;
    const days = Math.floor(m.pillsRemaining / Math.max(1, m.pillsPerDose * m.times.length));
    return days <= m.refillDays;
  });

  if (data.meds.filter((m) => m.active).length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.bigEmoji}>💊</Text>
        <Text style={styles.emptyTitle}>Let’s build your streak</Text>
        <Text style={styles.emptyText}>Add your first medication and we’ll remind you every day and cheer you on.</Text>
        <Button title="Add medication" onPress={() => router.push('/med-form')} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.streakCard}>
        <Text style={styles.flame}>{getTheme(data.settings.theme).mascot}</Text>
        <Text style={styles.streakNum}>{streak.current}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>🏅 Best: {streak.best}</Text>
          <Text style={styles.stat}>🛡️ Shields: {streak.shields}</Text>
        </View>
        {next !== null && (
          <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
            <ProgressBar fraction={streak.current / next} color="#fff" />
            <Text style={styles.nextText}>{next - streak.current} to your {next}-day badge</Text>
          </View>
        )}
      </Card>

      <Text style={styles.quote}>“{motivationalMessage()}”</Text>

      {lowSupply.map((m) => (
        <Pressable key={m.id} onPress={() => router.push({ pathname: '/med-form', params: { id: m.id } })}>
          <Card style={styles.refill}>
            <Text style={styles.refillText}>🧴 {m.name}: only {m.pillsRemaining} pill(s) left. Time to refill!</Text>
          </Card>
        </Pressable>
      ))}

      <SectionTitle>Today · {takenCount}/{slots.length} taken</SectionTitle>
      {slots.map((s) => {
        const taken = done.has(s.key);
        return (
          <Pressable key={s.key} onPress={() => toggleDose(today, s.key)} accessibilityRole="checkbox" accessibilityState={{ checked: taken }}>
            <Card style={[styles.row, taken && styles.rowDone]}>
              <View style={[styles.dot, { backgroundColor: s.med.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{s.med.name}</Text>
                <Text style={styles.medSub}>
                  {formatTime(s.time)}
                  {s.med.dosage ? ` · ${s.med.dosage}` : ''}
                </Text>
              </View>
              <Ionicons name={taken ? 'checkmark-circle' : 'ellipse-outline'} size={32} color={taken ? colors.success : colors.border} />
            </Card>
          </Pressable>
        );
      })}

      {takenCount < slots.length && (
        <Button
          title="I took everything ✅"
          onPress={() => answerPrompt('yes')}
          style={{ backgroundColor: colors.success, marginTop: 6 }}
        />
      )}
      {takenCount === slots.length && slots.length > 0 && (
        <Text style={styles.allDone}>All done for today. See you tomorrow! 🌙</Text>
      )}
    </ScrollView>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  streakCard: { backgroundColor: colors.hero, alignItems: 'center', borderColor: colors.hero, paddingVertical: 22 },
  flame: { fontSize: 40 },
  streakNum: { fontSize: 64, fontWeight: '900', color: '#fff', lineHeight: 70 },
  streakLabel: { color: '#fff', fontSize: 16, fontWeight: '700', opacity: 0.9 },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 10 },
  stat: { color: '#fff', fontWeight: '700' },
  nextText: { color: '#fff', marginTop: 6, textAlign: 'center', fontSize: 13 },
  quote: { textAlign: 'center', color: colors.muted, fontStyle: 'italic', marginVertical: 8, paddingHorizontal: 12 },
  refill: { backgroundColor: colors.refillBg, borderColor: colors.refillBorder },
  refillText: { color: colors.text, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowDone: { opacity: 0.65 },
  dot: { width: 12, height: 40, borderRadius: 6 },
  medName: { fontSize: 17, fontWeight: '700', color: colors.text },
  medSub: { color: colors.muted, marginTop: 2 },
  allDone: { textAlign: 'center', color: colors.success, fontWeight: '700', marginTop: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bigEmoji: { fontSize: 72 },
  emptyTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 8 },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 6, fontSize: 16, lineHeight: 22 },
}));
