import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Button, Card, SectionTitle } from '../../components/ui';
import { addDays, dateKey, formatTime, monthLabel, parseKey } from '../../lib/dates';
import { colors, themedStyles } from '../../lib/theme';
import { DayStatus, adherence, dosesForDay, summarizeDay } from '../../lib/streak';
import { useApp } from '../../state/AppState';

const statusColors = (): Record<DayStatus, string> => ({
  complete: colors.success,
  partial: colors.warn,
  missed: colors.danger,
  pending: colors.primary,
  none: 'transparent',
  future: 'transparent',
});

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
  const { data, today, adherence30 } = useApp();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(today);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: (string | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(dateKey(new Date(cursor.y, cursor.m, d)));
    return out;
  }, [cursor]);

  const shift = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const slots = dosesForDay(data.meds, selected);
  const taken = new Set(data.logs[selected] ?? []);

  const shareReport = async () => {
    const lines: string[] = [`MedStreak adherence report (last 30 days)`, `Overall: ${adherence30 ?? 'n/a'}%`, ''];
    for (let i = 29; i >= 0; i--) {
      const d = addDays(today, -i);
      const s = summarizeDay(data.meds, data.logs, d, today);
      if (s.scheduled > 0) lines.push(`${d}: ${s.taken}/${s.scheduled} doses`);
    }
    const names = data.meds.filter((m) => m.active).map((m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ''}`);
    lines.push('', `Medications: ${names.join(', ')}`, 'Self-reported via MedStreak.');
    await Share.share({ message: lines.join('\n') });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.bigStat}>{adherence30 === null ? '–' : `${adherence30}%`}</Text>
        <Text style={styles.statLabel}>adherence, last 30 days</Text>
      </Card>

      <View style={styles.monthRow}>
        <Pressable onPress={() => shift(-1)} hitSlop={12}><Text style={styles.arrow}>‹</Text></Pressable>
        <Text style={styles.month}>{monthLabel(cursor.y, cursor.m)}</Text>
        <Pressable onPress={() => shift(1)} hitSlop={12}><Text style={styles.arrow}>›</Text></Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekday}>{w}</Text>
        ))}
        {cells.map((k, i) => {
          if (!k) return <View key={i} style={styles.cell} />;
          const s = summarizeDay(data.meds, data.logs, k, today);
          const sel = k === selected;
          return (
            <Pressable key={k} style={styles.cell} onPress={() => setSelected(k)}>
              <View style={[styles.dayCircle, { backgroundColor: statusColors()[s.status] }, sel && styles.selected]}>
                <Text style={[styles.dayNum, statusColors()[s.status] !== 'transparent' && { color: '#fff' }]}>
                  {parseKey(k).getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendItem}>🟢 All taken</Text>
        <Text style={styles.legendItem}>🟠 Some</Text>
        <Text style={styles.legendItem}>🔴 Missed</Text>
      </View>

      <SectionTitle>{parseKey(selected).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</SectionTitle>
      {slots.length === 0 && <Text style={styles.muted}>No doses scheduled.</Text>}
      {slots.map((s) => (
        <Card key={s.key} style={styles.slot}>
          <Text style={styles.slotName}>{s.med.name} · {formatTime(s.time)}</Text>
          <Text>{taken.has(s.key) ? '✅' : selected > today ? '·' : '❌'}</Text>
        </Card>
      ))}

      <Button title="Share 30-day report" kind="secondary" onPress={shareReport} style={{ marginTop: 10 }} />
    </ScrollView>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  bigStat: { fontSize: 44, fontWeight: '900', color: colors.primaryDark, textAlign: 'center' },
  statLabel: { textAlign: 'center', color: colors.muted },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  arrow: { fontSize: 32, color: colors.primary, paddingHorizontal: 12 },
  month: { fontSize: 18, fontWeight: '800', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', color: colors.muted, fontWeight: '700', marginBottom: 4 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  selected: { borderWidth: 2, borderColor: colors.text },
  dayNum: { fontWeight: '700', color: colors.text },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 6 },
  legendItem: { color: colors.muted, fontSize: 12 },
  muted: { color: colors.muted },
  slot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  slotName: { fontWeight: '600', color: colors.text },
}));
