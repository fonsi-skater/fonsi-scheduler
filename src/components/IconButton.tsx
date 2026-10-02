import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { palette, radius } from "@/theme";

interface IconButtonProps {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
}

export function IconButton({
  icon,
  label,
  onPress,
  color = palette.ink,
  backgroundColor = "transparent"
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: pressed ? 0.72 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }
      ]}
    >
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  }
});
