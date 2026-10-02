import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parse } from "date-fns";

import type { Task } from "@/api/types";
import { IconButton } from "./IconButton";
import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showDate?: boolean;
}

const categoryStyle = {
  work: { fill: palette.violetWash, ink: palette.violet, icon: "briefcase-outline" as const },
  personal: { fill: palette.peach, ink: palette.peachInk, icon: "sparkles-outline" as const },
  health: { fill: palette.mint, ink: palette.mintInk, icon: "fitness-outline" as const },
  other: { fill: palette.blue, ink: palette.blueInk, icon: "ellipse-outline" as const }
};

export function TaskCard({ task, onToggle, onEdit, onDelete, showDate = false }: TaskCardProps) {
  const colors = useAppColors();
  const category = categoryStyle[task.category];
  const completed = task.status === "completed";
  const duration = `${format(parse(task.startTime, "HH:mm", new Date()), "h:mm a")} – ${format(
    parse(task.endTime, "HH:mm", new Date()),
    "h:mm a"
  )}`;
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={`${completed ? "Mark incomplete" : "Complete"} ${task.title}`}
        onPress={onToggle}
        style={styles.check}
      >
        <View style={[styles.checkCircle, completed && styles.checked]}>
          {completed ? <Ionicons name="checkmark" size={13} color={palette.white} /> : null}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${task.title}`}
        onPress={onEdit}
        style={styles.main}
      >
        <View style={styles.topLine}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.text }, completed && styles.strikethrough]}
          >
            {task.title}
          </Text>
          {task.priority === "high" ? <View style={styles.priorityDot} /> : null}
        </View>
        <Text style={[styles.time, { color: colors.mutedText }]}>
          {showDate ? `${format(new Date(`${task.date}T12:00:00`), "EEE, MMM d")} · ` : ""}
          {duration}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.category, { backgroundColor: category.fill }]}>
            <Ionicons name={category.icon} size={12} color={category.ink} />
            <Text style={[styles.categoryText, { color: category.ink }]}>
              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
            </Text>
          </View>
          {task.reminderMinutes !== null ? (
            <View style={styles.reminder}>
              <Ionicons name="notifications-outline" size={13} color={colors.mutedText} />
              <Text style={[styles.reminderText, { color: colors.mutedText }]}>{task.reminderMinutes}m</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      <IconButton
        icon="trash-outline"
        label={`Delete ${task.title}`}
        onPress={onDelete}
        color={colors.mutedText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  check: { minWidth: 44, minHeight: 44, alignItems: "flex-start", paddingTop: 4 },
  checkCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D1CFDD",
    alignItems: "center",
    justifyContent: "center"
  },
  checked: { borderColor: palette.violet, backgroundColor: palette.violet },
  main: { flex: 1, minHeight: 64, paddingTop: 2 },
  topLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  title: { flexShrink: 1, fontSize: typography.body, fontWeight: "700" },
  strikethrough: { textDecorationLine: "line-through", opacity: 0.55 },
  priorityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.roseInk },
  time: { marginTop: 5, fontSize: typography.caption },
  meta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  category: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  categoryText: { fontSize: 10, fontWeight: "600" },
  reminder: { flexDirection: "row", alignItems: "center", gap: 3 },
  reminderText: { fontSize: 10 }
});
