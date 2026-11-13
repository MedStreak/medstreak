import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../lib/dates';
import { colors, radius, themedStyles } from '../lib/theme';
import { useApp } from '../state/AppState';

/** The daily "Did you take your meds today?" popup. */
export function CheckInModal() {
  const { promptVisible, answerPrompt, pendingToday, streak } = useApp();
  if (!promptVisible) return null;
  const pending = pendingToday();
  return (
    <Modal transparent animationType="slide" visible onRequestClose={() => answerPrompt('later')}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.emoji}>💊</Text>
          <Text style={styles.title}>Did you take your meds today?</Text>
          {streak.current > 0 && (
            <Text style={styles.streak}>🔥 {streak.current}-day streak on the line</Text>
          )}
          <View style={styles.list}>
            {pending.slice(0, 6).map((s) => (
              <Text key={s.key} style={styles.item}>
                • {s.med.name} <Text style={styles.time}>({formatTime(s.time)})</Text>
              </Text>
            ))}
            {pending.length > 6 && <Text style={styles.item}>…and {pending.length - 6} more</Text>}
          </View>
          <Pressable style={[styles.btn, styles.yes]} onPress={() => answerPrompt('yes')}>
            <Text style={styles.yesText}>Yes, I took them! ✅</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.later]} onPress={() => answerPrompt('later')}>
            <Text style={styles.laterText}>Not yet, ask me later</Text>
          </Pressable>
          <Pressable onPress={() => answerPrompt('missed')} hitSlop={8}>
            <Text style={styles.missed}>I missed today</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(43,34,51,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, alignItems: 'center' },
  emoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 4 },
  streak: { marginTop: 6, color: colors.primaryDark, fontWeight: '700' },
  list: { alignSelf: 'stretch', marginVertical: 14, backgroundColor: colors.chipBg, borderRadius: radius.md, padding: 12 },
  item: { fontSize: 15, color: colors.text, paddingVertical: 2 },
  time: { color: colors.muted },
  btn: { alignSelf: 'stretch', paddingVertical: 15, borderRadius: 999, alignItems: 'center', marginBottom: 10 },
  yes: { backgroundColor: colors.success },
  yesText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  later: { backgroundColor: colors.chipBg },
  laterText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  missed: { color: colors.muted, marginTop: 4, textDecorationLine: 'underline' },
}));
