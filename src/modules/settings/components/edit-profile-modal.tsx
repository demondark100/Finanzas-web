"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";
import { updateProfileAction } from "../handlers/settings-actions";
import styles from "./settings.module.css";

interface EditProfileModalProps {
  isOpen: boolean;
  currentName: string;
  labels: Dictionary["settings"];
  savingText: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProfileModal({
  isOpen, currentName, labels, savingText, onClose, onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    setName(currentName);
    setError(null);
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    startTransition(async () => {
      const res = await updateProfileAction(fd);
      if (!res.success) return setError(res.error || "No se pudo guardar");
      onSuccess();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={labels.editProfileTitle}>
      <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
        <Input
          label={labels.nameLabel}
          placeholder={labels.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          clearable
        />
        {error && <p className={styles.errorText}>{error}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? savingText : labels.saveName}
        </Button>
      </form>
    </Modal>
  );
}
