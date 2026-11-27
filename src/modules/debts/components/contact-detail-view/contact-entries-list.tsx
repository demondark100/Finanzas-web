import React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Calculator, Check, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary, Locale } from "@/i18n";
import { formatCurrency, formatFriendlyDate } from "@/modules/transactions/helpers/formatters";
import type { DebtEntryItem, DebtEntryKind } from "../../types";
import styles from "./contact-detail-view.module.css";

interface ContactEntriesListProps {
  contactId: string;
  entries: DebtEntryItem[];
  currency: string;
  locale: Locale;
  labels: Dictionary["debts"];
  movLabels: Dictionary["movements"];
  selectMode: boolean;
  selectedIds: string[];
  onToggleMode: () => void;
  onToggleSelect: (id: string) => void;
}

export function ContactEntriesList({
  contactId, entries, currency, locale, labels, movLabels,
  selectMode, selectedIds, onToggleMode, onToggleSelect,
}: ContactEntriesListProps) {
  const kindLabelMap: Record<DebtEntryKind, string> = {
    LENT: labels.kindLent, REPAYMENT_RECEIVED: labels.kindRepaymentReceived,
    BORROWED: labels.kindBorrowed, REPAYMENT_PAID: labels.kindRepaymentPaid,
  };

  return (
    <>
      <div className={styles.historyHeader}>
        <h3 className={styles.historyTitle}>{labels.historyHeading}</h3>
        {entries.length > 0 && (
          <button type="button" onClick={onToggleMode} className={selectMode ? styles.sumBtnActive : styles.sumBtn}>
            <Calculator size={14} /> {selectMode ? movLabels.cancelSelect : movLabels.selectToSum}
          </button>
        )}
      </div>

      <Card className={styles.historyCard}>
        {entries.length === 0 ? (
          <p className={styles.emptyText}>{labels.emptyEntries}</p>
        ) : (
          entries.map((entry) => {
            const isPos = entry.kind === "LENT" || entry.kind === "REPAYMENT_PAID";
            const isSelected = selectedIds.includes(entry.id);
            const Icon = entry.kind === "LENT" ? ArrowUpRight : entry.kind === "BORROWED" ? ArrowDownLeft : Check;
            const inner = (
              <>
                <div className={styles.entryLeft}>
                  {selectMode ? (
                    <span className={`${styles.checkCircle} ${isSelected ? styles.checkSelected : ""}`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </span>
                  ) : (
                    <span className={`${styles.entryBadge} ${isPos ? styles.badgeIn : styles.badgeOut}`}><Icon size={15} /></span>
                  )}
                  <div className={styles.entryMeta}>
                    <span className={styles.entryKind}>{kindLabelMap[entry.kind]}</span>
                    {entry.note && <span className={styles.entryNote}>{entry.note}</span>}
                    <span className={styles.entryDate}>
                      {formatFriendlyDate(entry.occurredAt, locale)}
                      {entry.dueDate ? <> · <Clock size={12} /> {formatFriendlyDate(entry.dueDate, locale)}</> : ""}
                    </span>
                  </div>
                </div>
                <span className={`${styles.entryAmount} ${isPos ? styles.positive : styles.negative}`}>
                  {formatCurrency(entry.amount, currency)}
                </span>
              </>
            );

            if (selectMode) {
              return (
                <button key={entry.id} type="button" onClick={() => onToggleSelect(entry.id)}
                  className={`${styles.entryRow} ${isSelected ? styles.rowSelected : ""}`}>
                  {inner}
                </button>
              );
            }
            return (
              <Link key={entry.id} href={`/deudas/${contactId}/${entry.id}`} className={styles.entryRow}>
                {inner}
              </Link>
            );
          })
        )}
      </Card>
    </>
  );
}
