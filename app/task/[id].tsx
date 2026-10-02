import { useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { friendlyError } from "@/api/errors";
import type { Task, TaskInput } from "@/api/types";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TaskForm } from "@/components/TaskForm";
import { useTasks, useUpdateTask } from "@/features/tasks/hooks";
import { cancelTaskReminder, scheduleTaskReminder } from "@/features/tasks/notifications";
import { usePreferences } from "@/store/preferences";
import { useToast } from "@/store/toast";
import { palette, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

function asInput(task: Task): TaskInput {
  return {
    title: task.title,
    notes: task.notes,
    date: task.date,
    startTime: task.startTime,
    endTime: task.endTime,
    category: task.category,
    priority: task.priority,
    reminderMinutes: task.reminderMinutes
  };
}

export default function EditTaskScreen() {
  const colors = useAppColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tasksQuery = useTasks();
  const task = useMemo(() => tasksQuery.data?.find((item) => item.id === id), [id, tasksQuery.data]);
  const updateTask = useUpdateTask();
  const defaultReminderMinutes = usePreferences((state) => state.defaultReminderMinutes);
  const notificationsEnabled = usePreferences((state) => state.notificationsEnabled);
  const showToast = useToast((state) => state.show);

  function submit(input: TaskInput) {
    if (!task) return;
    updateTask.mutate(
      { id: task.id, input },
      {
        onSuccess: async (updated) => {
          try {
            await cancelTaskReminder(task.id);
            await scheduleTaskReminder(updated, notificationsEnabled);
          } catch (error) {
            showToast(friendlyError(error));
          }
          router.back();
        },
        onError: (error) => showToast(friendlyError(error))
      }
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ScreenHeader title="Edit task" subtitle={task?.title} onBack={() => router.back()} />
      </View>
      {task ? (
        <TaskForm
          key={task.id}
          initialValues={asInput(task)}
          defaultReminderMinutes={defaultReminderMinutes}
          onSubmit={submit}
          submitting={updateTask.isPending}
          submitLabel="Save changes"
        />
      ) : tasksQuery.isError ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void tasksQuery.refetch()}
          style={styles.message}
        >
          <Text style={[styles.messageText, { color: colors.mutedText }]}>
            {friendlyError(tasksQuery.error)} · Tap to retry
          </Text>
        </Pressable>
      ) : (
        <View style={styles.message}>
          <Text style={[styles.messageText, { color: colors.mutedText }]}>
            {tasksQuery.isLoading ? "Loading task…" : "This task is no longer available."}
          </Text>
          {!tasksQuery.isLoading ? (
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}>Go back</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  message: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  messageText: { fontSize: typography.body, textAlign: "center", lineHeight: 22 },
  back: { marginTop: spacing.md, color: palette.violet, fontWeight: "700" }
});
