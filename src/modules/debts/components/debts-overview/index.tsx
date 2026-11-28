"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";
import { NotificationBell } from "@/modules/notifications";
import { formatCurrency } from "@/modules/transactions/helpers/formatters";
import type { DebtContactFilter, DebtContactSummary } from "../../types";
import { ContactFormModal } from "../contact-form-modal";
import { ContactCard } from "./contact-card";
import { GlobalSummaryCard } from "./global-summary-card";
import styles from "./debts-overview.module.css";

interface DebtsOverviewProps {
  contacts: DebtContactSummary[];
  totalReceivable: number;
  totalPayable: number;
  currency: string;
  labels: Dictionary["debts"];
  movLabels: Dictionary["movements"];
  savingText: string;
  bellLabel?: string;
}

export function DebtsOverview({
  contacts, totalReceivable, totalPayable, currency, labels, movLabels, savingText, bellLabel,
}: DebtsOverviewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<DebtContactFilter>("ALL");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filter === "RECEIVABLE" && c.netBalance <= 0) return false;
      if (filter === "PAYABLE" && c.netBalance >= 0) return false;
      if (filter === "SETTLED" && c.netBalance !== 0) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [contacts, filter, search]);

  const filterOptions: { value: DebtContactFilter; label: string }[] = [
    { value: "ALL", label: labels.filterAll },
    { value: "RECEIVABLE", label: labels.filterReceivable },
    { value: "PAYABLE", label: labels.filterPayable },
    { value: "SETTLED", label: labels.filterSettled },
  ];

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{labels.title}</h1>
          <p className={styles.subtitle}>{labels.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          {bellLabel && <NotificationBell label={bellLabel} />}
          <Button type="button" onClick={() => setModalOpen(true)} className={styles.addBtn}>
            {labels.newPerson}
          </Button>
        </div>
      </header>

      <GlobalSummaryCard
        totalReceivable={totalReceivable}
        totalPayable={totalPayable}
        currency={currency}
        labels={labels}
      />

      <div className={styles.controls}>
        <div className={styles.chipsRow}>
          {filterOptions.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setFilter(opt.value)}
              className={filter === opt.value ? styles.chipActive : styles.chip}>
              {opt.label}
            </button>
          ))}
        </div>
        <Input type="search" placeholder={labels.searchPerson} value={search} onChange={(e) => setSearch(e.target.value)} clearable />
      </div>

      {filtered.length === 0 ? (
        <Card className={styles.emptyCard}>
          <div className={styles.emptyIcon}><Users size={32} /></div>
          <h3 className={styles.emptyTitle}>{contacts.length === 0 ? labels.emptyTitle : labels.noMatchesTitle}</h3>
          <p className={styles.emptyDesc}>{contacts.length === 0 ? labels.emptyDesc : labels.noMatchesDesc}</p>
        </Card>
      ) : (
        <div className={styles.list}>
          {filtered.map((c) => <ContactCard key={c.id} contact={c} currency={currency} labels={labels} />)}
        </div>
      )}

      <ContactFormModal
        isOpen={modalOpen} labels={labels} movLabels={movLabels} savingText={savingText}
        onClose={() => setModalOpen(false)}
        onSaved={(id) => { setModalOpen(false); if (id) router.push(`/deudas/${id}`); else router.refresh(); }}
      />
    </>
  );
}
