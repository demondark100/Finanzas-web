"use client";

import React, { useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/i18n";
import type { BalanceSummary, TransactionItem } from "../../types";
import { BalanceCard } from "../balance-card";
import { HomeHeader } from "../home-header";
import { QuickActions } from "../quick-actions";
import { RecentMovements } from "../recent-movements";

const PRIVACY_KEY = "finanzas_hide_balance";

interface HomeDashboardProps {
  userName: string;
  summary: BalanceSummary;
  recentTransactions: TransactionItem[];
  currency: string;
  locale: Locale;
  labels: Dictionary["home"];
}

export function HomeDashboard({
  userName,
  summary,
  recentTransactions,
  currency,
  locale,
  labels,
}: HomeDashboardProps) {
  const [hideAmounts, setHideAmounts] = useState(false);

  useEffect(() => {
    setHideAmounts(localStorage.getItem(PRIVACY_KEY) === "true");
  }, []);

  const handleTogglePrivacy = () => {
    setHideAmounts((prev) => {
      const next = !prev;
      localStorage.setItem(PRIVACY_KEY, String(next));
      return next;
    });
  };

  return (
    <>
      <HomeHeader
        userName={userName}
        hideAmounts={hideAmounts}
        labels={labels}
        onTogglePrivacy={handleTogglePrivacy}
      />

      <BalanceCard
        summary={summary}
        currency={currency}
        hidden={hideAmounts}
        labels={labels}
      />

      <QuickActions
        currency={currency}
        locale={locale}
        showLoansShortcut
        labels={labels}
      />

      <RecentMovements
        items={recentTransactions}
        currency={currency}
        locale={locale}
        hidden={hideAmounts}
        labels={labels}
      />
    </>
  );
}
