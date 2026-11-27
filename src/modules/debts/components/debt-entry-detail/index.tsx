"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import type { Dictionary, Locale } from "@/i18n";
import { formatCurrency, formatFullDate, formatTimeLabel } from "@/modules/transactions/helpers/formatters";
import { deleteDebtEntryAction } from "../../handlers/entry-actions";
import type { DebtEntryItem, DebtEntryKind } from "../../types";
import { DebtEntryModal } from "../debt-entry-modal";
import styles from "./debt-entry-detail.module.css";

interface DebtEntryDetailProps {
  contactId: string;
  contactName: string;
  entry: DebtEntryItem;
  currency: string;
  locale: Locale;
  labels: Dictionary["debts"];
  movLabels: Dictionary["movements"];
  savingText: string;
}

export function DebtEntryDetail({
  contactId, contactName, entry, currency, locale, labels, movLabels, savingText,
}: DebtEntryDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const kindLabels: Record<DebtEntryKind, string> = {
    LENT: labels.kindLent, REPAYMENT_RECEIVED: labels.kindRepaymentReceived,
    BORROWED: labels.kindBorrowed, REPAYMENT_PAID: labels.kindRepaymentPaid,
  };
  const isPos = entry.kind === "LENT" || entry.kind === "REPAYMENT_PAID";
  const Icon = entry.kind === "LENT" ? ArrowUpRight : entry.kind === "BORROWED" ? ArrowDownLeft : Check;

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteDebtEntryAction(entry.id);
      if (res.success) router.push(`/deudas/${contactId}`);
    });
  };

  return (
    <>
      <div className={styles.topBar}>
        <Link href={`/deudas/${contactId}`} className={styles.backBtn}>
          <ArrowLeft size={16} /> {labels.backToList}
        </Link>
        <span className={styles.topTitle}>{labels.entryDetailTitle}</span>
      </div>

      <section className={styles.mainSurface}>
        <span className={`${styles.typePill} ${isPos ? styles.pillIn : styles.pillOut}`}>
          <Icon size={15} /> {kindLabels[entry.kind]}
        </span>
        <h1 className={`${styles.heroAmount} ${isPos ? styles.positive : styles.negative}`}>
          {formatCurrency(entry.amount, currency)}
        </h1>

        <div className={styles.detailsList}>
          <div className={styles.detailRow}><span className={styles.rowLabel}>{labels.fieldPerson}</span><span className={styles.rowValue}>{contactName}</span></div>
          {entry.note && <div className={styles.detailRow}><span className={styles.rowLabel}>{labels.entryNoteLabel}</span><span className={styles.rowValue}>{entry.note}</span></div>}
          <div className={styles.detailRow}><span className={styles.rowLabel}>{labels.entryDateLabel}</span><span className={styles.rowValue}>{formatFullDate(entry.occurredAt, locale)}</span></div>
          <div className={styles.detailRow}><span className={styles.rowLabel}>{movLabels.fieldTime}</span><span className={styles.rowValue}>{formatTimeLabel(entry.occurredAt, locale)}</span></div>
          {entry.dueDate && <div className={styles.detailRow}><span className={styles.rowLabel}>{labels.fieldDueDate}</span><span className={styles.rowValue}>{formatFullDate(entry.dueDate, locale)}</span></div>}
        </div>
      </section>

      {!confirmDelete ? (
        <div className={styles.subtleActions}>
          <button type="button" onClick={() => setEditOpen(true)} className={styles.subtleBtn}><Pencil size={15} /> {movLabels.editSubtle}</button>
          <button type="button" onClick={() => setConfirmDelete(true)} className={styles.subtleDangerBtn}><Trash2 size={15} /> {movLabels.deleteSubtle}</button>
        </div>
      ) : (
        <Card className={styles.confirmCard}>
          <p className={styles.confirmText}>{labels.confirmDeleteEntry}</p>
          <div className={styles.confirmActions}>
            <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)} disabled={isPending}>{movLabels.confirmDeleteCancel}</Button>
            <Button type="button" className={styles.dangerBtn} onClick={handleDelete} disabled={isPending}>{movLabels.confirmDeleteYes}</Button>
          </div>
        </Card>
      )}

      <DebtEntryModal
        isOpen={editOpen} contactId={contactId} initialKind={entry.kind} editingEntry={entry}
        currency={currency} locale={locale} labels={labels} movLabels={movLabels} savingText={savingText}
        onClose={() => setEditOpen(false)}
        onSuccess={(act) => {
          setEditOpen(false);
          if (act === "deleted") router.push(`/deudas/${contactId}`);
          else { setToastMsg(labels.entryUpdated); router.refresh(); }
        }}
      />
      <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />
    </>
  );
}
