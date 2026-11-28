"use client";

import React, { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/toast";
import type { Dictionary, Locale } from "@/i18n";
import {
  dismissAllNotificationsAction,
  dismissNotificationAction,
  snoozeNotificationAction,
} from "../handlers/notification-actions";
import type { DebtNotificationItem, NotificationsSummary } from "../types";
import { NotificationsModal } from "./notifications-modal";

interface NotificationsContextValue {
  items: DebtNotificationItem[];
  currency: string;
  totalCount: number;
  urgentCount: number;
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

interface NotificationsProviderProps {
  initialData: NotificationsSummary;
  locale: Locale;
  labels: Dictionary["notifications"];
  children: React.ReactNode;
}

const itemKey = (i: DebtNotificationItem) => `${i.entryId}:${i.dueDate}`;

export function NotificationsProvider({
  initialData, locale, labels, children,
}: NotificationsProviderProps) {
  const router = useRouter();
  const [mutedKeys, setMutedKeys] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const items = initialData.items.filter((i) => !mutedKeys.includes(itemKey(i)));
  const urgentCount = items.filter((i) => i.severity !== "upcoming").length;

  const runItemAction = (
    entryId: string,
    action: (id: string) => Promise<{ success: boolean; error?: string }>
  ) => {
    const target = initialData.items.find((i) => i.entryId === entryId);
    const key = target ? itemKey(target) : null;
    if (key) setMutedKeys((prev) => [...prev, key]);
    setBusyId(entryId);

    startTransition(async () => {
      const res = await action(entryId);
      setBusyId(null);
      if (!res.success) {
        if (key) setMutedKeys((prev) => prev.filter((k) => k !== key));
        setToastError(res.error ?? "Error");
        return;
      }
      router.refresh();
    });
  };

  const handleDismissAll = () => {
    const keys = items.map(itemKey);
    const ids = items.map((i) => i.entryId);
    setMutedKeys((prev) => [...prev, ...keys]);
    startTransition(async () => {
      const res = await dismissAllNotificationsAction(ids);
      if (!res.success) {
        setMutedKeys((prev) => prev.filter((k) => !keys.includes(k)));
        setToastError(res.error ?? "Error");
        return;
      }
      router.refresh();
    });
  };

  return (
    <NotificationsContext.Provider
      value={{
        items, currency: initialData.currency, totalCount: items.length, urgentCount,
        isOpen, openNotifications: () => setIsOpen(true), closeNotifications: () => setIsOpen(false),
      }}
    >
      {children}
      <NotificationsModal
        isOpen={isOpen} items={items} currency={initialData.currency}
        locale={locale} labels={labels} busyId={busyId} isBulkPending={isPending}
        onClose={() => setIsOpen(false)}
        onDismiss={(id) => runItemAction(id, dismissNotificationAction)}
        onSnooze={(id) => runItemAction(id, snoozeNotificationAction)}
        onDismissAll={handleDismissAll}
      />
      <Toast message={toastError} variant="error" onDismiss={() => setToastError(null)} />
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue | null {
  return useContext(NotificationsContext);
}
