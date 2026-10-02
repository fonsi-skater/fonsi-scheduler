import { useMemo } from "react";
import { router } from "expo-router";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { friendlyError } from "@/api/errors";
import type { Task } from "@/api/types";
import { IconButton } from "@/components/IconButton";
import { TaskCard } from "@/components/TaskCard";
import { useTaskActions } from "@/components/TaskActions";
import { useTasks } from "@/features/tasks/hooks";
import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

interface TaskSection {
  title: string;
  data: Task[];
}

export default function TodayScreen() {
  const colors = useAppColors();
  const today = format(new Date(), "yyyy-MM-dd");
  const query = useTasks({ from: today, to: today });
  const { toggle, confirmDelete } = useTaskActions();
  const tasks = useMemo(() => query.data ?? [], [query.data]);
  const completed = tasks.filter((task) => task.status === "completed").length;
  const percentage = tasks.length ? completed / tasks.length : 0;
  const sections = useMemo<TaskSection[]>(() => {
    const groups: TaskSection[] = [
      { title: "Morning", data: [] },
      { title: "Afternoon", data: [] },
      { title: "Evening", data: [] }
    ];
    for (const task of tasks) {
      const hour = Number(task.startTime.slice(0, 2));
      const group = hour < 12 ? groups[0] : hour < 17 ? groups[1] : groups[2];
      group.data.push(task);
    }
    return groups.filter((group) => group.data.length > 0);
  }, [tasks]);
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  function openTask(task: Task) {
    router.push({ pathname: "/task/[id]", params: { id: task.id } });
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => toggle(item)}
            onEdit={() => openTask(item)}
            onDelete={() => confirmDelete(item)}
          />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: colors.mutedText }]}>{section.title}</Text>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View>
                <Text style={[styles.date, { color: colors.mutedText }]}>
                  {format(new Date(), "EEEE, MMMM d")}
                </Text>
                <Text style={[styles.greeting, { color: colors.text }]}>{greeting}.</Text>
              </View>
              <IconButton
                icon="search-outline"
                label="Search and filter tasks"
                onPress={() => router.push("/search")}
                color={colors.text}
                backgroundColor={colors.surface}
              />
            </View>
            <View
              style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.progressCopy}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>
                  {tasks.length === 0 ? "A little room to breathe" : `${completed} of ${tasks.length} tasks`}
                </Text>
                <Text style={[styles.progressSubtitle, { color: colors.mutedText }]}>
                  {tasks.length === 0
                    ? "Make space for what matters today."
                    : completed === tasks.length
                      ? "You made it through your list. Lovely work."
                      : "One thing at a time. You've got this."}
                </Text>
                <View style={[styles.track, { backgroundColor: colors.border }]}>
                  <View style={[styles.fill, { width: `${percentage * 100}%` }]} />
                </View>
              </View>
              <View style={styles.progressIcon}>
                <Ionicons
                  name={tasks.length > 0 && completed === tasks.length ? "checkmark" : "leaf-outline"}
                  size={22}
                  color={palette.violet}
                />
              </View>
            </View>
            <View style={styles.listHeading}>
              <Text style={[styles.listTitle, { color: colors.text }]}>Your day</Text>
              <Text style={[styles.taskCount, { color: colors.mutedText }]}>
                {tasks.length === 1 ? "1 task" : `${tasks.length} tasks`}
              </Text>
            </View>
            {query.isError && tasks.length > 0 ? (
              <View style={styles.offlineBanner}>
                <Ionicons name="cloud-offline-outline" size={16} color={palette.peachInk} />
                <Text style={styles.offlineText}>Showing saved tasks. {friendlyError(query.error)}</Text>
                <Pressable accessibilityRole="button" onPress={() => void query.refetch()}>
                  <Text style={styles.retryLink}>Retry</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          query.isLoading ? (
            <LoadingRows />
          ) : query.isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Couldn't load your day"
              subtitle={friendlyError(query.error)}
              action="Try again"
              onPress={() => void query.refetch()}
              colors={colors}
            />
          ) : (
            <EmptyState
              icon="sunny-outline"
              title="A fresh page"
              subtitle="No tasks on your list yet. Add something you'd like to make time for."
              action="Add your first task"
              onPress={() => router.push("/task/new")}
              colors={colors}
            />
          )
        }
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            tintColor={palette.violet}
          />
        }
        initialNumToRender={7}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add task"
        onPress={() => router.push("/task/new")}
        style={({ pressed }) => [styles.fab, { bottom: spacing.lg, opacity: pressed ? 0.85 : 1 }]}
      >
        <Ionicons name="add" size={26} color={palette.white} />
        <Text style={styles.fabText}>Add task</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function LoadingRows() {
  return (
    <FlatList
      data={["a", "b", "c", "d"]}
      keyExtractor={(item) => item}
      scrollEnabled={false}
      renderItem={() => <View style={styles.skeleton} />}
    />
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  action,
  onPress,
  colors
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  action: string;
  onPress: () => void;
  colors: ReturnType<typeof useAppColors>;
}) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={25} color={palette.violet} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.mutedText }]}>{subtitle}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 105, flexGrow: 1 },
  header: { paddingTop: spacing.sm },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl
  },
  date: { fontSize: typography.caption, fontWeight: "600", letterSpacing: 0.3, textTransform: "uppercase" },
  greeting: { marginTop: 5, fontSize: typography.display, fontWeight: "800", letterSpacing: -0.8 },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl
  },
  progressCopy: { flex: 1, marginRight: spacing.md },
  progressTitle: { fontSize: typography.body, fontWeight: "700" },
  progressSubtitle: { marginTop: 4, fontSize: typography.caption, lineHeight: 17 },
  track: { height: 6, borderRadius: 3, marginTop: 15, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3, backgroundColor: palette.violet },
  progressIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.violetWash
  },
  listHeading: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, marginBottom: spacing.md },
  listTitle: { fontSize: typography.heading, fontWeight: "700" },
  taskCount: { fontSize: typography.caption },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginBottom: spacing.xs
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: palette.peach,
    marginBottom: spacing.md
  },
  offlineText: { flex: 1, color: palette.peachInk, fontSize: 11 },
  retryLink: { color: palette.peachInk, fontSize: 12, fontWeight: "700" },
  skeleton: { height: 106, borderRadius: radius.md, marginBottom: spacing.sm, backgroundColor: palette.line },
  empty: { alignItems: "center", paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  emptyTitle: { textAlign: "center", fontSize: typography.heading, fontWeight: "700" },
  emptySubtitle: {
    maxWidth: 280,
    marginTop: spacing.xs,
    textAlign: "center",
    fontSize: typography.body,
    lineHeight: 22
  },
  emptyButton: {
    minHeight: 44,
    justifyContent: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md
  },
  emptyButtonText: { color: palette.violet, fontWeight: "700", fontSize: typography.body },
  fab: {
    position: "absolute",
    right: spacing.xl,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: palette.violet,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    elevation: 5
  },
  fabText: { color: palette.white, fontSize: 14, fontWeight: "700" }
});
