"use client";

import { useEffect, useMemo, useState } from "react";

export type ToastType = "success" | "error";

export function Toast({
  message,
  type,
  duration = 3000,
  onDone
}: {
  message: string;
  type: ToastType;
  duration?: number;
  onDone?: () => void;
}) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setIsLeaving(true), Math.max(0, duration - 300));
    const doneTimer = window.setTimeout(() => onDone?.(), duration);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [duration, onDone]);

  const className = useMemo(
    () => `toast-banner toast-${type} ${isLeaving ? "is-leaving" : "is-visible"}`,
    [isLeaving, type]
  );

  return (
    <div aria-live="polite" className="toast-root" role={type === "error" ? "alert" : "status"}>
      <div className={className}>{message}</div>
    </div>
  );
}
