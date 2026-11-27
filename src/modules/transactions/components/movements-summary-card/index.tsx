import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/i18n";
import { formatCurrency } from "../../helpers/formatters";
import type { MovementTypeFilter, TransactionItem } from "../../types";
import styles from "./movements-summary-card.module.css";

interface MovementsSummaryCardProps {
  items: TransactionItem[];
  typeFilter: MovementTypeFilter;
  search: string;
  currency: string;
  labels: Dictionary["movements"];
}

export function MovementsSummaryCard({
  items, typeFilter, search, currency, labels,
}: MovementsSummaryCardProps) {
  if (items.length === 0) return null;

  let totalIncome = 0;
  let totalExpense = 0;
  for (const item of items) {
    if (item.type === "INCOME") totalIncome += item.amount;
    else totalExpense += item.amount;
  }

  const net = Number((totalIncome - totalExpense).toFixed(2));
  const query = search.trim();

  let headline = net >= 0 ? labels.netPositive : labels.netNegative;
  let mainAmount = net;
  let toneClass = net >= 0 ? styles.positive : styles.negative;

  if (typeFilter === "INCOME") {
    headline = query ? `${labels.totalForSearch} «${query}»` : labels.totalReceived;
    mainAmount = totalIncome;
    toneClass = styles.positive;
  } else if (typeFilter === "EXPENSE") {
    headline = query ? `${labels.totalForSearch} «${query}»` : labels.totalSpent;
    mainAmount = totalExpense;
    toneClass = styles.negative;
  } else if (query) {
    headline = `${labels.totalForSearch} «${query}»`;
  }

  const sumTotal = totalIncome + totalExpense;

  return (
    <Card className={styles.card}>
      <span className={styles.headline}>{headline}</span>
      <h2 className={`${styles.heroAmount} ${toneClass}`}>
        {typeFilter === "ALL" && mainAmount > 0 ? "+ " : ""}
        {formatCurrency(mainAmount, currency)}
      </h2>

      {typeFilter === "ALL" && sumTotal > 0 && (
        <>
          <progress className={styles.ratioBar} value={totalIncome} max={sumTotal} />
          <div className={styles.splitRow}>
            <div className={styles.splitBox}>
              <span className={styles.splitLabelIn}><ArrowDownLeft size={14} /> {labels.inLabel}</span>
              <strong className={styles.positive}>{formatCurrency(totalIncome, currency)}</strong>
            </div>
            <div className={styles.splitBox}>
              <span className={styles.splitLabelOut}><ArrowUpRight size={14} /> {labels.outLabel}</span>
              <strong className={styles.negative}>{formatCurrency(totalExpense, currency)}</strong>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
