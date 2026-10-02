import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

import { friendlyError } from "@/api/errors";
import type { TaskInput } from "@/api/types";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TaskForm } from "@/components/TaskForm";
import { useCreateTask } from "@/features/tasks/hooks";
import { scheduleTaskReminder } from "@/features/tasks/notifications";
import { usePreferences } from "@/store/preferences";
import { useToast } from "@/store/toast";
import { spacing } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

export default function NewTaskScreen() {
  const colors = useAppColors();
  const params = useLocalSearchParams<{ date?: string }>();
  const createTask = useCreateTask();
  const defaultReminderMinutes = usePreferences((state) => state.defaultReminderMinutes);
  const notificationsEnabled = usePreferences((state) => state.notificationsEnabled);
  const showToast = useToast((state) => state.show);

  function submit(input: TaskInput) {
    createTask.mutate(input, {
      onSuccess: (task) => {
        void scheduleTaskReminder(task, notificationsEnabled).catch((error: unknown) =>
          showToast(friendlyError(error))
        );
        router.back();
      },
      onError: (error) => showToast(friendlyError(error))
    });
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ScreenHeader
          title="New task"
          subtitle="Give your time a little shape"
          onBack={() => router.back()}
        />
      </View>
      <TaskForm
        defaultReminderMinutes={defaultReminderMinutes}
        initialValues={params.date ? { date: params.date } : undefined}
        onSubmit={submit}
        submitting={createTask.isPending}
        submitLabel="Add to my day"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md }
});
