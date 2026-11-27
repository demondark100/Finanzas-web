import React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary, Locale } from "@/i18n";
import { formatCurrency, formatFriendlyDate } from "../../helpers/formatters";
import type { TransactionItem } from "../../types";
import styles from "./recent-movements.module.css";

interface RecentMovementsProps {
  items: TransactionItem[];
  currency: string;
  locale?: Locale;
  hidden?: boolean;
  labels: Dictionary["home"];
}

export function RecentMovements({
  items,
  currency,
  locale = "es",
  hidden = false,
  labels,
}: RecentMovementsProps) {
  return (
    <Card>
      <div className={styles.headerRow}>
        <h3 className={styles.heading}>{labels.recentMovements}</h3>
        {items.length > 0 && (
          <Link href="/movimientos" className={styles.viewAllLink}>
            {labels.viewAll}
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className={styles.emptyText}>{labels.noMovements}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            const isIncome = item.type === "INCOME";
            return (
              <li key={item.id}>
                <Link href={`/movimientos/${item.id}`} className={styles.row}>
                  <div className={styles.leftGroup}>
                    <span
                      className={`${styles.badge} ${isIncome ? styles.badgeIncome : styles.badgeExpense}`}
                      aria-hidden="true"
                    >
                      {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </span>
                    <div className={styles.meta}>
                      <span className={styles.concept}>{item.concept}</span>
                      <span className={styles.date}>
                        {formatFriendlyDate(item.occurredAt, locale)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`${styles.amount} ${isIncome ? styles.amountIncome : styles.amountExpense}`}
                  >
                    {hidden ? "••••" : `${isIncome ? "+" : "-"} ${formatCurrency(item.amount, currency)}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
