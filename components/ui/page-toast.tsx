"use client";

import { useEffect, useState } from "react";
import { Toast, ToastType } from "@/components/ui/toast";

const PENDING_TOAST_KEY = "cm_pending_toast";

type PendingToastPayload = {
  message: string;
  type: ToastType;
  duration?: number;
};

export function queuePendingToast(payload: PendingToastPayload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload));
}

export function PageToast() {
  const [toast, setToast] = useState<PendingToastPayload | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.sessionStorage.getItem(PENDING_TOAST_KEY);
    if (!raw) return;

    window.sessionStorage.removeItem(PENDING_TOAST_KEY);

    try {
      setToast(JSON.parse(raw) as PendingToastPayload);
    } catch {
      window.sessionStorage.removeItem(PENDING_TOAST_KEY);
    }
  }, []);

  if (!toast) return null;

  return (
    <Toast
      duration={toast.duration}
      message={toast.message}
      type={toast.type}
      onDone={() => setToast(null)}
    />
  );
}
