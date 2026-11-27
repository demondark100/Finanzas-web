"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";
import {
  createContactAction,
  deleteContactAction,
  updateContactAction,
} from "../../handlers/contact-actions";
import type { DebtContactSummary } from "../../types";
import styles from "./contact-form-modal.module.css";

interface ContactFormModalProps {
  isOpen: boolean;
  editingContact?: DebtContactSummary | null;
  labels: Dictionary["debts"];
  movLabels: Dictionary["movements"];
  savingText: string;
  onClose: () => void;
  onSaved: (contactId?: string) => void;
  onDeleted?: () => void;
}

export function ContactFormModal({
  isOpen, editingContact, labels, movLabels, savingText, onClose, onSaved, onDeleted,
}: ContactFormModalProps) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    setName(editingContact?.name ?? "");
    setNote(editingContact?.note ?? "");
    setConfirmDelete(false);
    setError(null);
  }, [isOpen, editingContact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("note", note);
    if (editingContact) fd.set("id", editingContact.id);

    startTransition(async () => {
      const res = editingContact ? await updateContactAction(fd) : await createContactAction(fd);
      if (!res.success) return setError(res.error || "No se pudo guardar");
      onSaved(res.contactId);
    });
  };

  const handleDelete = () => {
    if (!editingContact) return;
    startTransition(async () => {
      const res = await deleteContactAction(editingContact.id);
      if (!res.success) return setError(res.error || "No se pudo eliminar");
      onDeleted?.();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingContact ? labels.editPersonTitle : labels.newPersonTitle}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input label={labels.personNameLabel} placeholder={labels.personNamePlaceholder}
          value={name} onChange={(e) => setName(e.target.value)} clearable />
        <Input label={labels.personNoteLabel} placeholder={labels.personNotePlaceholder}
          value={note} onChange={(e) => setNote(e.target.value)} clearable />

        {error && <p className={styles.errorText}>{error}</p>}
        <Button type="submit" disabled={isPending}>{isPending ? savingText : labels.savePerson}</Button>

        {editingContact && !confirmDelete && (
          <button type="button" onClick={() => setConfirmDelete(true)} className={styles.deleteLink} disabled={isPending}>
            <Trash2 size={16} /> {labels.deletePersonBtn}
          </button>
        )}

        {editingContact && confirmDelete && (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>{labels.confirmDeletePerson}</p>
            <div className={styles.confirmActions}>
              <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)} disabled={isPending}>
                {movLabels.confirmDeleteCancel}
              </Button>
              <Button type="button" className={styles.confirmDangerBtn} onClick={handleDelete} disabled={isPending}>
                {movLabels.confirmDeleteYes}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
