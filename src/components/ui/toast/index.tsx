"use client";

import React, { useEffect } from "react";
import { AlertCircle, Check } from "lucide-react";
import styles from "./toast.module.css";

interface ToastProps {
  message: string | null;
  variant?: "success" | "error";
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({
  message,
  variant = "success",
  onDismiss,
  durationMs = 2600,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  const variantClass = variant === "error" ? styles.error : styles.success;

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={`${styles.toast} ${variantClass}`}>
        <span className={styles.icon} aria-hidden="true">
          {variant === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
        </span>
        <span className={styles.text}>{message}</span>
      </div>
    </div>
  );
}
