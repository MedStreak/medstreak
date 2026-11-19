import { addDays, daysBetween, dayOfYear } from './dates';
import type { DoseKey, Goal, Medication } from './types';

export const MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];
export const MAX_SHIELDS = 2;

export interface DoseSlot {
  key: DoseKey;
  med: Medication;
  time: string;
}

export const doseKey = (medId: string, time: string): DoseKey => `${medId}|${time}`;

/** All doses scheduled for a given day, sorted by time. */
export function dosesForDay(meds: Medication[], day: string): DoseSlot[] {
  const slots: DoseSlot[] = [];
  for (const med of meds) {
    if (!med.active || med.startDate > day) continue;
    for (const time of med.times) slots.push({ key: doseKey(med.id, time), med, time });
  }
  return slots.sort((a, b) => a.time.localeCompare(b.time) || a.med.name.localeCompare(b.med.name));
}

export type DayStatus = 'complete' | 'partial' | 'missed' | 'none' | 'future' | 'pending';

export interface DaySummary {
  day: string;
  scheduled: number;
  taken: number;
  status: DayStatus;
}

export function summarizeDay(
  meds: Medication[],
  logs: Record<string, DoseKey[]>,
  day: string,
  today: string,
): DaySummary {
  if (day > today) return { day, scheduled: 0, taken: 0, status: 'future' };
  const slots = dosesForDay(meds, day);
  const done = new Set(logs[day] ?? []);
  const taken = slots.filter((s) => done.has(s.key)).length;
  let status: DayStatus;
  if (slots.length === 0) status = 'none';
  else if (taken === slots.length) status = 'complete';
  else if (day === today) status = 'pending';
  else status = taken > 0 ? 'partial' : 'missed';
  return { day, scheduled: slots.length, taken, status };
}

export interface StreakInfo {
  current: number;
  best: number;
  shields: number;
  completedToday: boolean;
  /** First day of the current run, or null when there is no active run. */
  startDay: string | null;
}

/**
 * Day-by-day simulation. A day is "complete" when every scheduled dose was taken.
 * - Today being incomplete never breaks the streak (the day isn't over).
 * - Every 7th consecutive day earns a streak shield (max 2). A shield silently
 *   covers one missed day instead of resetting the streak.
 */
export function computeStreak(
  meds: Medication[],
  logs: Record<string, DoseKey[]>,
  today: string,
  frozen: string[] = [],
): StreakInfo {
  const active = meds.filter((m) => m.active);
  if (active.length === 0) {
    return { current: 0, best: 0, shields: 0, completedToday: false, startDay: null };
  }
  const first = active.reduce((min, m) => (m.startDate < min ? m.startDate : min), today);

  let current = 0;
  let best = 0;
  let shields = 0;
  let startDay: string | null = null;
  let completedToday = false;

  const total = daysBetween(first, today);
  for (let i = 0; i <= total; i++) {
    const day = addDays(first, i);
    const s = summarizeDay(active, logs, day, today);
    if (s.status === 'none' || s.status === 'future') continue;

    // Refill tracking: a day with nothing logged at all (didn't open the app) doesn't count against you
    // when every active medication tracks its pills. It adds nothing toward prizes either.
    if (s.status === 'missed' && day !== today && (logs[day]?.length ?? 0) === 0 && active.every((m) => m.pillsRemaining !== null)) continue;

    // A day frozen on purpose: spends one freeze, keeps the streak, adds nothing.
    // If the day ends up completed anyway, the freeze isn't spent.
    if (s.status !== 'complete' && frozen.includes(day) && shields > 0) {
      shields -= 1;
      continue;
    }

    if (s.status === 'complete') {
      if (current === 0) startDay = day;
      current += 1;
      best = Math.max(best, current);
      if (current % 7 === 0) shields = Math.min(MAX_SHIELDS, shields + 1);
      if (day === today) completedToday = true;
    } else if (day !== today) {
      // missed or partial in the past
      if (shields > 0 && current > 0) {
        shields -= 1;
      } else {
        current = 0;
        startDay = null;
      }
    }
  }
  return { current, best, shields, completedToday, startDay };
}

