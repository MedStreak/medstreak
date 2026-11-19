import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/** Mood and symptom logs and the emergency card live only on this phone. They are never uploaded. */
export interface Face { e: string; l: string }

export const MOODS: Face[] = [
  { e: '🤩', l: 'Excited' }, { e: '😄', l: 'Happy' }, { e: '🥰', l: 'Loved' }, { e: '😌', l: 'Calm' },
  { e: '😎', l: 'Confident' }, { e: '🥳', l: 'Celebrating' }, { e: '🤗', l: 'Grateful' }, { e: '🙂', l: 'Okay' },
  { e: '😐', l: 'Meh' }, { e: '😴', l: 'Tired' }, { e: '🫠', l: 'Overwhelmed' }, { e: '😶‍🌫️', l: 'Foggy' },
  { e: '😕', l: 'Confused' }, { e: '😟', l: 'Worried' }, { e: '😰', l: 'Anxious' }, { e: '😬', l: 'Tense' },
  { e: '😔', l: 'Down' }, { e: '😢', l: 'Sad' }, { e: '😭', l: 'Crying' }, { e: '😤', l: 'Frustrated' },
  { e: '😡', l: 'Angry' }, { e: '😣', l: 'In pain' }, { e: '🤒', l: 'Sick' }, { e: '🥴', l: 'Woozy' },
];

export const SYMPTOMS: Face[] = [
  { e: '🤕', l: 'Headache' }, { e: '🤢', l: 'Nausea' }, { e: '🤮', l: 'Threw up' }, { e: '🥴', l: 'Dizzy' },
  { e: '😴', l: 'Sleepy' }, { e: '💤', l: "Can't sleep" }, { e: '🤯', l: 'Brain fog' }, { e: '🫨', l: 'Shaky' },
  { e: '💓', l: 'Racing heart' }, { e: '🥵', l: 'Too hot' }, { e: '🥶', l: 'Chills' }, { e: '🌡️', l: 'Fever' },
  { e: '🤧', l: 'Stuffy' }, { e: '😮‍💨', l: 'Short of breath' }, { e: '🦴', l: 'Aches' }, { e: '🍽️', l: 'No appetite' },
  { e: '😋', l: 'Very hungry' }, { e: '🚽', l: 'Stomach upset' }, { e: '👄', l: 'Dry mouth' }, { e: '👀', l: 'Blurry vision' },
  { e: '🔆', l: 'Light bothers me' }, { e: '👂', l: 'Ringing ears' }, { e: '😖', l: 'Restless' }, { e: '🫥', l: 'Numb' },
];

export interface MoodEntry { mood: string; symptoms: string[]; note: string }
export type MoodLogs = Record<string, MoodEntry>;

const MOOD_KEY = 'medstreak:moods';

export function useMoodLogs() {
  const [logs, setLogs] = useState<MoodLogs>({});
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(MOOD_KEY)
        .then((raw) => setLogs(raw ? (JSON.parse(raw) as MoodLogs) : {}))
        .catch(() => {});
    }, []),
  );
  const save = useCallback(async (day: string, entry: MoodEntry | null) => {
    let cur: MoodLogs = {};
    try {
      const raw = await AsyncStorage.getItem(MOOD_KEY);
      cur = raw ? (JSON.parse(raw) as MoodLogs) : {};
    } catch {}
    if (entry) cur[day] = entry;
    else delete cur[day];
    setLogs({ ...cur });
    await AsyncStorage.setItem(MOOD_KEY, JSON.stringify(cur)).catch(() => {});
  }, []);
  return { logs, save };
}

export interface EmergencyCard {
  name: string;
  allergies: string;
  conditions: string;
  bloodType: string;
  contactName: string;
  contactPhone: string;
  doctor: string;
  notes: string;
}
export const EMPTY_CARD: EmergencyCard = { name: '', allergies: '', conditions: '', bloodType: '', contactName: '', contactPhone: '', doctor: '', notes: '' };
const CARD_KEY = 'medstreak:emergency';

export function useEmergencyCard() {
  const [card, setCard] = useState<EmergencyCard>(EMPTY_CARD);
  const [loaded, setLoaded] = useState(false);
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(CARD_KEY)
        .then((raw) => setCard({ ...EMPTY_CARD, ...(raw ? (JSON.parse(raw) as Partial<EmergencyCard>) : {}) }))
        .catch(() => {})
        .finally(() => setLoaded(true));
    }, []),
  );
  const save = useCallback(async (next: EmergencyCard) => {
    setCard(next);
    await AsyncStorage.setItem(CARD_KEY, JSON.stringify(next)).catch(() => {});
  }, []);
  return { card, save, loaded };
}
