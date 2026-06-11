import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
};

type AddToastInput = {
  type: ToastType;
  message: string;
  duration?: number;
};

type ToastState = {
  toasts: ToastItem[];
  addToast: (toast: AddToastInput) => string;
  removeToast: (id: string) => void;
};

const DEFAULT_DURATION = 3000;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  addToast: ({ type, message, duration = DEFAULT_DURATION }) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", message, duration }),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "error", message, duration }),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "warning", message, duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "info", message, duration }),
};
