"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Users } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import type { Dictionary, Locale } from "@/i18n";
import type { TransactionType } from "../../types";
import { TransactionModal } from "../transaction-modal";
import styles from "./quick-actions.module.css";

interface QuickActionsProps {
  currency: string;
  locale?: Locale;
  showLoansShortcut?: boolean;
  labels: Dictionary["home"];
}

export function QuickActions({
  currency, locale = "es", showLoansShortcut = false, labels,
}: QuickActionsProps) {
  const router = useRouter();
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaved = (savedType: TransactionType) => {
    setModalType(null);
    setToastMessage(savedType === "INCOME" ? labels.incomeSaved : labels.expenseSaved);
    router.refresh();
  };

  return (
    <>
      <div className={showLoansShortcut ? styles.actionsGridThree : styles.actionsGridTwo}>
        <button type="button" className={styles.actionTile} onClick={() => setModalType("INCOME")}>
          <span className={`${styles.iconCircle} ${styles.iconIncome}`}>
            <ArrowDownLeft size={20} strokeWidth={2.2} />
          </span>
          <span className={styles.tileLabel}>{labels.quickIncome}</span>
        </button>

        <button type="button" className={styles.actionTile} onClick={() => setModalType("EXPENSE")}>
          <span className={`${styles.iconCircle} ${styles.iconExpense}`}>
            <ArrowUpRight size={20} strokeWidth={2.2} />
          </span>
          <span className={styles.tileLabel}>{labels.quickExpense}</span>
        </button>

        {showLoansShortcut && (
          <Link href="/deudas" className={styles.actionTile}>
            <span className={`${styles.iconCircle} ${styles.iconLoans}`}>
              <Users size={20} strokeWidth={2.2} />
            </span>
            <span className={styles.tileLabel}>{labels.quickLoans}</span>
          </Link>
        )}
      </div>

      <TransactionModal
        type={modalType}
        currency={currency}
        locale={locale}
        labels={labels}
        onClose={() => setModalType(null)}
        onSuccess={handleSaved}
      />

      <Toast message={toastMessage} variant="success" onDismiss={() => setToastMessage(null)} />
    </>
  );
}
