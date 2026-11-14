import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState as RNAppState, Platform } from 'react-native';
import { dateKey } from '../lib/dates';
import { THEMES } from '../lib/theme';
import { ensurePermission, notifyRefill, rescheduleAll, setupNotifications } from '../lib/notifications';
import {
  MILESTONES,
  StreakInfo,
  adherence,
  celebrationMessage,
  computeStreak,
  dosesForDay,
  goalProgress,
} from '../lib/streak';
import type {
  Celebration,
  DoseKey,
  Goal,
  Medication,
  Persisted,
  Settings,
} from '../lib/types';

const STORAGE_KEY = 'medstreak:v1';

export const defaultSettings: Settings = {
  remindersOn: true,
  checkInHour: 21,
  checkInMinute: 0,
  nickname: '',
  acceptedChatTerms: false,
  blocked: [],
  warnAcked: false,
  lastPromptDate: null,
  celebratedMilestones: [],
  theme: 'sunrise',
  accent: null,
  corners: 'soft',
  bubbleColor: null,
  frozenDays: [],
  unlockedThemes: [],
};

const emptyState: Persisted = { meds: [], logs: {}, goals: [], settings: defaultSettings };

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export type PromptAnswer = 'yes' | 'later' | 'missed';

interface Ctx {
  loaded: boolean;
  data: Persisted;
  today: string;
  streak: StreakInfo;
  adherence30: number | null;
  celebration: Celebration | null;
  promptVisible: boolean;
  addMed: (m: Omit<Medication, 'id' | 'startDate' | 'active'>) => void;
  updateMed: (id: string, patch: Partial<Medication>) => void;
  deleteMed: (id: string) => void;
  toggleDose: (day: string, key: DoseKey) => void;
  addGoal: (g: Pick<Goal, 'title' | 'type' | 'target' | 'reward'>) => void;
  deleteGoal: (id: string) => void;
  completeCustomGoal: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  blockUser: (uid: string) => void;
  dismissCelebration: () => void;
  openPrompt: () => void;
  answerPrompt: (a: PromptAnswer) => void;
  /** Pending (not yet taken) doses for today. */
  pendingToday: () => ReturnType<typeof dosesForDay>;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

function daysOfSupply(m: Medication): number | null {
  if (m.pillsRemaining === null) return null;
  const perDay = Math.max(1, m.pillsPerDose * m.times.length);
  return Math.floor(m.pillsRemaining / perDay);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Persisted>(emptyState);
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState(dateKey());
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [promptVisible, setPromptVisible] = useState(false);
  const [foregroundTick, setForegroundTick] = useState(0);
  const ref = useRef<Persisted>(emptyState);

  const commit = useCallback((next: Persisted) => {
    ref.current = next;
    setData(next);
  }, []);

  // ---- load ----
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          commit({
            meds: parsed.meds ?? [],
            logs: parsed.logs ?? {},
            goals: parsed.goals ?? [],
            settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
          });
        }
      } catch {
        // corrupt storage: start fresh rather than crash
      }
      if (Platform.OS !== 'web') {
        try {
          await setupNotifications();
        } catch {}
      }
      setLoaded(true);
    })();
  }, [commit]);

  // ---- persist ----
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  // ---- keep "today" fresh when app returns to foreground ----
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') {
        setToday(dateKey());
        setForegroundTick((t) => t + 1);
      }
    });
    return () => sub.remove();
  }, []);

  // ---- reschedule reminders when meds / reminder settings change ----
  const { meds, settings } = data;
  useEffect(() => {
    if (!loaded || Platform.OS === 'web') return;
    (async () => {
      try {
        if (settings.remindersOn && !(await ensurePermission())) return;
        await rescheduleAll(meds, settings);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, meds, settings.remindersOn, settings.checkInHour, settings.checkInMinute]);

  const streak = useMemo(() => computeStreak(data.meds, data.logs, today, data.settings.frozenDays),
    [data.meds, data.logs, today, data.settings.frozenDays],
  );
  const adherence30 = useMemo(() => adherence(data.meds, data.logs, today, 30), [data.meds, data.logs, today]);

  const pendingToday = useCallback(() => {
    const done = new Set(ref.current.logs[today] ?? []);
    return dosesForDay(ref.current.meds, today).filter((s) => !done.has(s.key));
  }, [today]);

  const pushCelebration = useCallback((c: Celebration) => {
    setCelebrations((q) => [...q, c]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  // ---- daily popup: on launch / return to foreground, once per day, while doses are pending ----
  useEffect(() => {
    if (!loaded) return;
    if (ref.current.settings.lastPromptDate === today) return;
    if (pendingToday().length > 0) setPromptVisible(true);
  }, [loaded, today, foregroundTick, pendingToday]);

  // ---- goal achievement ----
  useEffect(() => {
    if (!loaded) return;
    const cur = ref.current;
    const newlyDone = cur.goals.filter(
      (g) => g.achievedAt === null && g.type !== 'custom' && goalProgress(g, streak, adherence30).done,
    );
    if (newlyDone.length === 0) return;
    const stamp = dateKey();
    commit({
      ...cur,
      goals: cur.goals.map((g) => (newlyDone.some((n) => n.id === g.id) ? { ...g, achievedAt: stamp } : g)),
    });
    for (const g of newlyDone) {
      pushCelebration({
        kind: 'goal',
        title: 'Goal reached! 🏆',
        subtitle: g.reward ? `${g.title}\nReward: ${g.reward}` : g.title,
      });
    }
  }, [loaded, streak, adherence30, data.goals, commit, pushCelebration]);

  // ---- unlock animated themes as the best streak grows ----
  useEffect(() => {
    if (!loaded) return;
    const cur = ref.current;
    const fresh = THEMES.filter(
      (t) => t.unlock !== undefined && streak.best >= t.unlock && !cur.settings.unlockedThemes.includes(t.id),
    );
    if (fresh.length === 0) return;
    commit({
      ...cur,
      settings: { ...cur.settings, unlockedThemes: [...cur.settings.unlockedThemes, ...fresh.map((t) => t.id)] },
    });
    for (const t of fresh) {
      pushCelebration({
        kind: 'goal',
        title: 'Theme unlocked! 🎨',
        subtitle: `${t.emoji} ${t.name} is ready on the Themes tab.`,
      });
    }
  }, [loaded, streak.best, commit, pushCelebration]);

  // ---- actions ----
  const takeDoses = useCallback(
    (day: string, keys: DoseKey[], taken: boolean) => {
      const prev = ref.current;
      const todayKey = dateKey();
      const before = computeStreak(prev.meds, prev.logs, todayKey, prev.settings.frozenDays);
      const set = new Set(prev.logs[day] ?? []);
      let meds = prev.meds;
      const refillAlerts: { name: string; days: number }[] = [];

      for (const key of keys) {
        const has = set.has(key);
        if (taken === has) continue;
        if (taken) set.add(key);
        else set.delete(key);
        const medId = key.split('|')[0];
        meds = meds.map((m) => {
          if (m.id !== medId || m.pillsRemaining === null) return m;
          const next = Math.max(0, m.pillsRemaining + (taken ? -m.pillsPerDose : m.pillsPerDose));
          const updated = { ...m, pillsRemaining: next };
          const b = daysOfSupply(m);
          const a = daysOfSupply(updated);
          if (taken && a !== null && b !== null && a <= m.refillDays && b > m.refillDays) {
            refillAlerts.push({ name: m.name, days: a });
          }
          return updated;
        });
      }

      const logs = { ...prev.logs, [day]: Array.from(set) };
      const next = { ...prev, meds, logs };
      commit(next);

      const after = computeStreak(meds, logs, todayKey, prev.settings.frozenDays);
      refillAlerts.forEach((r) => notifyRefill(r.name, r.days).catch(() => {}));

      if (taken && day === todayKey && !before.completedToday && after.completedToday) {
        const mKey = after.startDay ? `${after.startDay}:${after.current}` : '';
        if (MILESTONES.includes(after.current) && mKey && !prev.settings.celebratedMilestones.includes(mKey)) {
          commit({
            ...next,
            settings: {
              ...next.settings,
              celebratedMilestones: [...next.settings.celebratedMilestones, mKey],
            },
          });
          pushCelebration({
            kind: 'milestone',
            title: `${after.current}-day streak! 🔥`,
            subtitle: 'New milestone unlocked. Be proud of yourself.',
          });
        } else {
          pushCelebration({
            kind: 'dose',
            title: 'Nice work! 🎉',
            subtitle: celebrationMessage(after.current),
          });
        }
      }
    },
    [commit, pushCelebration],
  );

  const toggleDose = useCallback(
    (day: string, key: DoseKey) => {
      const has = (ref.current.logs[day] ?? []).includes(key);
      takeDoses(day, [key], !has);
    },
    [takeDoses],
  );

  const addMed: Ctx['addMed'] = useCallback(
    (m) => {
      const cur = ref.current;
      commit({ ...cur, meds: [...cur.meds, { ...m, id: newId(), startDate: dateKey(), active: true }] });
    },
    [commit],
  );

  const updateMed: Ctx['updateMed'] = useCallback(
    (id, patch) => {
      const cur = ref.current;
      commit({ ...cur, meds: cur.meds.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
    },
    [commit],
  );

  const deleteMed: Ctx['deleteMed'] = useCallback(
    (id) => {
      const cur = ref.current;
      // Soft-delete keeps past history (and past streak days) intact.
      commit({ ...cur, meds: cur.meds.map((m) => (m.id === id ? { ...m, active: false } : m)) });
    },
    [commit],
  );

  const addGoal: Ctx['addGoal'] = useCallback(
    (g) => {
      const cur = ref.current;
      commit({ ...cur, goals: [...cur.goals, { ...g, id: newId(), createdAt: dateKey(), achievedAt: null }] });
    },
    [commit],
  );

  const deleteGoal = useCallback(
    (id: string) => {
      const cur = ref.current;
      commit({ ...cur, goals: cur.goals.filter((g) => g.id !== id) });
    },
    [commit],
  );

  const completeCustomGoal = useCallback(
    (id: string) => {
      const cur = ref.current;
      const goal = cur.goals.find((g) => g.id === id);
      if (!goal || goal.achievedAt) return;
      commit({ ...cur, goals: cur.goals.map((g) => (g.id === id ? { ...g, achievedAt: dateKey() } : g)) });
      pushCelebration({
        kind: 'goal',
        title: 'Goal reached! 🏆',
        subtitle: goal.reward ? `${goal.title}\nReward: ${goal.reward}` : goal.title,
      });
    },
    [commit, pushCelebration],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const cur = ref.current;
      commit({ ...cur, settings: { ...cur.settings, ...patch } });
    },
    [commit],
  );

  const blockUser = useCallback(
    (uid: string) => {
      const cur = ref.current;
      if (cur.settings.blocked.includes(uid)) return;
      commit({ ...cur, settings: { ...cur.settings, blocked: [...cur.settings.blocked, uid] } });
    },
    [commit],
  );

  const openPrompt = useCallback(() => {
    if (pendingToday().length > 0) setPromptVisible(true);
  }, [pendingToday]);

  const answerPrompt = useCallback(
    (a: PromptAnswer) => {
      setPromptVisible(false);
      if (a === 'later') return;
      const todayKey = dateKey();
      if (a === 'yes') {
        const keys = dosesForDay(ref.current.meds, todayKey).map((s) => s.key);
        takeDoses(todayKey, keys, true);
      }
      const cur = ref.current;
      commit({ ...cur, settings: { ...cur.settings, lastPromptDate: todayKey } });
    },
    [commit, takeDoses],
  );

  const dismissCelebration = useCallback(() => setCelebrations((q) => q.slice(1)), []);

  const value: Ctx = {
    loaded,
    data,
    today,
    streak,
    adherence30,
    celebration: celebrations[0] ?? null,
    promptVisible,
    addMed,
    updateMed,
    deleteMed,
    toggleDose,
    addGoal,
    deleteGoal,
    completeCustomGoal,
    updateSettings,
    blockUser,
    dismissCelebration,
    openPrompt,
    answerPrompt,
    pendingToday,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
