import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Dictionary } from "@/i18n";
import { formatCurrency } from "@/modules/transactions/helpers/formatters";
import type { DebtContactSummary } from "../../types";
import styles from "./debts-overview.module.css";

interface ContactCardProps {
  contact: DebtContactSummary;
  currency: string;
  labels: Dictionary["debts"];
}

export function ContactCard({ contact, currency, labels }: ContactCardProps) {
  const net = contact.netBalance;
  const statusClass =
    net > 0 ? styles.receivableAmt : net < 0 ? styles.payableAmt : styles.settledVal;
  const subLabel =
    net > 0 ? labels.owesYou : net < 0 ? labels.youOwe : labels.settled;

  return (
    <Link href={`/deudas/${contact.id}`} className={styles.personCard}>
      <div className={styles.personLeft}>
        <span
          className={`${styles.avatar} ${net > 0 ? styles.avatarIn : net < 0 ? styles.avatarOut : ""}`.trim()}
        >
          {contact.name.charAt(0).toUpperCase()}
        </span>
        <div className={styles.personMeta}>
          <span className={styles.personName}>{contact.name}</span>
          {contact.note && <span className={styles.personNote}>{contact.note}</span>}
        </div>
      </div>
      <div className={styles.personRight}>
        <div className={styles.balanceStack}>
          <span className={styles.balanceHint}>{subLabel}</span>
          {net !== 0 && (
            <span className={`${styles.personBalance} ${statusClass}`}>
              {formatCurrency(Math.abs(net), currency)}
            </span>
          )}
        </div>
        <span className={styles.chevron}><ChevronRight size={18} /></span>
      </div>
    </Link>
  );
}
