"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/calendar";
import type { Dictionary, Locale } from "@/i18n";
import type { TransactionType } from "../../types";
import { useTransactionModal } from "./use-transaction-modal";
import styles from "./transaction-modal.module.css";

const CURRENCY_PREFIX: Record<string, string> = { PEN: "S/.", USD: "$", EUR: "€" };

interface TransactionModalProps {
  type: TransactionType | null;
  currency: string;
  locale?: Locale;
  labels: Dictionary["home"];
  onClose: () => void;
  onSuccess: (savedType: TransactionType) => void;
}

export function TransactionModal({
  type, currency, locale = "es", labels, onClose, onSuccess,
}: TransactionModalProps) {
  const form = useTransactionModal({
    type,
    suggestionsIncome: labels.incomeSuggestions,
    suggestionsExpense: labels.expenseSuggestions,
    onSuccess,
  });

  if (!type) return null;
  const isIncome = form.activeType === "INCOME";
  const suggestions = isIncome ? labels.incomeSuggestions : labels.expenseSuggestions;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isIncome ? labels.incomeModalTitle : labels.expenseModalTitle}
    >
      <form onSubmit={form.handleSubmit} className={styles.form} noValidate>
        <div className={styles.typeToggle}>
          <button type="button" onClick={() => form.setActiveType("INCOME")}
            className={`${styles.typeBtn} ${isIncome ? styles.typeIncome : ""}`.trim()}>
            + {labels.typeIncome}
          </button>
          <button type="button" onClick={() => form.setActiveType("EXPENSE")}
            className={`${styles.typeBtn} ${!isIncome ? styles.typeExpense : ""}`.trim()}>
            - {labels.typeExpense}
          </button>
        </div>

        <div className={`${styles.amountBox} ${isIncome ? styles.incomeBox : styles.expenseBox}`}>
          <span className={styles.currencyPrefix}>{CURRENCY_PREFIX[currency] || "S/."}</span>
          <input
            ref={form.amountRef}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => {
              form.setAmount(e.target.value);
              if (form.error) form.setError(null);
            }}
            className={styles.amountInput}
            aria-label="Monto"
          />
        </div>

        <div className={styles.chipsGrid}>
          {suggestions.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => form.setConcept(form.concept === chip ? "" : chip)}
              className={`${styles.chip} ${form.concept === chip ? styles.chipActive : ""}`.trim()}
            >
              {chip}
            </button>
          ))}
        </div>

        <Input
          label={isIncome ? labels.incomeConceptLabel : labels.expenseConceptLabel}
          placeholder={isIncome ? labels.incomeConceptPlaceholder : labels.expenseConceptPlaceholder}
          value={form.concept}
          onChange={(e) => form.setConcept(e.target.value)}
          clearable
        />

        <DatePicker
          label={labels.dateLabel}
          mode="single"
          locale={locale}
          value={form.occurredAt}
          onChange={form.setOccurredAt}
          maxDate={new Date()}
        />

        {form.error && <p className={styles.errorText}>{form.error}</p>}

        <Button
          type="submit"
          disabled={form.isPending}
          className={isIncome ? styles.submitIncome : styles.submitExpense}
        >
          {form.isPending ? labels.saving : isIncome ? labels.saveIncome : labels.saveExpense}
        </Button>
      </form>
    </Modal>
  );
}
