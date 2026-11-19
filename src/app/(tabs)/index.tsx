import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UpdateBanner } from '../../components/UpdateBanner';
import { Button, Card, ProgressBar, SectionTitle } from '../../components/ui';
import { formatTime } from '../../lib/dates';
import { colors, getTheme, themedStyles } from '../../lib/theme';
import { SURPRISE_EVERY, dosesForDay, motivationalMessage, nextMilestone } from '../../lib/streak';
import { useMoodLogs } from '../../lib/wellbeing';
import { useApp } from '../../state/AppState';

export default function TodayScreen() {
  const { data, today, streak, surprise, toggleDose, answerPrompt, updateSettings } = useApp();
  const router = useRouter();
  const { logs: moods } = useMoodLogs();
  const todayMood = moods[today];
  const slots = dosesForDay(data.meds, today);
  const done = new Set(data.logs[today] ?? []);
  const takenCount = slots.filter((s) => done.has(s.key)).length;
  const next = nextMilestone(streak.current);
  const frozen = data.settings.frozenDays.includes(today);
  const th = getTheme(data.settings.theme);
  const flair = `${th.emoji} ✨ ${th.mascot} ✨ ${th.emoji}`;
  const mascotLine =
    slots.length === 0
      ? `${th.mascot} is ready whenever you are!`
      : takenCount >= slots.length
        ? `${th.mascot} is doing a happy dance! Everything’s taken today 💃`
        : takenCount > 0
          ? `${th.mascot} says: so close! ${slots.length - takenCount} to go 💪`
          : `${th.mascot} is cheering you on 📣`;

  const lowSupply = data.meds.filter((m) => {
    if (!m.active || m.pillsRemaining === null) return false;
    const days = Math.floor(m.pillsRemaining / Math.max(1, m.pillsPerDose * m.times.length));
    return days <= m.refillDays;
  });

  if (data.meds.filter((m) => m.active).length === 0) {
    return (
      <View style={styles.empty}>
        <UpdateBanner />
        <Text style={styles.bigEmoji}>💊</Text>
        <Text style={styles.emptyTitle}>Let’s build your streak</Text>
        <Text style={styles.emptyText}>Add your first medication and we’ll remind you every day and cheer you on.</Text>
        <Button title="Add medication" onPress={() => router.push('/med-form')} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <UpdateBanner />
      <Card style={styles.streakCard}>
        <Text style={styles.flame}>{getTheme(data.settings.theme).mascot}</Text>
        <Text style={styles.streakNum}>{streak.current}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>🏅 Best: {streak.best}</Text>
          <Text style={styles.stat}>❄️ Freezes: {streak.shields}</Text>
        </View>
        {next !== null && (
          <View style={{ alignSelf: 'stretch', marginTop: 12 }}>
            <ProgressBar fraction={streak.current / next} color="#fff" />
            <Text style={styles.nextText}>{next - streak.current} to your {next}-day badge</Text>
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.surpriseTitle}>🎁 Surprise progress</Text>
        <ProgressBar fraction={surprise / SURPRISE_EVERY} color={colors.primary} />
        <Text style={styles.surpriseText}>
          {surprise} / {SURPRISE_EVERY} check-in days. Every full day counts. Skipped days never hurt you, they just don’t add. 🌱
        </Text>
      </Card>

      <View style={styles.quickRow}>
        <Pressable style={styles.quick} onPress={() => router.push('/checkin')}>
          <Text style={styles.quickEmoji}>{todayMood?.mood || '🙂'}</Text>
          <Text style={styles.quickText}>{todayMood ? 'Update check-in' : 'How are you feeling?'}</Text>
        </Pressable>
        <Pressable style={styles.quick} onPress={() => router.push('/emergency')}>
          <Text style={styles.quickEmoji}>🚑</Text>
          <Text style={styles.quickText}>Emergency card</Text>
        </Pressable>
      </View>

      <Text style={styles.flair}>{flair}</Text>
      <Text style={styles.mascotLine}>{mascotLine}</Text>
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
              <Text style={styles.check}>{taken ? '💖' : '🤍'}</Text>
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
      {takenCount < slots.length && streak.shields > 0 && !frozen && (
        <Button
          title={`❄️ Freeze today (${streak.shields} left)`}
          kind="secondary"
          style={{ marginTop: 8 }}
          onPress={() =>
            Alert.alert(
              'Freeze today?',
              'This uses 1 freeze. Your streak stays safe even if you skip today (sick day, travel). If you do take everything, no freeze is spent.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Freeze it', onPress: () => updateSettings({ frozenDays: [...data.settings.frozenDays, today] }) },
              ],
            )
          }
        />
      )}
      {frozen && takenCount < slots.length && (
        <Text style={styles.allDone}>❄️ Today is frozen. Your streak is safe.</Text>
      )}
      {takenCount === slots.length && slots.length > 0 && (
        <Text style={styles.allDone}>All done for today. See you tomorrow! 🌙</Text>
      )}
    </ScrollView>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  quick: { flex: 1, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12, alignItems: 'center' },
  quickEmoji: { fontSize: 30 },
  quickText: { color: colors.text, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  flair: { textAlign: 'center', fontSize: 22, marginBottom: 4 },
  mascotLine: { textAlign: 'center', color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 8 },
  surpriseTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  surpriseText: { color: colors.muted, marginTop: 8, lineHeight: 19, fontSize: 13 },
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
  check: { fontSize: 30 },
  dot: { width: 12, height: 40, borderRadius: 6 },
  medName: { fontSize: 17, fontWeight: '700', color: colors.text },
  medSub: { color: colors.muted, marginTop: 2 },
  allDone: { textAlign: 'center', color: colors.success, fontWeight: '700', marginTop: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bigEmoji: { fontSize: 72 },
  emptyTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 8 },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 6, fontSize: 16, lineHeight: 22 },
}));
