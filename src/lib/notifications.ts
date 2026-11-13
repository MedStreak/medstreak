import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { formatTime } from './dates';
import type { Medication, Settings } from './types';

const CHANNEL_ID = 'reminders';
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
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7A45',
    });
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
export async function rescheduleAll(meds: Medication[], settings: Settings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.remindersOn) return;

  let i = 0;
  for (const med of meds) {
    if (!med.active) continue;
    for (const time of med.times) {
      const [hour, minute] = time.split(':').map(Number);
      const body = REMINDER_COPY[i++ % REMINDER_COPY.length].replace('{med}', med.name);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${med.name}${med.dosage ? ` · ${med.dosage}` : ''}`,
          body,
          categoryIdentifier: CATEGORY_DOSE,
          data: { type: 'dose', medId: med.id, time },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: CHANNEL_ID,
        },
      });
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
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SNOOZE_MINUTES * 60,
      channelId: CHANNEL_ID,
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
