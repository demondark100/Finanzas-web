"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import type { Dictionary, Locale } from "@/i18n";
import { deleteTransactionAction } from "../../handlers/movement-actions";
import { formatCurrency, formatFullDate, formatTimeLabel } from "../../helpers/formatters";
import type { TransactionItem } from "../../types";
import { EditTransactionModal } from "../edit-transaction-modal";
import styles from "./movement-detail.module.css";

interface MovementDetailProps {
  item: TransactionItem;
  currency: string;
  locale: Locale;
  labels: Dictionary["movements"];
  homeLabels: Dictionary["home"];
}

export function MovementDetail({
  item, currency, locale, labels, homeLabels,
}: MovementDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isIncome = item.type === "INCOME";

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteTransactionAction(item.id);
      if (res.success) router.push("/movimientos");
    });
  };

  return (
    <>
      <div className={styles.topBar}>
        <Link href="/movimientos" className={styles.backBtn}>
          <ArrowLeft size={16} /> {labels.back}
        </Link>
        <span className={styles.topTitle}>{labels.detailTitle}</span>
      </div>

      <section className={styles.mainSurface}>
        <span className={`${styles.typePill} ${isIncome ? styles.pillIn : styles.pillOut}`}>
          {isIncome ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
          {isIncome ? labels.typeIncome : labels.typeExpense}
        </span>
        <h1 className={`${styles.heroAmount} ${isIncome ? styles.positive : styles.negative}`}>
          {isIncome ? "+" : "-"} {formatCurrency(item.amount, currency)}
        </h1>

        <div className={styles.detailsList}>
          <div className={styles.detailRow}>
            <span className={styles.rowLabel}>{labels.fieldConcept}</span>
            <span className={styles.rowValue}>{item.concept}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.rowLabel}>{labels.fieldDate}</span>
            <span className={styles.rowValue}>{formatFullDate(item.occurredAt, locale)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.rowLabel}>{labels.fieldTime}</span>
            <span className={styles.rowValue}>{formatTimeLabel(item.occurredAt, locale)}</span>
          </div>
          {item.category && (
            <div className={styles.detailRow}>
              <span className={styles.rowLabel}>{labels.fieldCategory}</span>
              <span className={styles.rowValue}>{item.category}</span>
            </div>
          )}
        </div>
      </section>

      {!confirmDelete ? (
        <div className={styles.subtleActions}>
          <button type="button" onClick={() => setEditOpen(true)} className={styles.subtleBtn}>
            <Pencil size={15} /> {labels.editSubtle}
          </button>
          <button type="button" onClick={() => setConfirmDelete(true)} className={styles.subtleDangerBtn}>
            <Trash2 size={15} /> {labels.deleteSubtle}
          </button>
        </div>
      ) : (
        <Card className={styles.confirmCard}>
          <p className={styles.confirmText}>{labels.confirmDeleteText}</p>
          <div className={styles.confirmActions}>
            <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)} disabled={isPending}>
              {labels.confirmDeleteCancel}
            </Button>
            <Button type="button" className={styles.dangerBtn} onClick={handleDelete} disabled={isPending}>
              {labels.confirmDeleteYes}
            </Button>
          </div>
        </Card>
      )}

      <EditTransactionModal
        item={editOpen ? item : null} currency={currency} labels={labels} homeLabels={homeLabels}
        onClose={() => setEditOpen(false)}
        onUpdated={() => { setEditOpen(false); setToastMsg(labels.updatedToast); router.refresh(); }}
        onDeleted={() => router.push("/movimientos")}
      />
      <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />
    </>
  );
}
