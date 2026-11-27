"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";
import { deleteTransactionAction, updateTransactionAction } from "../../handlers/movement-actions";
import type { TransactionItem, TransactionType } from "../../types";
import styles from "./edit-transaction-modal.module.css";

const CURRENCY_PREFIX: Record<string, string> = { PEN: "S/.", USD: "$", EUR: "€" };

interface EditTransactionModalProps {
  item: TransactionItem | null;
  currency: string;
  labels: Dictionary["movements"];
  homeLabels: Dictionary["home"];
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function EditTransactionModal({
  item, currency, labels, homeLabels, onClose, onUpdated, onDeleted,
}: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!item) return;
    setType(item.type);
    setAmount(item.amount.toFixed(2));
    setConcept(item.concept);
    setConfirmDelete(false);
    setError(null);
  }, [item]);

  if (!item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("id", item.id);
    fd.set("type", type);
    fd.set("amount", amount);
    fd.set("concept", concept);
    startTransition(async () => {
      const res = await updateTransactionAction(fd);
      if (!res.success) return setError(res.error || "No se pudo actualizar");
      onUpdated();
    });
  };

  const handleDelete = () => startTransition(async () => {
    const res = await deleteTransactionAction(item.id);
    if (!res.success) return setError(res.error || "No se pudo eliminar");
    onDeleted();
  });

  return (
    <Modal isOpen onClose={onClose} title={labels.editModalTitle}>
      <form onSubmit={handleSave} className={styles.form} noValidate>
        <div className={styles.typeToggle}>
          <button type="button" onClick={() => setType("INCOME")}
            className={`${styles.typeBtn} ${type === "INCOME" ? styles.typeIncome : ""}`.trim()}>
            + {labels.typeIncome}
          </button>
          <button type="button" onClick={() => setType("EXPENSE")}
            className={`${styles.typeBtn} ${type === "EXPENSE" ? styles.typeExpense : ""}`.trim()}>
            - {labels.typeExpense}
          </button>
        </div>

        <div className={styles.amountBox}>
          <span className={styles.prefix}>{CURRENCY_PREFIX[currency] || "S/."}</span>
          <input type="text" inputMode="decimal" value={amount}
            onChange={(e) => setAmount(e.target.value)} className={styles.amountInput} />
        </div>

        <Input
          label={type === "INCOME" ? homeLabels.incomeConceptLabel : homeLabels.expenseConceptLabel}
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          clearable
        />

        {error && <p className={styles.errorText}>{error}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? homeLabels.saving : labels.saveChanges}
        </Button>

        {!confirmDelete ? (
          <button type="button" onClick={() => setConfirmDelete(true)}
            className={styles.deleteLink} disabled={isPending}>
            <Trash2 size={16} /> {labels.deleteBtn}
          </button>
        ) : (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>{labels.confirmDeleteText}</p>
            <div className={styles.confirmActions}>
              <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)} disabled={isPending}>
                {labels.confirmDeleteCancel}
              </Button>
              <Button type="button" className={styles.confirmDangerBtn} onClick={handleDelete} disabled={isPending}>
                {labels.confirmDeleteYes}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
