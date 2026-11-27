import React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Users } from "lucide-react";
import type { Dictionary } from "@/i18n";
import { formatCurrency } from "../../helpers/formatters";
import type { BalanceSummary } from "../../types";
import styles from "./balance-card.module.css";

const CURRENCY_PREFIX: Record<string, string> = { PEN: "S/.", USD: "$", EUR: "€" };

interface BalanceCardProps {
  summary: BalanceSummary;
  currency: string;
  hidden?: boolean;
  labels: Dictionary["home"];
}

export function BalanceCard({
  summary,
  currency,
  hidden = false,
  labels,
}: BalanceCardProps) {
  const isNegative = summary.availableBalance < 0;
  const masked = `${CURRENCY_PREFIX[currency] || "S/."} ••••`;

  return (
    <section className={styles.walletCard}>
      <div className={styles.topRow}>
        <span className={styles.label}>{labels.availableBalance}</span>
        <span className={styles.currencyBadge}>{currency}</span>
      </div>

      <h2
        className={`${styles.amount} ${!hidden && isNegative ? styles.amountNegative : ""}`.trim()}
      >
        {hidden ? masked : formatCurrency(summary.availableBalance, currency)}
      </h2>

      <div className={styles.strip}>
        <div className={styles.stripItem}>
          <span className={styles.pillIn} aria-hidden="true">
            <ArrowDownLeft size={15} />
          </span>
          <div className={styles.stripMeta}>
            <span className={styles.stripLabel}>{labels.monthlyIncome}</span>
            <span className={styles.incomeValue}>
              {hidden ? "••••" : formatCurrency(summary.monthlyIncome, currency)}
            </span>
          </div>
        </div>

        <div className={styles.stripDivider} aria-hidden="true" />

        <div className={styles.stripItem}>
          <span className={styles.pillOut} aria-hidden="true">
            <ArrowUpRight size={15} />
          </span>
          <div className={styles.stripMeta}>
            <span className={styles.stripLabel}>{labels.monthlyExpense}</span>
            <span className={styles.expenseValue}>
              {hidden ? "••••" : formatCurrency(summary.monthlyExpense, currency)}
            </span>
          </div>
        </div>
      </div>

      {((summary.pendingReceivable ?? 0) > 0 || (summary.pendingPayable ?? 0) > 0) && (
        <Link href="/deudas" className={styles.loansStrip}>
          <span className={styles.loansLeft}>
            <Users size={13} />
            {(summary.pendingReceivable ?? 0) > 0 && (
              <span>{labels.lentOut}: <strong>{hidden ? "••••" : formatCurrency(summary.pendingReceivable ?? 0, currency)}</strong></span>
            )}
            {(summary.pendingPayable ?? 0) > 0 && (
              <span>{labels.toPay}: <strong>{hidden ? "••••" : formatCurrency(summary.pendingPayable ?? 0, currency)}</strong></span>
            )}
          </span>
          <span className={styles.netWorthText}>
            {labels.netWorth}: {hidden ? "••••" : formatCurrency(summary.netWorth ?? summary.availableBalance, currency)}
          </span>
        </Link>
      )}
    </section>
  );
}
