import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { authApi } from "@/api/client";
import { friendlyError } from "@/api/errors";
import { IconButton } from "@/components/IconButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useToast } from "@/store/toast";
import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(1);

export default function LoginScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const showToast = useToast((state) => state.show);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const apiConfigured =
    Boolean(process.env.EXPO_PUBLIC_API_URL) && process.env.EXPO_PUBLIC_USE_MOCK !== "true";

  async function submit() {
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailSchema.safeParse(normalizedEmail).success) {
      setError("Enter a valid email address.");
      return;
    }
    if (!passwordSchema.safeParse(password).success) {
      setError("Enter your password to continue.");
      return;
    }
    if (creatingAccount && password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (creatingAccount) {
        await authApi.register(normalizedEmail, password);
      } else {
        await authApi.login(normalizedEmail, password);
      }
      showToast(creatingAccount ? "Your account is ready. Welcome to Fonsi!" : "You’re signed in.");
      router.back();
    } catch (submitError) {
      setError(friendlyError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <IconButton
              icon="close-outline"
              label="Close sign in"
              onPress={() => router.back()}
              color={colors.text}
              backgroundColor={colors.surface}
            />
            <Text style={[styles.topLabel, { color: colors.mutedText }]}>YOUR PLANS, YOUR PACE</Text>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons name="leaf-outline" size={30} color={palette.mintInk} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {creatingAccount ? "A little space to begin." : "Welcome back."}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            {creatingAccount
              ? "Create an account to keep your plans with you."
              : "Sign in and pick up right where you left off."}
          </Text>

          {!apiConfigured ? (
            <View style={[styles.notice, { backgroundColor: palette.peach }]}>
              <Ionicons name="information-circle-outline" size={18} color={palette.peachInk} />
              <Text style={styles.noticeText}>
                Sign-in needs a configured Fonsi service. The task demo is still available on this device.
              </Text>
            </View>
          ) : null}

          <Text style={[styles.fieldLabel, { color: colors.text }]}>Email address</Text>
          <TextInput
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!submitting}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedText}
            returnKeyType="next"
            textContentType="emailAddress"
            value={email}
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
            ]}
          />

          <Text style={[styles.fieldLabel, styles.passwordLabel, { color: colors.text }]}>Password</Text>
          <View
            style={[styles.passwordInput, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoComplete={creatingAccount ? "new-password" : "current-password"}
              editable={!submitting}
              onChangeText={setPassword}
              onSubmitEditing={() => void submit()}
              placeholder={creatingAccount ? "At least 8 characters" : "Your password"}
              placeholderTextColor={colors.mutedText}
              returnKeyType="done"
              secureTextEntry={!passwordVisible}
              textContentType={creatingAccount ? "newPassword" : "password"}
              value={password}
              style={[styles.passwordText, { color: colors.text }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
              onPress={() => setPasswordVisible((visible) => !visible)}
              hitSlop={10}
              style={styles.passwordToggle}
            >
              <Ionicons
                name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                size={19}
                color={colors.mutedText}
              />
            </Pressable>
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <View style={styles.submit}>
            <PrimaryButton
              label={creatingAccount ? "Create my account" : "Sign in"}
              onPress={() => void submit()}
              loading={submitting}
              disabled={!apiConfigured}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setCreatingAccount((current) => !current);
              setError("");
            }}
            style={styles.switchMode}
          >
            <Text style={[styles.switchText, { color: colors.mutedText }]}>
              {creatingAccount ? "Already have an account? " : "New to Fonsi? "}
              <Text style={styles.switchAction}>{creatingAccount ? "Sign in" : "Create an account"}</Text>
            </Text>
          </Pressable>

          {Platform.OS === "web" ? (
            <Text style={[styles.webNote, { color: colors.mutedText }]}>
              On this web preview your session lasts until you close or refresh the page. The installed app
              stores sign-in tokens securely on your device.
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xxxl
  },
  topLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.mint
  },
  title: { marginTop: spacing.lg, fontSize: 29, lineHeight: 36, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xl, fontSize: typography.body, lineHeight: 23 },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg
  },
  noticeText: { flex: 1, color: palette.peachInk, fontSize: 12, lineHeight: 18 },
  fieldLabel: { fontSize: 13, fontWeight: "700", marginBottom: spacing.xs },
  input: { height: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 15 },
  passwordLabel: { marginTop: spacing.md },
  passwordInput: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md
  },
  passwordText: { flex: 1, height: 52, paddingHorizontal: spacing.md, fontSize: 15 },
  passwordToggle: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  error: { color: palette.roseInk, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  submit: { marginTop: spacing.xl },
  switchMode: { alignItems: "center", justifyContent: "center", minHeight: 52, marginTop: spacing.xs },
  switchText: { fontSize: 13 },
  switchAction: { color: palette.violet, fontWeight: "700" },
  webNote: { textAlign: "center", fontSize: 11, lineHeight: 17, marginTop: spacing.md }
});
