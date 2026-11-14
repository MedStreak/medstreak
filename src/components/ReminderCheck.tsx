import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { ensurePermission, reminderHealth, sendTestReminder, type ReminderHealth } from '../lib/notifications';
import { colors, themedStyles } from '../lib/theme';
import { useApp } from '../state/AppState';
import { Button, Card } from './ui';

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, ok === true && { color: colors.success }, ok === false && { color: colors.danger }]}>{value}</Text>
    </View>
  );
}

/** Shows what is really scheduled and lets the person send a test, so missed reminders can be diagnosed. */
export function ReminderCheck() {
  const { data } = useApp();
  const [h, setH] = useState<ReminderHealth | null>(null);
  const refresh = useCallback(async () => {
    try {
      setH(await reminderHealth(data.meds));
    } catch {}
  }, [data.meds]);
  useEffect(() => {
    const id = setTimeout(refresh, 800);
    return () => clearTimeout(id);
  }, [refresh, data.settings.remindersOn]);
  if (Platform.OS === 'web') return null;

  const next = h?.nextAt ? h.nextAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'none';
  return (
    <Card>
      <Text style={styles.title}>Reminder check</Text>
      <Row label="Notifications allowed" value={h ? (h.allowed ? 'Yes' : 'No') : '...'} ok={h ? h.allowed : undefined} />
      <Row label="Reminders queued" value={h ? String(h.queued) : '...'} />
      <Row label="Next dose reminder" value={next} />
      {h?.error ? <Row label="Problem" value={h.error} ok={false} /> : null}
      <Button
        title="Send a test in 10 seconds"
        style={{ marginTop: 10 }}
        onPress={async () => {
          if (!(await ensurePermission())) {
            Alert.alert('Notifications are off', 'Turn them on for MedStreak in your phone settings.', [
              { text: 'Open settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel', style: 'cancel' },
            ]);
            return;
          }
          try {
            await sendTestReminder();
            Alert.alert('Test is on its way', 'Lock your phone or leave the app. A notification should appear in about 10 seconds.');
          } catch (e) {
            Alert.alert('Could not schedule', e instanceof Error ? e.message : String(e));
          }
          refresh();
        }}
      />
      <Button title="Refresh" kind="secondary" style={{ marginTop: 8 }} onPress={refresh} />
      {Platform.OS === 'android' && (
        <Button
          title="Battery settings (set to Unrestricted)"
          kind="secondary"
          style={{ marginTop: 8 }}
          onPress={() => Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS').catch(() => Linking.openSettings())}
        />
      )}
      <Text style={styles.hint}>
        If the test never arrives: set battery to Unrestricted for MedStreak, and make sure Do Not Disturb is off.
      </Text>
    </Card>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    title: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 6 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: 12 },
    label: { color: colors.text, flexShrink: 1 },
    value: { color: colors.muted, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
    hint: { color: colors.muted, marginTop: 10, lineHeight: 19, fontSize: 13 },
  }),
);
