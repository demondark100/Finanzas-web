"use client";

import React from "react";
import { BellRing, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/i18n";
import { useNotifications } from "../notifications-context";
import styles from "./due-alert-banner.module.css";

interface DueAlertBannerProps {
  labels: Dictionary["notifications"];
}

export function DueAlertBanner({ labels }: DueAlertBannerProps) {
  const ctx = useNotifications();
  if (!ctx || ctx.totalCount === 0) return null;

  const { totalCount, urgentCount, openNotifications } = ctx;
  const isUrgent = urgentCount > 0;
  const count = isUrgent ? urgentCount : totalCount;

  const message = isUrgent
    ? count === 1
      ? labels.bannerUrgentSingle
      : labels.bannerUrgentPlural.replace("{count}", String(count))
    : count === 1
      ? labels.bannerUpcomingSingle
      : labels.bannerUpcomingPlural.replace("{count}", String(count));

  const toneClass = isUrgent
    ? styles["finanzas-due-banner--urgent"]
    : styles["finanzas-due-banner--upcoming"];

  return (
    <button
      type="button"
      onClick={openNotifications}
      className={`${styles["finanzas-due-banner"]} ${toneClass}`}
    >
      <span className={styles["finanzas-due-banner__icon"]} aria-hidden="true">
        <BellRing size={17} />
      </span>
      <span className={styles["finanzas-due-banner__text"]}>{message}</span>
      <span className={styles["finanzas-due-banner__cta"]}>
        {labels.bannerAction} <ChevronRight size={15} />
      </span>
    </button>
  );
}
