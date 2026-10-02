import { Alert } from "react-native";
import * as Haptics from "expo-haptics";

import type { Task } from "@/api/types";
import { friendlyError } from "@/api/errors";
import { cancelTaskReminder, scheduleTaskReminder } from "@/features/tasks/notifications";
import { usePreferences } from "@/store/preferences";
import { useToast } from "@/store/toast";
import { useCreateTask, useDeleteTask, useSetTaskCompleted } from "@/features/tasks/hooks";

export function useTaskActions() {
  const completion = useSetTaskCompleted();
  const deletion = useDeleteTask();
  const createTask = useCreateTask();
  const restoreCompletion = useSetTaskCompleted();
  const notificationsEnabled = usePreferences((state) => state.notificationsEnabled);
  const showToast = useToast((state) => state.show);

  function toggle(task: Task) {
    const completed = task.status !== "completed";
    completion.mutate(
      { id: task.id, completed },
      {
        onSuccess: (updated) => {
          void (completed
            ? cancelTaskReminder(updated.id)
            : scheduleTaskReminder(updated, notificationsEnabled));
          if (completed) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onError: (error) => {
          if (completed) {
            void scheduleTaskReminder(task, notificationsEnabled).catch((notificationError: unknown) =>
              showToast(friendlyError(notificationError))
            );
          }
          showToast(friendlyError(error));
        }
      }
    );
  }

  function confirmDelete(task: Task) {
    Alert.alert("Delete this task?", task.title, [
      { text: "Keep task", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          void cancelTaskReminder(task.id).catch((error: unknown) => showToast(friendlyError(error)));
          deletion.mutate(task.id, {
            onSuccess: () => {
              showToast("Task deleted", "Undo", () => {
                const input = {
                  title: task.title,
                  notes: task.notes,
                  date: task.date,
                  startTime: task.startTime,
                  endTime: task.endTime,
                  category: task.category,
                  priority: task.priority,
                  reminderMinutes: task.reminderMinutes
                };
                createTask.mutate(input, {
                  onSuccess: (restored) => {
                    const restoreReminder = (restoredTask: Task) => {
                      void scheduleTaskReminder(restoredTask, notificationsEnabled).catch((error: unknown) =>
                        showToast(friendlyError(error))
                      );
                    };
                    if (task.status === "completed") {
                      restoreCompletion.mutate(
                        { id: restored.id, completed: true },
                        {
                          onError: (error) => {
                            showToast(friendlyError(error));
                            restoreReminder(restored);
                          }
                        }
                      );
                    } else {
                      restoreReminder(restored);
                    }
                  },
                  onError: (error) => {
                    void scheduleTaskReminder(task, notificationsEnabled).catch(
                      (notificationError: unknown) => showToast(friendlyError(notificationError))
                    );
                    showToast(friendlyError(error));
                  }
                });
              });
            },
            onError: (error) => showToast(friendlyError(error))
          });
        }
      }
    ]);
  }

  return { toggle, confirmDelete };
}
