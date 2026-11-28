"use client";

import React from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Check, Clock, ExternalLink } from "lucide-react";
import type { Dictionary, Locale } from "@/i18n";
import { formatCurrency, formatFriendlyDate } from "@/modules/transactions/helpers/formatters";
import { formatDueBadgeText } from "../../helpers/format-due-label";
import type { DebtNotificationItem } from "../../types";
import styles from "./notifications-modal.module.css";

interface NotificationItemCardProps {
  item: DebtNotificationItem;
  currency: string;
  locale: Locale;
  labels: Dictionary["notifications"];
  isBusy: boolean;
  onNavigate: () => void;
  onSnooze: (entryId: string) => void;
  onDismiss: (entryId: string) => void;
}

export function NotificationItemCard({
  item, currency, locale, labels, isBusy, onNavigate, onSnooze, onDismiss,
}: NotificationItemCardProps) {
  const isReceivable = item.direction === "receivable";
  const dirClass = isReceivable
    ? styles["finanzas-notif-item__badge--receivable"]
    : styles["finanzas-notif-item__badge--payable"];
  const sevClass =
    item.severity === "overdue"
      ? styles["finanzas-notif-item__due--overdue"]
      : item.severity === "due_today"
        ? styles["finanzas-notif-item__due--today"]
        : styles["finanzas-notif-item__due--upcoming"];

  const dueText = formatDueBadgeText(item.severity, item.daysDiff, labels);
  const directionLabel = isReceivable ? labels.directionReceivable : labels.directionPayable;

  return (
    <article className={styles["finanzas-notif-item"]}>
      <div className={styles["finanzas-notif-item__top"]}>
        <span className={`${styles["finanzas-notif-item__badge"]} ${dirClass}`} aria-hidden="true">
          {isReceivable ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
        </span>

        <div className={styles["finanzas-notif-item__info"]}>
          <div className={styles["finanzas-notif-item__title-row"]}>
            <Link
              href={`/deudas/${item.contactId}`}
              onClick={onNavigate}
              className={styles["finanzas-notif-item__name"]}
            >
              {item.contactName}
            </Link>
            <span className={`${styles["finanzas-notif-item__due"]} ${sevClass}`}>{dueText}</span>
          </div>

          <p className={styles["finanzas-notif-item__meta"]}>
            {directionLabel} · {formatFriendlyDate(item.dueDate, locale)}
            {item.note ? ` · ${item.note}` : ""}
          </p>
        </div>

        <span
          className={`${styles["finanzas-notif-item__amount"]} ${
            isReceivable
              ? styles["finanzas-notif-item__amount--in"]
              : styles["finanzas-notif-item__amount--out"]
          }`}
        >
          {formatCurrency(item.entryAmount, currency)}
        </span>
      </div>

      <div className={styles["finanzas-notif-item__actions"]}>
        <Link
          href={`/deudas/${item.contactId}`}
          onClick={onNavigate}
          className={styles["finanzas-notif-item__link"]}
        >
          <ExternalLink size={13} /> {labels.viewDebt}
        </Link>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSnooze(item.entryId)}
          className={styles["finanzas-notif-item__btn"]}
        >
          <Clock size={13} /> {labels.snoozeDay}
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDismiss(item.entryId)}
          className={`${styles["finanzas-notif-item__btn"]} ${styles["finanzas-notif-item__btn--primary"]}`}
        >
          <Check size={13} /> {labels.markRead}
        </button>
      </div>
    </article>
  );
}
