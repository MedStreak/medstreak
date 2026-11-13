import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, ProgressBar, SectionTitle } from '../../components/ui';
import { colors, themedStyles } from '../../lib/theme';
import { MILESTONES, goalProgress } from '../../lib/streak';
import type { GoalType } from '../../lib/types';
import { useApp } from '../../state/AppState';

const TYPES: { type: GoalType; label: string; hint: string; defaultTarget: string }[] = [
  { type: 'streak', label: 'Streak', hint: 'Reach a streak of N days', defaultTarget: '30' },
  { type: 'adherence', label: 'Adherence', hint: 'Hit N% over the last 30 days', defaultTarget: '90' },
  { type: 'custom', label: 'Custom', hint: 'Your own goal. Check it off yourself', defaultTarget: '1' },
];

export default function GoalsScreen() {
  const { data, streak, adherence30, addGoal, deleteGoal, completeCustomGoal } = useApp();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<GoalType>('streak');
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('30');
  const [reward, setReward] = useState('');

  const create = () => {
    const t = Math.max(1, parseInt(target, 10) || 1);
    const meta = TYPES.find((x) => x.type === type)!;
    const finalTitle =
      title.trim() ||
      (type === 'streak' ? `${t}-day streak` : type === 'adherence' ? `${t}% adherence` : 'My goal');
    if (type === 'adherence' && t > 100) return Alert.alert('Percent too high', 'Pick a number up to 100.');
    addGoal({ title: finalTitle, type, target: type === 'custom' ? 1 : t, reward: reward.trim() });
    setOpen(false);
    setTitle('');
    setReward('');
    setTarget(meta.defaultTarget);
  };

  const active = data.goals.filter((g) => !g.achievedAt);
  const achieved = data.goals.filter((g) => g.achievedAt);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionTitle>Streak badges</SectionTitle>
      <View style={styles.badges}>
        {MILESTONES.map((m) => {
          const got = streak.best >= m;
          return (
            <View key={m} style={[styles.badge, got && styles.badgeOn]}>
              <Text style={styles.badgeEmoji}>{got ? '🏅' : '🔒'}</Text>
              <Text style={[styles.badgeText, got && { color: colors.primaryDark }]}>{m}d</Text>
            </View>
          );
        })}
      </View>

      <SectionTitle>My goals</SectionTitle>
      {active.length === 0 && <Text style={styles.muted}>Set a goal to stay motivated. Maybe 30 days in a row?</Text>}
      {active.map((g) => {
        const p = goalProgress(g, streak, adherence30);
        return (
          <Card key={g.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.goalTitle}>{g.title}</Text>
              <Pressable
                hitSlop={10}
                onPress={() =>
                  Alert.alert('Delete goal?', g.title, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(g.id) },
                  ])
                }
              >
                <Text style={styles.remove}>Delete</Text>
              </Pressable>
            </View>
            {g.type !== 'custom' ? (
              <>
                <View style={{ marginVertical: 8 }}><ProgressBar fraction={p.fraction} /></View>
                <Text style={styles.muted}>{p.label}</Text>
              </>
            ) : (
              <Button title="Mark as done ✓" kind="secondary" onPress={() => completeCustomGoal(g.id)} style={{ marginTop: 10 }} />
            )}
            {!!g.reward && <Text style={styles.reward}>🎁 Reward: {g.reward}</Text>}
          </Card>
        );
      })}
      <Button title="+ New goal" onPress={() => setOpen(true)} />

      {achieved.length > 0 && (
        <>
          <SectionTitle>Achieved 🏆</SectionTitle>
          {achieved.map((g) => (
            <Card key={g.id} style={{ opacity: 0.85 }}>
              <Text style={styles.goalTitle}>✅ {g.title}</Text>
              <Text style={styles.muted}>Reached on {g.achievedAt}</Text>
              {!!g.reward && <Text style={styles.reward}>🎁 {g.reward}</Text>}
            </Card>
          ))}
        </>
      )}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <ScrollView style={styles.sheet} keyboardShouldPersistTaps="handled">
            <Text style={styles.sheetTitle}>New goal</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <Pressable
                  key={t.type}
                  onPress={() => {
                    setType(t.type);
                    setTarget(t.defaultTarget);
                  }}
                  style={[styles.typeChip, type === t.type && styles.typeChipOn]}
                >
                  <Text style={[styles.typeText, type === t.type && { color: '#fff' }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.muted}>{TYPES.find((t) => t.type === type)!.hint}</Text>
            <View style={{ height: 12 }} />
            <Field label="Title (optional)" value={title} onChangeText={setTitle} placeholder="e.g. One full month!" />
            {type !== 'custom' && (
              <Field label={type === 'streak' ? 'Days' : 'Percent'} value={target} onChangeText={setTarget} keyboardType="number-pad" />
            )}
            <Field label="Reward for yourself (optional)" value={reward} onChangeText={setReward} placeholder="e.g. Fancy coffee ☕" />
            <Button title="Create goal" onPress={create} />
            <Button title="Cancel" kind="secondary" onPress={() => setOpen(false)} style={{ marginTop: 8 }} />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { width: 72, paddingVertical: 10, borderRadius: 16, alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  badgeOn: { backgroundColor: colors.chipBg, borderColor: colors.primary },
  badgeEmoji: { fontSize: 26 },
  badgeText: { fontWeight: '800', color: colors.muted, marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalTitle: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1 },
  muted: { color: colors.muted, marginBottom: 10 },
  remove: { color: colors.danger, fontWeight: '700' },
  reward: { marginTop: 8, color: colors.primaryDark, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(43,34,51,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '88%' },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.chipBg },
  typeChipOn: { backgroundColor: colors.primary },
  typeText: { fontWeight: '700', color: colors.text },
}));
