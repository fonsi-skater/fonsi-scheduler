import { useColorScheme } from "react-native";

import { palette } from "./tokens";
import { usePreferences } from "../store/preferences";

export function useAppColors() {
  const systemTheme = useColorScheme();
  const appearance = usePreferences((state) => state.appearance);
  const dark = appearance === "dark" || (appearance === "system" && systemTheme === "dark");
  return {
    dark,
    background: dark ? palette.night : palette.paper,
    surface: dark ? palette.nightCard : palette.white,
    text: dark ? "#F8F7FC" : palette.ink,
    mutedText: dark ? "#B2B0C2" : palette.muted,
    border: dark ? palette.nightLine : palette.line
  };
}
