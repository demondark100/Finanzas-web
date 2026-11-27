import React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Check, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary, Locale } from "@/i18n";
import { formatCurrency, formatTimeLabel, groupTransactionsByDate } from "../../helpers/formatters";
import type { TransactionItem } from "../../types";
import styles from "./movement-list.module.css";

interface MovementListProps {
  items: TransactionItem[];
  hasAnyInPeriod: boolean;
  currency: string;
  locale: Locale;
  labels: Dictionary["movements"];
  selectMode?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export function MovementList({
  items, hasAnyInPeriod, currency, locale, labels,
  selectMode = false, selectedIds = [], onToggleSelect,
}: MovementListProps) {
  if (items.length === 0) {
    return (
      <Card className={styles.emptyCard}>
        <div className={styles.emptyIcon}><ReceiptText size={32} /></div>
        <h3 className={styles.emptyTitle}>{hasAnyInPeriod ? labels.noMatchesTitle : labels.emptyTitle}</h3>
        <p className={styles.emptyDesc}>{hasAnyInPeriod ? labels.noMatchesDesc : labels.emptyDesc}</p>
      </Card>
    );
  }

  const groups = groupTransactionsByDate(items, locale);

  return (
    <div className={styles.groupsStack}>
      {groups.map((group) => (
        <section key={group.key}>
          <h4 className={styles.dateGroupTitle}>{group.label}</h4>
          <Card className={styles.listCard}>
            {group.items.map((item) => {
              const isIncome = item.type === "INCOME";
              const isSelected = selectedIds.includes(item.id);
              const content = (
                <>
                  <div className={styles.leftGroup}>
                    {selectMode ? (
                      <span className={`${styles.checkCircle} ${isSelected ? styles.checkSelected : ""}`}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${isIncome ? styles.badgeIncome : styles.badgeExpense}`}>
                        {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </span>
                    )}
                    <div className={styles.meta}>
                      <span className={styles.concept}>{item.concept}</span>
                      <span className={styles.date}>
                        {formatTimeLabel(item.occurredAt, locale)}
                        {item.isLoan && <span className={styles.loanTag}>{labels.loanBadge}</span>}
                      </span>
                    </div>
                  </div>
                  <span className={`${styles.amount} ${isIncome ? styles.positive : styles.negative}`}>
                    {isIncome ? "+" : "-"} {formatCurrency(item.amount, currency)}
                  </span>
                </>
              );

              if (selectMode) {
                return (
                  <button key={item.id} type="button" onClick={() => onToggleSelect?.(item.id)}
                    className={`${styles.rowBtn} ${isSelected ? styles.rowSelected : ""}`}>
                    {content}
                  </button>
                );
              }
              return (
                <Link key={item.id} href={item.href || `/movimientos/${item.id}`} className={styles.rowBtn}>
                  {content}
                </Link>
              );
            })}
          </Card>
        </section>
      ))}
    </div>
  );
}
