"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/i18n";
import { formatCurrency } from "@/modules/transactions/helpers/formatters";
import type { DebtContactSummary } from "../../types";
import styles from "./contact-account-card.module.css";

interface ContactAccountCardProps {
  contact: DebtContactSummary;
  netBalance: number;
  totalLent: number;
  totalRepaidIn: number;
  totalBorrowed: number;
  totalRepaidOut: number;
  currency: string;
  labels: Dictionary["debts"];
  onCopied: () => void;
}

export function ContactAccountCard({
  contact, netBalance, totalLent, totalRepaidIn, totalBorrowed, totalRepaidOut,
  currency, labels, onCopied,
}: ContactAccountCardProps) {
  const statusLabel = netBalance > 0 ? labels.owesYou : netBalance < 0 ? labels.youOwe : labels.settled;
  const pct = totalLent > 0 ? Math.min(100, Math.round((totalRepaidIn / totalLent) * 100)) : 0;

  const handleShare = async () => {
    const lines = [
      `*${contact.name}* — ${statusLabel}: ${formatCurrency(Math.abs(netBalance), currency)}`,
      ...(totalLent > 0 || totalRepaidIn > 0
        ? [`• ${labels.breakdownLent}: ${formatCurrency(totalLent, currency)} | ${labels.breakdownReceived}: ${formatCurrency(totalRepaidIn, currency)}`]
        : []),
      ...(totalBorrowed > 0 || totalRepaidOut > 0
        ? [`• ${labels.breakdownBorrowed}: ${formatCurrency(totalBorrowed, currency)} | ${labels.breakdownPaid}: ${formatCurrency(totalRepaidOut, currency)}`]
        : []),
    ];
    const text = lines.join("\n");
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: contact.name, text }); return; } catch { /* fallback */ }
    }
    await navigator.clipboard?.writeText(text);
    onCopied();
  };

  return (
    <Card className={styles.balanceCard}>
      <div className={`${styles.avatarLg} ${netBalance > 0 ? styles.avatarIn : netBalance < 0 ? styles.avatarOut : ""}`}>
        {contact.name.charAt(0).toUpperCase()}
      </div>
      <h1 className={styles.personTitle}>{contact.name}</h1>
      {contact.note && <p className={styles.personNote}>{contact.note}</p>}
      <span className={`${styles.statusPill} ${netBalance > 0 ? styles.pillIn : netBalance < 0 ? styles.pillOut : ""}`}>{statusLabel}</span>
      <h2 className={`${styles.netAmount} ${netBalance > 0 ? styles.positive : netBalance < 0 ? styles.negative : ""}`}>
        {formatCurrency(Math.abs(netBalance), currency)}
      </h2>

      {(totalLent > 0 || totalRepaidIn > 0 || totalBorrowed > 0 || totalRepaidOut > 0) && (
        <div className={styles.breakdownGrid}>
          {(totalLent > 0 || totalRepaidIn > 0) && (
            <>
              <div className={styles.statBox}><span>{labels.breakdownLent}</span><strong>{formatCurrency(totalLent, currency)}</strong></div>
              <div className={styles.statBox}><span>{labels.breakdownReceived}</span><strong className={styles.positive}>{formatCurrency(totalRepaidIn, currency)}</strong></div>
            </>
          )}
          {(totalBorrowed > 0 || totalRepaidOut > 0) && (
            <>
              <div className={styles.statBox}><span>{labels.breakdownBorrowed}</span><strong className={styles.negative}>{formatCurrency(totalBorrowed, currency)}</strong></div>
              <div className={styles.statBox}><span>{labels.breakdownPaid}</span><strong>{formatCurrency(totalRepaidOut, currency)}</strong></div>
            </>
          )}
        </div>
      )}

      {totalLent > 0 && (
        <div className={styles.progressWrap}>
          <progress className={styles.progressBar} value={Math.min(totalRepaidIn, totalLent)} max={totalLent} />
          <span className={styles.progressLabel}>{pct}% {labels.paidProgress}</span>
        </div>
      )}

      <button type="button" onClick={handleShare} className={styles.shareBtn}>
        <Share2 size={14} /> {labels.shareSummary}
      </button>
    </Card>
  );
}
