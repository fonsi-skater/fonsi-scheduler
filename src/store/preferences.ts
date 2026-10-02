import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Appearance = "system" | "light" | "dark";

interface PreferencesState {
  appearance: Appearance;
  notificationsEnabled: boolean;
  defaultReminderMinutes: number | null;
  setAppearance: (appearance: Appearance) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDefaultReminderMinutes: (minutes: number | null) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      appearance: "system",
      notificationsEnabled: true,
      defaultReminderMinutes: 10,
      setAppearance: (appearance) => set({ appearance }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setDefaultReminderMinutes: (defaultReminderMinutes) => set({ defaultReminderMinutes })
    }),
    {
      name: "fonsi-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        appearance: state.appearance,
        notificationsEnabled: state.notificationsEnabled,
        defaultReminderMinutes: state.defaultReminderMinutes
      })
    }
  )
);
