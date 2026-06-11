"use client";

import { useEffect } from "react";
import {
  type ToastItem,
  useToastStore,
} from "@/stores/toastStore";

const TOAST_STYLES: Record<
  ToastItem["type"],
  { container: string; icon: string }
> = {
  success: {
    container: "border-status-published bg-status-published-bg text-status-published",
    icon: "bg-status-published",
  },
  error: {
    container: "border-status-error bg-status-error-bg text-status-error",
    icon: "bg-status-error",
  },
  warning: {
    container: "border-status-warning bg-status-warning-bg text-status-warning",
    icon: "bg-status-warning",
  },
  info: {
    container: "border-primary/30 bg-primary-light text-primary-dark",
    icon: "bg-primary",
  },
};

function ToastItemView({ toast }: { toast: ToastItem }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const styles = TOAST_STYLES[toast.type];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => window.clearTimeout(timer);
  }, [removeToast, toast.duration, toast.id]);

  return (
    <div
      className={`flex min-h-[56px] w-full max-w-sm translate-y-0 items-start gap-3 rounded-radius-lg border px-4 py-3 font-sarabun text-body-md opacity-100 shadow-level-2 transition-all duration-200 ease-out ${styles.container}`}
      role="status"
    >
      <span
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-radius-full ${styles.icon}`}
      />
      <p className="min-w-0 flex-1 break-words">{toast.message}</p>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded-radius-sm px-1 text-current opacity-70 transition-opacity hover:opacity-100"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex w-[calc(100%-3rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItemView key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
