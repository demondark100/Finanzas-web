"use client";

import React from "react";
import { Calculator } from "lucide-react";
import styles from "./selection-sum-bar.module.css";

interface SelectionSumBarProps {
  count: number;
  totalFormatted: string;
  isNegative?: boolean;
  countLabel: string;
  totalLabel: string;
  clearLabel: string;
  doneLabel: string;
  onClear: () => void;
  onDone: () => void;
}

export function SelectionSumBar({
  count,
  totalFormatted,
  isNegative = false,
  countLabel,
  totalLabel,
  clearLabel,
  doneLabel,
  onClear,
  onDone,
}: SelectionSumBarProps) {
  return (
    <div className={styles.wrapper} role="region" aria-label={totalLabel}>
      <div className={styles.bar}>
        <div className={styles.left}>
          <span className={styles.iconBox}>
            <Calculator size={18} />
          </span>
          <div className={styles.meta}>
            <span className={styles.countText}>
              {count} {countLabel} · {totalLabel}
            </span>
            <strong className={`${styles.totalText} ${isNegative ? styles.negative : ""}`.trim()}>
              {totalFormatted}
            </strong>
          </div>
        </div>

        <div className={styles.actions}>
          {count > 0 && (
            <button type="button" onClick={onClear} className={styles.clearBtn}>
              {clearLabel}
            </button>
          )}
          <button type="button" onClick={onDone} className={styles.doneBtn}>
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
