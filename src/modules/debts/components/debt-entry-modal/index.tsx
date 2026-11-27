"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/calendar";
import type { Dictionary, Locale } from "@/i18n";
import type { DebtEntryItem, DebtEntryKind } from "../../types";
import { DeleteConfirmBox } from "./delete-confirm-box";
import { useDebtEntryForm } from "./use-debt-entry-form";
import styles from "./debt-entry-modal.module.css";

const CURRENCY_PREFIX: Record<string, string> = { PEN: "S/.", USD: "$", EUR: "€" };

interface DebtEntryModalProps {
  isOpen: boolean;
  contactId: string;
  initialKind: DebtEntryKind;
  editingEntry?: DebtEntryItem | null;
  currency: string;
  locale: Locale;
  labels: Dictionary["debts"];
  movLabels: Dictionary["movements"];
  savingText: string;
  onClose: () => void;
  onSuccess: (action: "created" | "updated" | "deleted") => void;
}

export function DebtEntryModal(props: DebtEntryModalProps) {
  const { isOpen, editingEntry, currency, locale, labels, movLabels, savingText, onClose } = props;
  const form = useDebtEntryForm(props);

  const kindOptions: { value: DebtEntryKind; label: string }[] = [
    { value: "LENT", label: labels.kindLent },
    { value: "REPAYMENT_RECEIVED", label: labels.kindRepaymentReceived },
    { value: "BORROWED", label: labels.kindBorrowed },
    { value: "REPAYMENT_PAID", label: labels.kindRepaymentPaid },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingEntry ? labels.editEntryTitle : labels.newEntryTitle}>
      <form onSubmit={form.handleSubmit} className={styles.form} noValidate>
        <div className={styles.kindGrid}>
          {kindOptions.map((o) => (
            <button key={o.value} type="button" onClick={() => form.setKind(o.value)}
              className={form.kind === o.value ? styles.kindActive : styles.kindBtn}>{o.label}</button>
          ))}
        </div>

        <div className={styles.amountBox}>
          <span className={styles.prefix}>{CURRENCY_PREFIX[currency] || "S/."}</span>
          <input type="text" inputMode="decimal" placeholder="0.00" value={form.amount}
            onChange={(e) => form.setAmount(e.target.value)} className={styles.amountInput} />
        </div>

        <Input label={labels.entryNoteLabel} placeholder={labels.entryNotePlaceholder}
          value={form.note} onChange={(e) => form.setNote(e.target.value)} clearable />

        <div className={styles.datesGrid}>
          <DatePicker label={labels.entryDateLabel} mode="single" locale={locale}
            value={form.occurredAt} onChange={form.setOccurredAt} maxDate={new Date()} />
          <DatePicker label={labels.dueDateLabel} mode="single" locale={locale}
            value={form.dueDate} onChange={form.setDueDate} allowClear />
        </div>

        {form.error && <p className={styles.errorText}>{form.error}</p>}
        <Button type="submit" disabled={form.isPending}>{form.isPending ? savingText : labels.saveEntry}</Button>

        {editingEntry && (
          <DeleteConfirmBox
            confirming={form.confirmDelete} isPending={form.isPending}
            triggerLabel={labels.deleteEntryBtn} confirmText={labels.confirmDeleteEntry}
            cancelLabel={movLabels.confirmDeleteCancel} confirmLabel={movLabels.confirmDeleteYes}
            onAskConfirm={() => form.setConfirmDelete(true)}
            onCancel={() => form.setConfirmDelete(false)}
            onConfirm={form.handleDelete}
          />
        )}
      </form>
    </Modal>
  );
}
