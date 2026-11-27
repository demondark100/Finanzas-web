"use client";

import { useEffect, useState, useTransition } from "react";
import { toIsoDateParam } from "@/modules/transactions/helpers/formatters";
import {
  addDebtEntryAction,
  deleteDebtEntryAction,
  updateDebtEntryAction,
} from "../../handlers/entry-actions";
import type { DebtEntryItem, DebtEntryKind } from "../../types";

export function useDebtEntryForm(params: {
  isOpen: boolean;
  contactId: string;
  initialKind: DebtEntryKind;
  editingEntry?: DebtEntryItem | null;
  onSuccess: (action: "created" | "updated" | "deleted") => void;
}) {
  const { isOpen, contactId, initialKind, editingEntry, onSuccess } = params;
  const [kind, setKind] = useState<DebtEntryKind>(initialKind);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState<Date | null>(() => new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    setKind(editingEntry?.kind ?? initialKind);
    setAmount(editingEntry ? editingEntry.amount.toFixed(2) : "");
    setNote(editingEntry?.note ?? "");
    setOccurredAt(editingEntry ? new Date(editingEntry.occurredAt) : new Date());
    setDueDate(editingEntry?.dueDate ? new Date(editingEntry.dueDate) : null);
    setConfirmDelete(false);
    setError(null);
  }, [isOpen, initialKind, editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("contactId", contactId);
    fd.set("kind", kind);
    fd.set("amount", amount);
    fd.set("note", note);
    if (occurredAt) fd.set("occurredAt", toIsoDateParam(occurredAt));
    if (dueDate) fd.set("dueDate", toIsoDateParam(dueDate));
    if (editingEntry) fd.set("id", editingEntry.id);

    startTransition(async () => {
      const res = editingEntry ? await updateDebtEntryAction(fd) : await addDebtEntryAction(fd);
      if (!res.success) return setError(res.error || "No se pudo guardar");
      onSuccess(editingEntry ? "updated" : "created");
    });
  };

  const handleDelete = () => {
    if (!editingEntry) return;
    startTransition(async () => {
      const res = await deleteDebtEntryAction(editingEntry.id);
      if (!res.success) return setError(res.error || "No se pudo eliminar");
      onSuccess("deleted");
    });
  };

  return {
    kind, setKind, amount, setAmount, note, setNote,
    occurredAt, setOccurredAt, dueDate, setDueDate,
    confirmDelete, setConfirmDelete,
    error, isPending, handleSubmit, handleDelete,
  };
}
