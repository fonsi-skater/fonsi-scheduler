import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { friendlyError } from "@/api/errors";
import type { TaskCategory, TaskPriority, TaskStatus } from "@/api/types";
import { IconButton } from "@/components/IconButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TaskCard } from "@/components/TaskCard";
import { useTaskActions } from "@/components/TaskActions";
import { useTasks } from "@/features/tasks/hooks";
import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

type FilterChoice<T extends string> = T | "all";

export default function SearchScreen() {
  const colors = useAppColors();
  const [queryText, setQueryText] = useState("");
  const [status, setStatus] = useState<FilterChoice<TaskStatus>>("all");
  const [priority, setPriority] = useState<FilterChoice<TaskPriority>>("all");
  const [category, setCategory] = useState<FilterChoice<TaskCategory>>("all");
  const query = useTasks({ query: queryText, status, priority, category });
  const { toggle, confirmDelete } = useTaskActions();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Find a task" subtitle="Search your plans" onBack={() => router.back()} />
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedText} />
          <TextInput
            accessibilityLabel="Search tasks"
            value={queryText}
            onChangeText={setQueryText}
            placeholder="Search by name or notes"
            placeholderTextColor={colors.mutedText}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.text }]}
          />
          {queryText ? (
            <IconButton
              icon="close-circle"
              label="Clear search"
              onPress={() => setQueryText("")}
              color={colors.mutedText}
            />
          ) : null}
        </View>
        <FilterGroup
          title="Status"
          values={[
            ["all", "All"],
            ["upcoming", "Upcoming"],
            ["completed", "Done"]
          ]}
          selected={status}
          onSelect={(value) => setStatus(value as FilterChoice<TaskStatus>)}
          colors={colors}
        />
        <FilterGroup
          title="Priority"
          values={[
            ["all", "All"],
            ["high", "High"],
            ["medium", "Medium"],
            ["low", "Low"]
          ]}
          selected={priority}
          onSelect={(value) => setPriority(value as FilterChoice<TaskPriority>)}
          colors={colors}
        />
        <FilterGroup
          title="Category"
          values={[
            ["all", "All"],
            ["work", "Work"],
            ["personal", "Personal"],
            ["health", "Health"],
            ["other", "Other"]
          ]}
          selected={category}
          onSelect={(value) => setCategory(value as FilterChoice<TaskCategory>)}
          colors={colors}
        />
        <View style={styles.resultHeader}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Results</Text>
          <Text style={[styles.resultCount, { color: colors.mutedText }]}>{query.data?.length ?? 0}</Text>
        </View>
        {query.isLoading ? (
          <View style={styles.skeleton} />
        ) : query.isError ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void query.refetch()}
            style={styles.messageBox}
          >
            <Text style={[styles.messageText, { color: colors.mutedText }]}>
              {friendlyError(query.error)} · Tap to retry
            </Text>
          </Pressable>
        ) : query.data?.length ? (
          query.data.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showDate
              onToggle={() => toggle(task)}
              onEdit={() => router.push({ pathname: "/task/[id]", params: { id: task.id } })}
              onDelete={() => confirmDelete(task)}
            />
          ))
        ) : (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={23} color={colors.mutedText} />
            <Text style={[styles.messageText, { color: colors.mutedText }]}>
              No tasks match those filters.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterGroup<T extends string>({
  title,
  values,
  selected,
  onSelect,
  colors
}: {
  title: string;
  values: [T, string][];
  selected: T;
  onSelect: (value: T) => void;
  colors: ReturnType<typeof useAppColors>;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.choices}>
        {values.map(([value, label]) => {
          const active = selected === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(value)}
              style={[
                styles.choice,
                {
                  backgroundColor: active ? palette.violetWash : colors.surface,
                  borderColor: active ? palette.violet : colors.border
                }
              ]}
            >
              <Text style={[styles.choiceText, { color: active ? palette.violet : colors.text }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  searchBox: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.sm,
    marginBottom: spacing.lg
  },
  searchInput: { flex: 1, minHeight: 44, fontSize: typography.body },
  filterGroup: { marginBottom: spacing.lg },
  filterTitle: { fontSize: typography.caption, fontWeight: "700", marginBottom: spacing.xs },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  choice: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.pill
  },
  choiceText: { fontSize: typography.caption, fontWeight: "600" },
  resultHeader: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "baseline",
    marginBottom: spacing.sm,
    marginTop: spacing.xs
  },
  resultTitle: { fontSize: typography.heading, fontWeight: "700" },
  resultCount: { fontSize: typography.caption },
  skeleton: { height: 108, backgroundColor: "#EBE9F1", borderRadius: radius.md },
  messageBox: { minHeight: 100, alignItems: "center", justifyContent: "center" },
  messageText: { fontSize: typography.body, textAlign: "center", lineHeight: 22 },
  noResults: { minHeight: 140, alignItems: "center", justifyContent: "center", gap: spacing.sm }
});
