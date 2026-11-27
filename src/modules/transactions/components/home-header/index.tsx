"use client";

import React from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";
import type { Dictionary } from "@/i18n";
import styles from "./home-header.module.css";

interface HomeHeaderProps {
  userName: string;
  hideAmounts: boolean;
  labels: Dictionary["home"];
  onTogglePrivacy: () => void;
}

export function HomeHeader({
  userName,
  hideAmounts,
  labels,
  onTogglePrivacy,
}: HomeHeaderProps) {
  const firstName = userName.trim().split(/\s+/)[0] || userName;
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <Link href="/ajustes" className={styles.profileLink}>
        <span className={styles.avatar}>{initial}</span>
        <span className={styles.greetingText}>
          {labels.hello}, <strong>{firstName}</strong>
        </span>
      </Link>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={onTogglePrivacy}
          className={styles.iconBtn}
          aria-label={hideAmounts ? labels.showBalance : labels.hideBalance}
          title={hideAmounts ? labels.showBalance : labels.hideBalance}
        >
          {hideAmounts ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("finanzas:lock"))}
          className={styles.iconBtn}
          aria-label={labels.lockApp}
          title={labels.lockApp}
        >
          <Lock size={18} />
        </button>
      </div>
    </header>
  );
}
