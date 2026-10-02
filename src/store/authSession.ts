import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { z } from "zod";

const storageKey = "fonsi-auth-session";
const storedSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  email: z.string().email()
});

export type AuthSession = z.infer<typeof storedSessionSchema>;

interface AuthSessionState {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
}

export const useAuthSession = create<AuthSessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session })
}));

let cachedSession: AuthSession | null | undefined;
let loadingSession: Promise<AuthSession | null> | undefined;

export async function getAuthSession(): Promise<AuthSession | null> {
  if (cachedSession !== undefined) return cachedSession;
  if (loadingSession) return loadingSession;
  loadingSession = loadAuthSession();
  try {
    return await loadingSession;
  } finally {
    loadingSession = undefined;
  }
}

async function loadAuthSession(): Promise<AuthSession | null> {
  if (Platform.OS === "web") {
    cachedSession = null;
    return cachedSession;
  }

  const stored = await SecureStore.getItemAsync(storageKey);
  if (!stored) {
    cachedSession = null;
    return cachedSession;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    await SecureStore.deleteItemAsync(storageKey);
    cachedSession = null;
    return null;
  }

  const result = storedSessionSchema.safeParse(parsed);
  if (!result.success) {
    await SecureStore.deleteItemAsync(storageKey);
    cachedSession = null;
    return null;
  }

  cachedSession = result.data;
  return cachedSession;
}

export async function setAuthSession(session: AuthSession): Promise<void> {
  if (Platform.OS !== "web") {
    await SecureStore.setItemAsync(storageKey, JSON.stringify(session));
  }
  cachedSession = session;
  useAuthSession.getState().setSession(session);
}

export async function clearAuthSession(): Promise<void> {
  if (Platform.OS !== "web") {
    await SecureStore.deleteItemAsync(storageKey);
  }
  cachedSession = null;
  useAuthSession.getState().setSession(null);
}

export async function restoreAuthSession(): Promise<void> {
  useAuthSession.getState().setSession(await getAuthSession());
}
