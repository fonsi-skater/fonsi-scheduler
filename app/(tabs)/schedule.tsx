import { useMemo, useState } from "react";
import { router } from "expo-router";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { friendlyError } from "@/api/errors";
import type { Task } from "@/api/types";
import { IconButton } from "@/components/IconButton";
import { TaskCard } from "@/components/TaskCard";
import { useTaskActions } from "@/components/TaskActions";
import { useTasks } from "@/features/tasks/hooks";
import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

export default function ScheduleScreen() {
  const colors = useAppColors();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const date = format(selectedDate, "yyyy-MM-dd");
  const query = useTasks({ from: date, to: date });
  const { toggle, confirmDelete } = useTaskActions();
  const days = useMemo(() => {
    const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  }, [selectedDate]);
  const sections = useMemo(() => {
    const groups = (query.data ?? []).reduce<{ title: string; data: Task[] }[]>((acc, task) => {
      const label = task.startTime.slice(0, 2);
      let group = acc.find((item) => item.title === label);
      if (!group) {
        group = { title: label, data: [] };
        acc.push(group);
      }
      group.data.push(task);
      return acc;
    }, []);
    return groups.sort((a, b) => a.title.localeCompare(b.title));
  }, [query.data]);

  function openTask(task: Task) {
    router.push({ pathname: "/task/[id]", params: { id: task.id } });
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(task) => task.id}
        renderItem={({ item }) => (
          <View style={styles.timelineRow}>
            <View style={styles.timeLabel}>
              <Text style={[styles.timeText, { color: colors.mutedText }]}>
                {format(new Date(2000, 0, 1, Number(item.startTime.slice(0, 2))), "h a")}
              </Text>
              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.taskColumn}>
              <TaskCard
                task={item}
                showDate
                onToggle={() => toggle(item)}
                onEdit={() => openTask(item)}
                onDelete={() => confirmDelete(item)}
              />
            </View>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.hourHeader, { color: colors.mutedText }]}>
            {format(new Date(2000, 0, 1, Number(section.title)), "h a")}
          </Text>
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.mutedText }]}>MAKE ROOM FOR WHAT MATTERS</Text>
                <Text style={[styles.title, { color: colors.text }]}>Schedule</Text>
              </View>
              <IconButton
                icon="search-outline"
                label="Search and filter tasks"
                onPress={() => router.push("/search")}
                color={colors.text}
                backgroundColor={colors.surface}
              />
            </View>
            <View style={styles.weekRow}>
              {days.map((day) => {
                const active = isSameDay(day, selectedDate);
                return (
                  <Pressable
                    key={day.toISOString()}
                    accessibilityRole="button"
                    accessibilityLabel={format(day, "EEEE, MMMM d")}
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelectedDate(day)}
                    style={[styles.dayItem, active && styles.selectedDay]}
                  >
                    <Text style={[styles.dayName, { color: active ? palette.white : colors.mutedText }]}>
                      {format(day, "EEE", { locale: enUS }).slice(0, 1)}
                    </Text>
                    <Text style={[styles.dayNumber, { color: active ? palette.white : colors.text }]}>
                      {format(day, "d")}
                    </Text>
                    {isSameDay(day, new Date()) && !active ? <View style={styles.todayDot} /> : null}
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.dateTitle}>
              <Text style={[styles.selectedLabel, { color: colors.text }]}>
                {isSameDay(selectedDate, new Date()) ? "Today" : format(selectedDate, "EEEE")}
              </Text>
              <Text style={[styles.selectedDate, { color: colors.mutedText }]}>
                {format(selectedDate, "MMMM d")}
              </Text>
            </View>
            {query.isError ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void query.refetch()}
                style={styles.errorBox}
              >
                <Text style={styles.errorText}>{friendlyError(query.error)} · Tap to retry</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          query.isLoading ? (
            <FlatList
              data={["a", "b", "c"]}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              renderItem={() => <View style={styles.skeleton} />}
            />
          ) : query.isError ? null : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-clear-outline" size={24} color={palette.violet} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing planned yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                Keep this day open, or add a task whenever you're ready.
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add task"
        onPress={() => router.push({ pathname: "/task/new", params: { date } })}
        style={styles.fab}
      >
        <Ionicons name="add" size={25} color={palette.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 100, flexGrow: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    marginBottom: spacing.xl
  },
  eyebrow: { fontSize: 9, fontWeight: "700", letterSpacing: 1.1 },
  title: { marginTop: 3, fontSize: typography.display, fontWeight: "800", letterSpacing: -0.8 },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xl },
  dayItem: {
    width: 44,
    height: 60,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  selectedDay: { backgroundColor: palette.violet },
  dayName: { fontSize: 11, fontWeight: "600" },
  dayNumber: { fontSize: 15, fontWeight: "700" },
  todayDot: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.violet,
    bottom: 2
  },
  dateTitle: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, marginBottom: spacing.lg },
  selectedLabel: { fontSize: typography.heading, fontWeight: "700" },
  selectedDate: { fontSize: typography.body },
  hourHeader: { fontSize: 11, fontWeight: "700", marginLeft: 48, marginTop: 4, marginBottom: spacing.xs },
  timelineRow: { flexDirection: "row" },
  timeLabel: { width: 48, alignItems: "center" },
  timeText: { fontSize: 10, marginTop: 4 },
  timelineLine: { flex: 1, width: 1, marginTop: spacing.xs },
  taskColumn: { flex: 1 },
  errorBox: {
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: palette.rose
  },
  errorText: { color: palette.roseInk, fontSize: typography.caption },
  empty: { alignItems: "center", paddingTop: spacing.xxxl, paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.violetWash,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  emptyTitle: { fontSize: typography.heading, fontWeight: "700" },
  emptyText: { marginTop: spacing.xs, textAlign: "center", lineHeight: 21, fontSize: typography.body },
  skeleton: { height: 104, borderRadius: radius.md, marginBottom: spacing.sm, backgroundColor: "#EBE9F1" },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.violet,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5
  }
});
