import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const DEFAULT_DAILY_REMINDER_HOUR = 21;
export const DEFAULT_DAILY_REMINDER_MINUTE = 0;
export const DAILY_REMINDER_CHANNEL_ID = 'daily-reminders';

let notificationsConfigured = false;

export function configureNotifications() {
  if (notificationsConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  notificationsConfigured = true;
}

export async function ensureReminderChannelAsync() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(DAILY_REMINDER_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 120, 60, 120],
    lightColor: '#F6B117',
  });
}

export async function requestDailyReminderPermissionsAsync() {
  await ensureReminderChannelAsync();

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.status === 'granted') {
    return true;
  }

  const nextPermissions = await Notifications.requestPermissionsAsync();
  return nextPermissions.status === 'granted';
}

export async function scheduleDailyReminderAsync(hour: number, minute: number) {
  await ensureReminderChannelAsync();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Log today's spending",
      body: 'Open Locket Budget and capture one spending moment before the day ends.',
      data: {
        kind: 'daily-reminder',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: Platform.OS === 'android' ? DAILY_REMINDER_CHANNEL_ID : undefined,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminderAsync(notificationId: string | null) {
  if (!notificationId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
