import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const KEY = 'medstreak:lastCrash';
const REPO = 'MedStreak/medstreak';

export interface CrashReport {
  time: string;
  message: string;
  stack: string;
  version: string;
  os: string;
  fatal: boolean;
}

/** Saves a crash on the phone only. Nothing is sent anywhere unless the person taps Share / Report. */
export async function saveCrash(error: unknown, fatal: boolean): Promise<void> {
  const e = error as { message?: string; stack?: string } | undefined;
  const report: CrashReport = {
    time: new Date().toISOString(),
    message: String(e?.message ?? error ?? 'Unknown error').slice(0, 500),
    stack: String(e?.stack ?? '').slice(0, 3000),
    version: Constants.expoConfig?.version ?? '?',
    os: `${Platform.OS} ${String(Platform.Version)}`,
    fatal,
  };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(report));
  } catch {}
}

export function installCrashHandler(): void {
  const g = globalThis as unknown as {
    ErrorUtils?: { getGlobalHandler?: () => (e: unknown, f?: boolean) => void; setGlobalHandler: (h: (e: unknown, f?: boolean) => void) => void };
    __msCrashInstalled?: boolean;
  };
  if (!g.ErrorUtils || g.__msCrashInstalled) return;
  g.__msCrashInstalled = true;
  const prev = g.ErrorUtils.getGlobalHandler?.();
  g.ErrorUtils.setGlobalHandler((e, fatal) => {
    saveCrash(e, Boolean(fatal));
    prev?.(e, fatal);
  });
}

export async function loadCrash(): Promise<CrashReport | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CrashReport) : null;
  } catch {
    return null;
  }
}

export async function clearCrash(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}

export function formatReport(r: CrashReport): string {
  return `MedStreak ${r.version} on ${r.os}\n${r.time}${r.fatal ? ' (app closed)' : ''}\n\n${r.message}\n\n${r.stack}`;
}

export function githubIssueUrl(r: CrashReport): string {
  const body = formatReport(r).slice(0, 1500);
  return `https://github.com/${REPO}/issues/new?title=${encodeURIComponent('Crash: ' + r.message.slice(0, 70))}&body=${encodeURIComponent('What I was doing:\n\n```\n' + body + '\n```')}`;
}
