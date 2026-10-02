import { create } from "zustand";

interface ToastState {
  message: string | null;
  actionLabel: string | null;
  action: (() => void) | null;
  show: (message: string, actionLabel?: string, action?: () => void) => void;
  dismiss: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  actionLabel: null,
  action: null,
  show: (message, actionLabel, action) =>
    set({ message, actionLabel: actionLabel ?? null, action: action ?? null }),
  dismiss: () => set({ message: null, actionLabel: null, action: null })
}));
