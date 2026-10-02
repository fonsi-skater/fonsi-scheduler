import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { palette, radius, spacing } from "@/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, loading = false, disabled = false }: PrimaryButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: inactive ? 0.6 : pressed ? 0.82 : 1 }]}
    >
      {loading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: palette.violet,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center"
  },
  label: { color: palette.white, fontSize: 15, fontWeight: "700" }
});
