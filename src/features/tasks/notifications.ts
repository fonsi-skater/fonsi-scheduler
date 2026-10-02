import * as Notifications from "expo-notifications";
import { addMinutes, parse } from "date-fns";
import { Platform } from "react-native";

import type { Task } from "@/api/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleTaskReminder(task: Task, enabled: boolean): Promise<void> {
  if (!enabled || task.reminderMinutes === null || !(await ensureNotificationPermission())) return;
  const start = parse(`${task.date} ${task.startTime}`, "yyyy-MM-dd HH:mm", new Date());
  const trigger = addMinutes(start, -task.reminderMinutes);
  if (trigger <= new Date()) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Coming up",
      body: `${task.title} starts in ${task.reminderMinutes} minutes.`,
      data: { taskId: task.id }
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger }
  });
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    notifications
      .filter((notification) => notification.content.data.taskId === taskId)
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier))
  );
}

export async function cancelAllTaskReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
