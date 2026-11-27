import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./debt-entry-modal.module.css";

interface DeleteConfirmBoxProps {
  confirming: boolean;
  isPending: boolean;
  triggerLabel: string;
  confirmText: string;
  cancelLabel: string;
  confirmLabel: string;
  onAskConfirm: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmBox({
  confirming, isPending, triggerLabel, confirmText, cancelLabel, confirmLabel,
  onAskConfirm, onCancel, onConfirm,
}: DeleteConfirmBoxProps) {
  if (!confirming) {
    return (
      <button type="button" onClick={onAskConfirm} className={styles.deleteLink} disabled={isPending}>
        <Trash2 size={16} /> {triggerLabel}
      </button>
    );
  }

  return (
    <div className={styles.confirmBox}>
      <p className={styles.confirmText}>{confirmText}</p>
      <div className={styles.confirmActions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          {cancelLabel}
        </Button>
        <Button type="button" className={styles.confirmDangerBtn} onClick={onConfirm} disabled={isPending}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
