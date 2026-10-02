import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { IconButton } from "./IconButton";
import { spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  const colors = useAppColors();
  return (
    <View style={styles.row}>
      {onBack ? (
        <IconButton icon="chevron-back" label="Go back" onPress={onBack} color={colors.text} />
      ) : null}
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.mutedText }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 54, flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  heading: { flex: 1 },
  title: { fontSize: typography.title, lineHeight: 30, fontWeight: "700" },
  subtitle: { marginTop: 3, fontSize: typography.caption }
});
