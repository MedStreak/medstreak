import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { formatTime } from './dates';
import type { Medication, Settings } from './types';

const CHANNEL_ID = 'reminders-v2';
export const CATEGORY_DOSE = 'dose-reminder';
export const ACTION_TAKEN = 'TAKEN';
export const ACTION_SNOOZE = 'SNOOZE';
export const SNOOZE_MINUTES = 10;

// Show notifications even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Medication reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7A45',
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
    await Notifications.deleteNotificationChannelAsync('reminders').catch(() => {});
  }
  await Notifications.setNotificationCategoryAsync(CATEGORY_DOSE, [
    { identifier: ACTION_TAKEN, buttonTitle: 'Taken ✓', options: { opensAppToForeground: true } },
    { identifier: ACTION_SNOOZE, buttonTitle: `Snooze ${SNOOZE_MINUTES} min`, options: { opensAppToForeground: false } },
  ]);
}

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

const REMINDER_COPY = [
  'Time for your {med}. Keep the streak alive! 🔥',
  '{med} time. A tiny habit, a big payoff.',
  'Your {med} is waiting. You’ve got this 💪',
];

/**
 * Cancels everything and re-schedules: one repeating daily reminder per dose time,
 * plus one daily check-in. Called whenever medications or settings change.
 */
export let lastScheduleError: string | null = null;

export async function rescheduleAll(meds: Medication[], settings: Settings): Promise<void> {
  try {
    await rescheduleInner(meds, settings);
    lastScheduleError = null;
  } catch (e) {
    lastScheduleError = e instanceof Error ? e.message : String(e);
    throw e;
  }
}

async function rescheduleInner(meds: Medication[], settings: Settings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.remindersOn) return;

  let i = 0;
  for (const med of meds) {
    if (!med.active) continue;
    for (const time of med.times) {
      const [hour, minute] = time.split(':').map(Number);
      const body = REMINDER_COPY[i++ % REMINDER_COPY.length].replace('{med}', med.name);
      const content = {
        title: `${med.name}${med.dosage ? ` · ${med.dosage}` : ''}`,
        body,
        categoryIdentifier: CATEGORY_DOSE,
        data: { type: 'dose', medId: med.id, time },
        sound: true,
      };
      if (med.days && med.days.length > 0 && med.days.length < 7) {
        // Weekly or specific days: one repeating weekly alarm per chosen day (expo weekdays: 1 = Sunday).
        for (const d of med.days) {
          await Notifications.scheduleNotificationAsync({
            content,
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: d + 1,
              hour,
              minute,
              channelId: CHANNEL_ID,
              delivery: 'alarmClock',
            },
          });
        }
      } else {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId: CHANNEL_ID,
            delivery: 'alarmClock',
          },
        });
      }
    }
  }

  if (meds.some((m) => m.active)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily check-in',
        body: 'Did you take your meds today? Tap to log it and keep your streak going.',
        data: { type: 'checkin' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: settings.checkInHour,
        minute: settings.checkInMinute,
        channelId: CHANNEL_ID,
        delivery: 'alarmClock',
      },
    });
  }
}

export async function snoozeDose(medName: string, medId: string, time: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Snoozed: ${medName}`,
      body: `Reminder for your ${formatTime(time)} dose. Don’t break the streak!`,
      categoryIdentifier: CATEGORY_DOSE,
      data: { type: 'dose', medId, time },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000),
      channelId: CHANNEL_ID,
      delivery: 'alarmClock',
    },
  });
}

export async function notifyRefill(medName: string, daysLeft: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to refill',
      body: `${medName}: about ${Math.max(daysLeft, 0)} day(s) of pills left. Call your pharmacy soon.`,
      data: { type: 'refill' },
    },
    trigger: null,
  });
}

export interface ReminderHealth {
  allowed: boolean;
  queued: number;
  nextAt: Date | null;
  error: string | null;
  exactAlarms: boolean;
}

/** What the "Reminder check" card shows: permission state and what is actually queued. */
export async function reminderHealth(meds: Medication[]): Promise<ReminderHealth> {
  const perm = await Notifications.getPermissionsAsync();
  let exact = true;
  try {
    exact = (await Notifications.getExactAlarmPermissionsAsync()).granted;
  } catch {}
  const list = await Notifications.getAllScheduledNotificationsAsync();
  const now = new Date();
  let next: Date | null = null;
  for (const m of meds) {
    if (!m.active) continue;
    for (const t of m.times) {
      const [h, mi] = t.split(':').map(Number);
      for (let add = 0; add < 8; add++) {
        const d = new Date(now);
        d.setDate(d.getDate() + add);
        d.setHours(h, mi, 0, 0);
        if (d <= now) continue;
        if (m.days && m.days.length > 0 && !m.days.includes(d.getDay())) continue;
        if (!next || d < next) next = d;
        break;
      }
    }
  }
  return { allowed: perm.granted, queued: list.length, nextAt: next, error: lastScheduleError, exactAlarms: exact };
}

/** Fires a test reminder in 10 seconds so the person can confirm notifications really arrive. */
export async function sendTestReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'MedStreak test', body: 'It works! Your reminders will arrive like this. 🎉', sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(Date.now() + 10000), channelId: CHANNEL_ID, delivery: 'alarmClock' },
  });
}