/** % of scheduled doses taken over the last `days` days (today counts only once complete). */
export function adherence(
  meds: Medication[],
  logs: Record<string, DoseKey[]>,
  today: string,
  days: number,
): number | null {
  let scheduled = 0;
  let taken = 0;
  for (let i = 0; i < days; i++) {
    const s = summarizeDay(meds, logs, addDays(today, -i), today);
    if (s.status === 'none' || s.status === 'future') continue;
    if (s.status === 'pending') continue;
    scheduled += s.scheduled;
    taken += s.taken;
  }
  if (scheduled === 0) return null;
  return Math.round((taken / scheduled) * 100);
}

export function nextMilestone(current: number): number | null {
  return MILESTONES.find((m) => m > current) ?? null;
}

export interface GoalProgress {
  value: number;
  target: number;
  fraction: number;
  done: boolean;
  label: string;
}

export function goalProgress(
  goal: Goal,
  streak: StreakInfo,
  adherence30: number | null,
): GoalProgress {
  if (goal.type === 'streak') {
    const value = Math.min(streak.current, goal.target);
    return {
      value,
      target: goal.target,
      fraction: goal.target ? value / goal.target : 0,
      done: streak.current >= goal.target,
      label: `${streak.current} / ${goal.target} day streak`,
    };
  }
  if (goal.type === 'adherence') {
    const v = adherence30 ?? 0;
    return {
      value: v,
      target: goal.target,
      fraction: Math.min(1, v / goal.target),
      done: adherence30 !== null && v >= goal.target,
      label: `${v}% / ${goal.target}% over the last 30 days`,
    };
  }
  const done = goal.achievedAt !== null;
  return { value: done ? 1 : 0, target: 1, fraction: done ? 1 : 0, done, label: done ? 'Done' : 'Not done yet' };
}

const MESSAGES = [
  'Small daily wins add up to big health.',
  'Future you says thank you.',
  'One dose at a time. You’ve got this.',
  'Consistency beats perfection.',
  'Showing up for yourself is a superpower.',
  'Your streak is proof you can do hard things.',
  'Every check-in is a vote for your health.',
  'Missed a day? Just start again. Progress isn’t lost.',
  'You’re building a habit that builds you.',
  'Keep the chain going. You’re doing great.',
];

export function motivationalMessage(d: Date = new Date()): string {
  return MESSAGES[dayOfYear(d) % MESSAGES.length];
}

export function celebrationMessage(streak: number): string {
  if (streak <= 1) return 'Day one done! Every streak starts here.';
  if (streak < 7) return `${streak} days in a row. Keep it rolling!`;
  if (streak < 30) return `${streak}-day streak. You’re on fire!`;
  return `${streak} days straight. Unstoppable!`;
}

/** Fully completed check-in days needed for each surprise. */
export const SURPRISE_EVERY = 10;

/** Cute stickers that can be won, shown next to your name on your profile. */
export const SURPRISE_STICKERS = ['🦚', '🎠', '🧞', '🍡', '🧶', '🐚', '🦩', '🪁', '🧁', '🫖', '🪅', '🦭'];

/**
 * Days since the last surprise on which every dose was taken. Skipped days (no log at all)
 * never add to this, and never take away from it.
 */
export function surpriseProgress(
  meds: Medication[],
  logs: Record<string, DoseKey[]>,
  base: string | null,
  today: string,
): number {
  const active = meds.filter((m) => m.active);
  if (active.length === 0) return 0;
  const first = active.reduce((min, m) => (m.startDate < min ? m.startDate : min), today);
  const from = base && base >= first ? addDays(base, 1) : first;
  let n = 0;
  const total = daysBetween(from, today);
  for (let i = 0; i <= total; i++) {
    const day = addDays(from, i);
    if (summarizeDay(active, logs, day, today).status === 'complete') n++;
  }
  return n;
}
