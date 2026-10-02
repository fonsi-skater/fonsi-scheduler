import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "@/api/client";
import { friendlyError } from "@/api/errors";
import { useToast } from "@/store/toast";
import { useAuthSession } from "@/store/authSession";
import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

const links = [
  {
    title: "Settings",
    subtitle: "Appearance and reminders",
    icon: "options-outline" as const,
    route: "/settings" as Href
  },
  {
    title: "Find a task",
    subtitle: "Search and filter your plans",
    icon: "search-outline" as const,
    route: "/search" as Href
  },
  {
    title: "About Fonsi",
    subtitle: "A little more about the app",
    icon: "heart-outline" as const,
    route: "/about" as Href
  }
];

export default function MenuScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const session = useAuthSession((state) => state.session);
  const showToast = useToast((state) => state.show);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await authApi.logout();
      showToast("You’re signed out.");
    } catch (error) {
      showToast(friendlyError(error));
    } finally {
      setSigningOut(false);
    }
  }

  function confirmSignOut() {
    if (Platform.OS === "web") {
      if (window.confirm("Sign out? Your saved tasks will stay on this device.")) void signOut();
      return;
    }
    Alert.alert("Sign out?", "Your saved tasks will stay on this device.", [
      { text: "Keep me here", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() }
    ]);
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.eyebrow, { color: colors.mutedText }]}>YOUR LITTLE CORNER</Text>
        <Text style={[styles.title, { color: colors.text }]}>Menu</Text>
        <Text style={[styles.intro, { color: colors.mutedText }]}>
          The useful bits, all tucked in one place.
        </Text>

        <View style={[styles.accountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.accountIcon}>
            <Ionicons name={session ? "person" : "sparkles"} size={22} color={palette.violet} />
          </View>
          <View style={styles.accountCopy}>
            <Text style={[styles.accountTitle, { color: colors.text }]}>
              {session ? "Hello again" : "Keep your plans close"}
            </Text>
            <Text style={[styles.accountSubtitle, { color: colors.mutedText }]}>
              {session ? session.email : "Sign in to sync your day across devices."}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={session ? "Sign out" : "Sign in"}
            onPress={() => (session ? confirmSignOut() : router.push("/login"))}
            disabled={signingOut}
            style={({ pressed }) => [
              styles.accountAction,
              { backgroundColor: palette.violetWash, opacity: pressed || signingOut ? 0.7 : 1 }
            ]}
          >
            <Text style={styles.accountActionText}>{session ? "Sign out" : "Sign in"}</Text>
          </Pressable>
        </View>

        <Text style={[styles.groupLabel, { color: colors.mutedText }]}>YOUR SPACE</Text>
        <View style={[styles.linkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {links.map((link, index) => (
            <View key={link.title}>
              {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(link.route)}
                style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.65 : 1 }]}
              >
                <View style={styles.linkIcon}>
                  <Ionicons name={link.icon} size={19} color={palette.violet} />
                </View>
                <View style={styles.linkCopy}>
                  <Text style={[styles.linkTitle, { color: colors.text }]}>{link.title}</Text>
                  <Text style={[styles.linkSubtitle, { color: colors.mutedText }]}>{link.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={colors.mutedText} />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Ionicons name="leaf-outline" size={16} color={palette.mintInk} />
          <Text style={[styles.footerText, { color: colors.mutedText }]}>A softer way to plan your day.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  title: { marginTop: 5, fontSize: typography.display, fontWeight: "800", letterSpacing: -0.8 },
  intro: { marginTop: 5, fontSize: typography.body, lineHeight: 22, marginBottom: spacing.xl },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.violetWash,
    marginRight: spacing.sm
  },
  accountCopy: { flex: 1, marginRight: spacing.xs },
  accountTitle: { fontSize: 14, fontWeight: "700" },
  accountSubtitle: { marginTop: 4, fontSize: 11, lineHeight: 16 },
  accountAction: {
    minHeight: 38,
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md
  },
  accountActionText: { color: palette.violet, fontSize: 12, fontWeight: "700" },
  groupLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: spacing.sm },
  linkCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  linkRow: { minHeight: 72, flexDirection: "row", alignItems: "center" },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.violetWash,
    marginRight: spacing.sm
  },
  linkCopy: { flex: 1 },
  linkTitle: { fontSize: 14, fontWeight: "700" },
  linkSubtitle: { marginTop: 4, fontSize: 11 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 48 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xxl
  },
  footerText: { fontSize: typography.caption }
});
