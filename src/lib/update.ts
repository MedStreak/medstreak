import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

const REPO = 'MedStreak/medstreak';
const DISMISSED_KEY = 'medstreak:dismissedUpdate';
const MIN_GAP_MS = 30 * 60 * 1000;

export interface UpdateInfo {
  version: string;
  url: string;
}

export const currentVersion = (): string => Constants.expoConfig?.version ?? '0.0.0';

const parse = (v: string) => v.replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);

export function isNewer(candidate: string, installed: string): boolean {
  const a = parse(candidate);
  const b = parse(installed);
  for (let i = 0; i < 3; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

let lastCheck = 0;
let lastResult: UpdateInfo | null = null;

/** Asks GitHub (free, no account) for the newest release. Returns null when up to date or offline. */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  if (Platform.OS !== 'android') return null;
  if (Date.now() - lastCheck < MIN_GAP_MS) return lastResult;
  lastCheck = Date.now();
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return (lastResult = null);
    const rel = (await res.json()) as { tag_name?: string; assets?: { name: string; browser_download_url: string }[] };
    const version = (rel.tag_name ?? '').replace(/^v/i, '');
    const apk = rel.assets?.find((a) => a.name.toLowerCase().endsWith('.apk'));
    if (!version || !apk || !isNewer(version, currentVersion())) return (lastResult = null);
    return (lastResult = { version, url: apk.browser_download_url });
  } catch {
    return (lastResult = null);
  }
}

/** Direct download link of the newest release's APK (looked up when sharing). Falls back to the releases page if offline. */
export async function latestApkUrl(): Promise<string> {
  const fallback = `https://github.com/${REPO}/releases/latest`;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const rel = (await res.json()) as { assets?: { name: string; browser_download_url: string }[] };
    return rel.assets?.find((x) => x.name.toLowerCase().endsWith('.apk'))?.browser_download_url ?? fallback;
  } catch {
    return fallback;
  }
}

/** Manual check for the Updates card: ignores the 30-minute pause and says why when there's nothing to install. */
export async function checkNow(): Promise<UpdateInfo | 'current' | 'error'> {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 10000);
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: ctl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return 'error';
    const rel = (await res.json()) as { tag_name?: string; assets?: { name: string; browser_download_url: string }[] };
    const version = (rel.tag_name ?? '').replace(/^v/i, '');
    const apk = rel.assets?.find((x) => x.name.toLowerCase().endsWith('.apk'));
    if (!version) return 'error';
    if (!apk || !isNewer(version, currentVersion())) return 'current';
    return { version, url: apk.browser_download_url };
  } catch {
    return 'error';
  }
}

export async function dismissedVersion(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

export async function dismissUpdate(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISSED_KEY, version);
  } catch {}
}

/**
 * Downloads the new APK inside the app and opens Android's installer. Android never lets an app
 * install itself silently, so the person taps "Install" once. Their data is kept.
 */
export async function downloadAndInstall(url: string, onProgress: (fraction: number) => void): Promise<void> {
  if (Platform.OS !== 'android') throw new Error('Android only');
  const dest = `${FileSystem.cacheDirectory}MedStreak-update.apk`;
  await FileSystem.deleteAsync(dest, { idempotent: true });
  const dl = FileSystem.createDownloadResumable(url, dest, {}, (p) => {
    if (p.totalBytesExpectedToWrite > 0) onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
  });
  const res = await dl.downloadAsync();
  if (!res || res.status >= 400) throw new Error('download failed');
  const contentUri = await FileSystem.getContentUriAsync(res.uri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    type: 'application/vnd.android.package-archive',
  });
}
