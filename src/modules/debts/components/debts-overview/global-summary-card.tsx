import React from "react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/i18n";
import { formatCurrency } from "@/modules/transactions/helpers/formatters";
import styles from "./debts-overview.module.css";

interface GlobalSummaryCardProps {
  totalReceivable: number;
  totalPayable: number;
  currency: string;
  labels: Dictionary["debts"];
}

export function GlobalSummaryCard({
  totalReceivable, totalPayable, currency, labels,
}: GlobalSummaryCardProps) {
  const hint =
    totalReceivable === totalPayable
      ? labels.globalSettled
      : totalReceivable > totalPayable
        ? labels.globalInFavor
        : labels.globalAgainst;

  const netClass =
    totalReceivable > totalPayable
      ? styles.receivableVal
      : totalPayable > totalReceivable
        ? styles.payableVal
        : styles.neutralVal;

  return (
    <Card className={styles.globalCard}>
      <span className={styles.globalHint}>{hint}</span>
      <h2 className={`${styles.globalNet} ${netClass}`}>
        {formatCurrency(Math.abs(totalReceivable - totalPayable), currency)}
      </h2>
      {totalReceivable + totalPayable > 0 && (
        <progress className={styles.globalBar} value={totalReceivable} max={totalReceivable + totalPayable} />
      )}
      <div className={styles.totalsGrid}>
        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>{labels.totalReceivable}</span>
          <strong className={totalReceivable > 0 ? styles.receivableVal : styles.neutralVal}>
            {formatCurrency(totalReceivable, currency)}
          </strong>
        </div>
        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>{labels.totalPayable}</span>
          <strong className={totalPayable > 0 ? styles.payableVal : styles.neutralVal}>
            {formatCurrency(totalPayable, currency)}
          </strong>
        </div>
      </div>
    </Card>
  );
}
