import type { ReactNode } from "react";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { usePreferences, type Appearance } from "@/store/preferences";
import { useToast } from "@/store/toast";
import {
  cancelAllTaskReminders,
  ensureNotificationPermission,
  scheduleTaskReminder
} from "@/features/tasks/notifications";
import { useTasks } from "@/features/tasks/hooks";
import { friendlyError } from "@/api/errors";
import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

const appearances: {
  value: Appearance;
  label: string;
  icon: "phone-portrait-outline" | "sunny-outline" | "moon-outline";
}[] = [
  { value: "system", label: "System", icon: "phone-portrait-outline" },
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" }
];
const reminders = [
  { value: null, label: "Off" },
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 30, label: "30 min" }
];

export default function SettingsScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);
  const appearance = usePreferences((state) => state.appearance);
  const notificationsEnabled = usePreferences((state) => state.notificationsEnabled);
  const reminder = usePreferences((state) => state.defaultReminderMinutes);
  const setAppearance = usePreferences((state) => state.setAppearance);
  const setNotificationsEnabled = usePreferences((state) => state.setNotificationsEnabled);
  const setReminder = usePreferences((state) => state.setDefaultReminderMinutes);
  const showToast = useToast((state) => state.show);
  const tasksQuery = useTasks();

  async function toggleNotifications(enabled: boolean) {
    if (!enabled) {
      try {
        await cancelAllTaskReminders();
        setNotificationsEnabled(false);
      } catch (error) {
        showToast(friendlyError(error));
      }
      return;
    }
    setRequesting(true);
    try {
      const allowed = await ensureNotificationPermission();
      if (allowed) {
        setNotificationsEnabled(true);
        const tasks = tasksQuery.data?.filter((task) => task.status === "upcoming") ?? [];
        await Promise.all(tasks.map((task) => scheduleTaskReminder(task, true)));
      } else {
        Alert.alert(
          "Notifications are off",
          "Allow notifications in your device settings to receive task reminders."
        );
        setNotificationsEnabled(false);
      }
    } catch (error) {
      showToast(friendlyError(error));
    } finally {
      setRequesting(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: colors.mutedText }]}>MAKE IT YOURS</Text>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.intro, { color: colors.mutedText }]}>
          A calmer way to plan, just the way you like it.
        </Text>

        <SettingsGroup title="Appearance" colors={colors}>
          <View style={styles.appearanceRow}>
            {appearances.map(({ value, label, icon }) => {
              const selected = appearance === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setAppearance(value)}
                  style={[
                    styles.appearanceOption,
                    {
                      borderColor: selected ? palette.violet : colors.border,
                      backgroundColor: selected ? palette.violetWash : colors.surface
                    }
                  ]}
                >
                  <Ionicons name={icon} size={19} color={selected ? palette.violet : colors.mutedText} />
                  <Text style={[styles.appearanceLabel, { color: selected ? palette.violet : colors.text }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SettingsGroup>

        <SettingsGroup title="Reminders" colors={colors}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications-outline" size={19} color={palette.violet} />
            </View>
            <View style={styles.settingCopy}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Task notifications</Text>
              <Text style={[styles.settingSubtitle, { color: colors.mutedText }]}>
                A gentle nudge before things begin
              </Text>
            </View>
            <Switch
              accessibilityLabel="Task notifications"
              value={notificationsEnabled}
              onValueChange={(value) => void toggleNotifications(value)}
              disabled={requesting}
              trackColor={{ false: colors.border, true: palette.violet }}
              thumbColor={palette.white}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.settingTitle, { color: colors.text, marginBottom: spacing.sm }]}>
            Default reminder
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.mutedText, marginBottom: spacing.md }]}>
            Used for new tasks. You can change it any time.
          </Text>
          <View style={styles.reminderChoices}>
            {reminders.map((option) => (
              <Pressable
                key={option.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: reminder === option.value }}
                onPress={() => setReminder(option.value)}
                style={[
                  styles.reminderChoice,
                  {
                    borderColor: reminder === option.value ? palette.violet : colors.border,
                    backgroundColor: reminder === option.value ? palette.violetWash : colors.surface
                  }
                ]}
              >
                <Text
                  style={[
                    styles.reminderLabel,
                    { color: reminder === option.value ? palette.violet : colors.text }
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </SettingsGroup>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoIcon}>
            <Ionicons name="cloud-outline" size={18} color={palette.violet} />
          </View>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Data source</Text>
            <Text style={[styles.settingSubtitle, { color: colors.mutedText }]}>
              {process.env.EXPO_PUBLIC_USE_MOCK === "true"
                ? "Local demo data · changes stay on this device"
                : "Connected to your Fonsi service"}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/about")}
          style={[styles.aboutButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="information-circle-outline" size={18} color={palette.violet} />
          <Text style={[styles.aboutButtonText, { color: colors.text }]}>About Fonsi Scheduler</Text>
        </Pressable>

        <Text style={[styles.version, { color: colors.mutedText }]}>
          Fonsi Scheduler · Made for your focus
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsGroup({
  title,
  colors,
  children
}: {
  title: string;
  colors: ReturnType<typeof useAppColors>;
  children: ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  eyebrow: { fontSize: 9, fontWeight: "700", letterSpacing: 1.1 },
  title: { marginTop: 5, fontSize: typography.display, fontWeight: "800", letterSpacing: -0.8 },
  intro: { marginTop: 5, fontSize: typography.body, lineHeight: 22, marginBottom: spacing.xl },
  group: { marginBottom: spacing.xl },
  groupTitle: { marginBottom: spacing.sm, fontSize: typography.body, fontWeight: "700" },
  groupCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: spacing.md },
  appearanceRow: { flexDirection: "row", gap: spacing.xs },
  appearanceOption: {
    flex: 1,
    minHeight: 68,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: radius.sm
  },
  appearanceLabel: { fontSize: typography.caption, fontWeight: "600" },
  settingRow: { flexDirection: "row", alignItems: "center" },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.violetWash,
    marginRight: spacing.sm
  },
  settingCopy: { flex: 1 },
  settingTitle: { fontSize: typography.body, fontWeight: "700" },
  settingSubtitle: { marginTop: 4, fontSize: typography.caption, lineHeight: 17 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.md },
  reminderChoices: { flexDirection: "row", gap: spacing.xs },
  reminderChoice: {
    minWidth: 55,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm
  },
  reminderLabel: { fontSize: typography.caption, fontWeight: "600" },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.violetWash,
    marginRight: spacing.sm
  },
  aboutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.lg
  },
  aboutButtonText: { fontSize: typography.body, fontWeight: "600" },
  version: { textAlign: "center", marginTop: spacing.xxl, fontSize: typography.caption }
});
