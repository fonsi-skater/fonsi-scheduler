import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

export default function AboutScreen() {
  const colors = useAppColors();
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </Pressable>

        <Text style={[styles.eyebrow, { color: colors.mutedText }]}>ABOUT</Text>
        <Text style={[styles.title, { color: colors.text }]}>Fonsi Scheduler</Text>
        <Text style={[styles.body, { color: colors.mutedText }]}>
          A calmer way to plan your day, keep work visible, and move from intention to action without
          friction.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>What this app does</Text>
          <Text style={[styles.cardText, { color: colors.mutedText }]}>
            Fonsi Scheduler helps you track tasks, review today and upcoming work, and adjust
            reminders to match your rhythm.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Focus-first design</Text>
          <Text style={[styles.cardText, { color: colors.mutedText }]}>
            The interface keeps the essentials in view and uses gentle defaults so you can stay on task
            without unnecessary complexity.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Current status</Text>
          <Text style={[styles.cardText, { color: colors.mutedText }]}>
            This repository contains the mobile app and its release configuration. The backend is a
            separately deployed service, and the app will use the configured API URL when the service is
            connected.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.4, marginBottom: spacing.xs },
  title: { fontSize: typography.display, fontWeight: "800", letterSpacing: -0.8 },
  body: { marginTop: spacing.sm, fontSize: typography.body, lineHeight: 24 },
  backButton: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg
  },
  backButtonText: { fontSize: 14, fontWeight: "700" },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg
  },
  cardTitle: { fontSize: typography.body, fontWeight: "700", marginBottom: spacing.xs },
  cardText: { fontSize: 14, lineHeight: 22 },
  accent: { color: palette.violet }
});
