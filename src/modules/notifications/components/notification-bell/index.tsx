"use client";

import React from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../notifications-context";
import styles from "./notification-bell.module.css";

interface NotificationBellProps {
  label: string;
  className?: string;
}

export function NotificationBell({ label, className }: NotificationBellProps) {
  const ctx = useNotifications();
  if (!ctx) return null;

  const { totalCount, urgentCount, openNotifications } = ctx;
  const badgeMod =
    urgentCount > 0
      ? styles["finanzas-notif-bell__badge--urgent"]
      : styles["finanzas-notif-bell__badge--upcoming"];

  return (
    <button
      type="button"
      onClick={openNotifications}
      className={`${styles["finanzas-notif-bell"]} ${className ?? ""}`.trim()}
      aria-label={totalCount > 0 ? `${label} (${totalCount})` : label}
      title={label}
    >
      <Bell size={18} />
      {totalCount > 0 && (
        <span className={`${styles["finanzas-notif-bell__badge"]} ${badgeMod}`}>
          {totalCount > 9 ? "9+" : totalCount}
        </span>
      )}
    </button>
  );
}
