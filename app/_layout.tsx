import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useRef } from "react";

import { useToast } from "@/store/toast";
import { palette, radius, spacing } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";
import { useReducedMotion } from "@/theme/useReducedMotion";

export default function RootLayout() {
  const colors = useAppColors();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: false }
        }
      })
  );
  const reduceMotion = useReducedMotion();
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={colors.dark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false, animation: reduceMotion ? "none" : "fade_from_bottom" }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="task/new"
            options={{ presentation: "modal", animation: reduceMotion ? "none" : "slide_from_bottom" }}
          />
          <Stack.Screen
            name="task/[id]"
            options={{ presentation: "modal", animation: reduceMotion ? "none" : "slide_from_bottom" }}
          />
          <Stack.Screen
            name="search"
            options={{ presentation: "modal", animation: reduceMotion ? "none" : "slide_from_bottom" }}
          />
        </Stack>
        <ToastBanner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function ToastBanner() {
  const { message, actionLabel, action, dismiss } = useToast();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    if (reduceMotion) {
      opacity.setValue(1);
    } else {
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }
    const timeout = setTimeout(dismiss, 4500);
    return () => clearTimeout(timeout);
  }, [dismiss, message, opacity, reduceMotion]);

  if (!message) return null;
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        {
          bottom: Math.max(insets.bottom, spacing.md) + 64,
          backgroundColor: colors.dark ? "#343148" : palette.ink,
          opacity,
          transform: [
            {
              translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [8, 0] })
            }
          ]
        }
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
      {actionLabel && action ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            action();
            dismiss();
          }}
          style={styles.toastAction}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10
  },
  toastText: { flex: 1, color: palette.white, fontSize: 14 },
  toastAction: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm },
  actionText: { color: "#C9C2FF", fontWeight: "700", fontSize: 13 }
});
