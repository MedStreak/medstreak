export interface Medication {
  id: string;
  name: string;
  dosage: string;
  /** Times of day in 24h "HH:mm" format. */
  times: string[];
  color: string;
  /** First day (YYYY-MM-DD) this medication counts toward streaks. */
  startDate: string;
  /** Optional pill inventory for refill tracking. */
  pillsRemaining: number | null;
  pillsPerDose: number;
  /** Alert when this many days of supply (or fewer) remain. */
  refillDays: number;
  active: boolean;
  /** Days of the week (0 = Sunday ... 6 = Saturday) this is taken. Missing or null = every day. */
  days?: number[] | null;
}

/** Key of a single scheduled dose: `${medId}|${HH:mm}`. */
export type DoseKey = string;

export type GoalType = 'streak' | 'adherence' | 'custom';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  /** streak: days. adherence: percent over the last 30 days. custom: ignored. */
  target: number;
  reward: string;
  createdAt: string;
  achievedAt: string | null;
}

export interface Settings {
  remindersOn: boolean;
  checkInHour: number;
  checkInMinute: number;
  nickname: string;
  acceptedChatTerms: boolean;
  /** Chat keys (opaque person ids) I have blocked. */
  blocked: string[];
  /** I have acknowledged my chat warning. */
  warnAcked: boolean;
  /** Last day (YYYY-MM-DD) the daily check-in popup was answered/closed. */
  lastPromptDate: string | null;
  /** Streak milestones already celebrated, as `${streakStartDay}:${days}`. */
  celebratedMilestones: string[];
  /** Selected color theme id. */
  theme: string;
  /** Accent color id overriding the theme's main color, or null for the theme's own. */
  accent: string | null;
  /** Corner style: sharp | soft | round. */
  corners: string;
  /** My chat bubble color (hex), or null to match my theme. */
  bubbleColor: string | null;
  /** Days (YYYY-MM-DD) I froze on purpose; each spends one streak freeze unless the day was completed. */
  frozenDays: string[];
  /** My own theme (used when theme === 'custom'). */
  customTheme: import('./theme').CustomTheme;
  /** Particle override for any theme: a particle id, 'none', or null to use the theme's own. */
  particle: string | null;
  /** Unlockable themes I have earned. */
  unlockedThemes: string[];
  /** Day (YYYY-MM-DD) the last surprise was opened; check-in days after it count toward the next one. */
  surpriseBase: string | null;
  /** Stickers I have earned from surprises. */
  stickers: string[];
  /** How many surprises I have opened. */
  surprisesOpened: number;
  /** Custom tab bar icons (emoji) by tab name; missing = default. */
  tabIcons: Record<string, string>;
  /** Custom background picture or GIF (a file kept on this phone), or null. */
  bgImage: string | null;
  /** How much to darken the background picture, 0 to 80 percent. */
  bgDim: number;
  /** Let the background picture show faintly through cards. */
  bgSeeThrough: boolean;
}

export interface Persisted {
  meds: Medication[];
  logs: Record<string, DoseKey[]>;
  goals: Goal[];
  settings: Settings;
}

export interface Celebration {
  kind: 'dose' | 'milestone' | 'goal';
  title: string;
  subtitle: string;
}
