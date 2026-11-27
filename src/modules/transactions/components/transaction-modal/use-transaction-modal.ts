"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toIsoDateParam } from "../../helpers/formatters";
import { addExpenseAction, addIncomeAction } from "../../handlers/transaction-actions";
import type { TransactionType } from "../../types";

export function useTransactionModal(params: {
  type: TransactionType | null;
  suggestionsIncome: string[];
  suggestionsExpense: string[];
  onSuccess: (savedType: TransactionType) => void;
}) {
  const { type, suggestionsIncome, suggestionsExpense, onSuccess } = params;
  const [activeType, setActiveType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [occurredAt, setOccurredAt] = useState<Date | null>(() => new Date());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!type) return;
    setActiveType(type);
    setAmount("");
    setConcept("");
    setOccurredAt(new Date());
    setError(null);
    const timer = window.setTimeout(() => amountRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const suggestions = activeType === "INCOME" ? suggestionsIncome : suggestionsExpense;
    const formData = new FormData();
    formData.set("amount", amount);
    formData.set("concept", concept);
    if (suggestions.includes(concept)) formData.set("category", concept);
    if (occurredAt) formData.set("occurredAt", toIsoDateParam(occurredAt));

    startTransition(async () => {
      const action = activeType === "INCOME" ? addIncomeAction : addExpenseAction;
      const res = await action(formData);
      if (!res.success) return setError(res.error || "No se pudo guardar");
      onSuccess(activeType);
    });
  };

  return {
    activeType, setActiveType, amount, setAmount, concept, setConcept,
    occurredAt, setOccurredAt, error, setError, isPending, amountRef, handleSubmit,
  };
}
