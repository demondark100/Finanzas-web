"use client";

import React from "react";
import { CheckCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import type { Dictionary, Locale } from "@/i18n";
import type { DebtNotificationItem } from "../../types";
import { NotificationItemCard } from "./notification-item";
import styles from "./notifications-modal.module.css";

interface NotificationsModalProps {
  isOpen: boolean;
  items: DebtNotificationItem[];
  currency: string;
  locale: Locale;
  labels: Dictionary["notifications"];
  busyId: string | null;
  isBulkPending: boolean;
  onClose: () => void;
  onDismiss: (entryId: string) => void;
  onSnooze: (entryId: string) => void;
  onDismissAll: () => void;
}

export function NotificationsModal({
  isOpen, items, currency, locale, labels, busyId, isBulkPending,
  onClose, onDismiss, onSnooze, onDismissAll,
}: NotificationsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={labels.modalTitle}>
      <div className={styles["finanzas-notif-modal"]}>
        {items.length > 0 && (
          <div className={styles["finanzas-notif-modal__toolbar"]}>
            <button
              type="button"
              disabled={isBulkPending}
              onClick={onDismissAll}
              className={styles["finanzas-notif-modal__clear-all"]}
            >
              <CheckCheck size={15} /> {labels.markAllRead}
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className={styles["finanzas-notif-modal__empty"]}>
            <span className={styles["finanzas-notif-modal__empty-icon"]} aria-hidden="true">
              <CheckCheck size={28} />
            </span>
            <h3 className={styles["finanzas-notif-modal__empty-title"]}>{labels.emptyTitle}</h3>
            <p className={styles["finanzas-notif-modal__empty-desc"]}>{labels.emptyDesc}</p>
          </div>
        ) : (
          <div className={styles["finanzas-notif-modal__list"]}>
            {items.map((item) => (
              <NotificationItemCard
                key={item.entryId}
                item={item}
                currency={currency}
                locale={locale}
                labels={labels}
                isBusy={isBulkPending || busyId === item.entryId}
                onNavigate={onClose}
                onSnooze={onSnooze}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
