import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field, SectionTitle } from '../components/ui';
import { formatTime } from '../lib/dates';
import { colors, radius, themedStyles } from '../lib/theme';
import { EMPTY_CARD, useEmergencyCard, type EmergencyCard } from '../lib/wellbeing';
import { useApp } from '../state/AppState';

/** Emergency card: what a paramedic or ER nurse needs. Saved on this phone only. */
export default function Emergency() {
  const { data } = useApp();
  const { card, save } = useEmergencyCard();
  const [draft, setDraft] = useState<EmergencyCard>(EMPTY_CARD);
  const [editing, setEditing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDraft(card);
    const empty = JSON.stringify(card) === JSON.stringify(EMPTY_CARD);
    if (!ready) {
      setEditing(empty);
      setReady(true);
    }
  }, [card, ready]);

  const meds = data.meds.filter((m) => m.active);
  const set = (k: keyof EmergencyCard) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));

  if (editing) {
    return (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit emergency card</Text>
        <Text style={styles.sub}>Only add what you want a stranger to see in an emergency. Your medications are added automatically.</Text>
        <Field label="Name" value={draft.name} onChangeText={set('name')} />
        <Field label="Allergies" value={draft.allergies} onChangeText={set('allergies')} placeholder="Penicillin" />
        <Field label="Conditions you choose to list" value={draft.conditions} onChangeText={set('conditions')} />
        <Field label="Blood type" value={draft.bloodType} onChangeText={set('bloodType')} />
        <Field label="Emergency contact name" value={draft.contactName} onChangeText={set('contactName')} />
        <Field label="Emergency contact phone" value={draft.contactPhone} onChangeText={set('contactPhone')} keyboardType="phone-pad" />
        <Field label="Doctor" value={draft.doctor} onChangeText={set('doctor')} />
        <Field label="Notes" value={draft.notes} onChangeText={set('notes')} multiline />
        <Text style={styles.sub}>🔒 Stays on your phone. It is never uploaded.</Text>
        <Button
          title="Save"
          onPress={async () => {
            await save(draft);
            setEditing(false);
          }}
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    );
  }

  const row = (label: string, value: string, danger = false) =>
    value ? (
      <View style={[styles.row, danger && styles.danger]}>
        <Text style={[styles.k, danger && { color: colors.danger }]}>{label}</Text>
        <Text style={styles.v}>{value}</Text>
      </View>
    ) : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>🚑 Emergency card</Text>
      {row('Allergies', card.allergies, true)}
      {row('Name', card.name)}
      {row('Conditions', card.conditions)}
      {row('Blood type', card.bloodType)}
      <SectionTitle>Medications</SectionTitle>
      <Card>
        {meds.length === 0 ? <Text style={styles.v}>None added</Text> : null}
        {meds.map((m) => (
          <Text key={m.id} style={styles.med}>
            {m.name}{m.dosage ? `, ${m.dosage}` : ''} <Text style={{ color: colors.muted }}>({m.times.map(formatTime).join(', ')})</Text>
          </Text>
        ))}
      </Card>
      {row('Doctor', card.doctor)}
      {row('Notes', card.notes)}
      {card.contactName || card.contactPhone ? (
        <>
          {row('Emergency contact', `${card.contactName}${card.contactPhone ? `  ${card.contactPhone}` : ''}`)}
          {card.contactPhone ? <Button title={`Call ${card.contactName || 'contact'}`} onPress={() => Linking.openURL(`tel:${card.contactPhone}`).catch(() => {})} style={{ marginTop: 8 }} /> : null}
        </>
      ) : null}
      <Button title="Edit" kind="secondary" onPress={() => setEditing(true)} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    content: { padding: 16, paddingBottom: 48 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 10 },
    sub: { color: colors.muted, marginBottom: 12, lineHeight: 20 },
    row: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 8 },
    danger: { borderColor: colors.danger, borderWidth: 2 },
    k: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase' },
    v: { fontSize: 17, color: colors.text, fontWeight: '600', marginTop: 2 },
    med: { fontSize: 16, color: colors.text, fontWeight: '600', paddingVertical: 3 },
  }),
);
