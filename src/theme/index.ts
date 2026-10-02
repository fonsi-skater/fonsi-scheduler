import { StyleSheet } from "react-native";

import { palette, radius, spacing, typography } from "./tokens";

export { motion, palette, radius, spacing, typography } from "./tokens";

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl
  },
  card: {
    borderRadius: radius.md,
    backgroundColor: palette.white,
    padding: spacing.md
  },
  heading: {
    color: palette.ink,
    fontSize: typography.heading,
    fontWeight: "700"
  },
  body: {
    color: palette.ink,
    fontSize: typography.body
  },
  muted: {
    color: palette.muted,
    fontSize: typography.caption
  }
});
