import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { dateKey } from '../lib/dates';
import { ACTION_SNOOZE, ACTION_TAKEN, snoozeDose } from '../lib/notifications';
import { doseKey } from '../lib/streak';
import { useApp } from '../state/AppState';

/** Handles taps and action buttons (Taken / Snooze) on notifications. */
export function NotificationResponder() {
  const { loaded, data, toggleDose, openPrompt } = useApp();
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!loaded || !response) return;
    const id = `${response.notification.request.identifier}:${response.actionIdentifier}:${response.notification.date}`;
    if (handled.current === id) return;
    handled.current = id;

    const payload = response.notification.request.content.data as
      | { type?: string; medId?: string; time?: string }
      | undefined;
    if (!payload) return;
    const med = data.meds.find((m) => m.id === payload.medId);

    if (payload.type === 'dose' && med && payload.time) {
      const key = doseKey(med.id, payload.time);
      const today = dateKey();
      if (response.actionIdentifier === ACTION_TAKEN) {
        if (!(data.logs[today] ?? []).includes(key)) toggleDose(today, key);
      } else if (response.actionIdentifier === ACTION_SNOOZE) {
        snoozeDose(med.name, med.id, payload.time).catch(() => {});
      } else {
        openPrompt();
      }
    } else if (payload.type === 'checkin') {
      openPrompt();
    }
  }, [loaded, response, data.meds, data.logs, toggleDose, openPrompt]);

  return null;
}
