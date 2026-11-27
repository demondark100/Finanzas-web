"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { DatePicker } from "@/components/ui/calendar";
import { SelectionSumBar } from "@/components/ui/selection-sum-bar";
import { Toast } from "@/components/ui/toast";
import type { Dictionary, Locale } from "@/i18n";
import { formatCurrency } from "@/modules/transactions/helpers/formatters";
import type { DebtContactSummary, DebtEntryItem, DebtEntryKind } from "../../types";
import { ContactFormModal } from "../contact-form-modal";
import { DebtEntryModal } from "../debt-entry-modal";
import { ContactAccountCard } from "./contact-account-card";
import { ContactEntriesList } from "./contact-entries-list";
import { useContactDetailFilter } from "./use-contact-detail";
import styles from "./contact-detail-view.module.css";

interface ContactDetailViewProps {
  contact: DebtContactSummary;
  entries: DebtEntryItem[];
  currency: string;
  locale: Locale;
  labels: Dictionary["debts"];
  movLabels: Dictionary["movements"];
  savingText: string;
}

export function ContactDetailView({
  contact, entries, currency, locale, labels, movLabels, savingText,
}: ContactDetailViewProps) {
  const router = useRouter();
  const f = useContactDetailFilter(entries);
  const [entryModal, setEntryModal] = useState<{ open: boolean; kind: DebtEntryKind }>({ open: false, kind: "LENT" });
  const [editPersonOpen, setEditPersonOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const openCreate = (kind: DebtEntryKind) => setEntryModal({ open: true, kind });

  return (
    <>
      <div className={styles.topBar}>
        <Link href="/deudas" className={styles.backBtn}><ArrowLeft size={16} /> {labels.backToList}</Link>
        <button type="button" onClick={() => setEditPersonOpen(true)} className={styles.editBtn}>{labels.editPersonBtn}</button>
      </div>

      <ContactAccountCard
        contact={contact} netBalance={f.stats.netBalance}
        totalLent={f.stats.lent} totalRepaidIn={f.stats.repaidIn}
        totalBorrowed={f.stats.borrowed} totalRepaidOut={f.stats.repaidOut}
        currency={currency} labels={labels} onCopied={() => setToastMsg(labels.summaryCopied)}
      />

      <div className={styles.actionsGrid}>
        <button type="button" onClick={() => openCreate("LENT")} className={`${styles.actionBtn} ${styles.btnLent}`}><ArrowUpRight size={16} /> {labels.kindLent}</button>
        <button type="button" onClick={() => openCreate("REPAYMENT_RECEIVED")} className={`${styles.actionBtn} ${styles.btnPayIn}`}><Check size={16} /> {labels.kindRepaymentReceived}</button>
        <button type="button" onClick={() => openCreate("BORROWED")} className={`${styles.actionBtn} ${styles.btnBorrowed}`}><ArrowDownLeft size={16} /> {labels.kindBorrowed}</button>
        <button type="button" onClick={() => openCreate("REPAYMENT_PAID")} className={`${styles.actionBtn} ${styles.btnPayOut}`}><Check size={16} /> {labels.kindRepaymentPaid}</button>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.periodRow}>
          <button type="button" onClick={() => { f.setPeriod("all"); f.setRange({ from: null, to: null }); f.setSelectedIds([]); }}
            className={f.period === "all" ? styles.periodActive : styles.periodBtn}>{labels.periodAll}</button>
          <button type="button" onClick={() => { f.setPeriod("this_month"); f.setRange({ from: null, to: null }); f.setSelectedIds([]); }}
            className={f.period === "this_month" ? styles.periodActive : styles.periodBtn}>{labels.periodThisMonth}</button>
        </div>
        <DatePicker mode="range" locale={locale} placeholder={labels.periodRangePlaceholder}
          rangeValue={f.period === "custom" ? f.range : { from: null, to: null }}
          onRangeChange={(r) => { f.setRange(r); f.setSelectedIds([]); f.setPeriod(!r.from && !r.to ? "all" : "custom"); }}
          maxDate={new Date()} showPresets allowClear />
      </div>

      <ContactEntriesList
        contactId={contact.id} entries={f.filteredEntries} currency={currency} locale={locale}
        labels={labels} movLabels={movLabels} selectMode={f.selectMode} selectedIds={f.selectedIds}
        onToggleMode={() => { f.setSelectMode((s) => !s); f.setSelectedIds([]); }} onToggleSelect={f.toggleId}
      />

      <DebtEntryModal isOpen={entryModal.open} contactId={contact.id} initialKind={entryModal.kind}
        currency={currency} locale={locale} labels={labels} movLabels={movLabels} savingText={savingText}
        onClose={() => setEntryModal((s) => ({ ...s, open: false }))}
        onSuccess={() => { setEntryModal((s) => ({ ...s, open: false })); setToastMsg(labels.entrySaved); router.refresh(); }} />

      <ContactFormModal isOpen={editPersonOpen} editingContact={contact} labels={labels} movLabels={movLabels}
        savingText={savingText} onClose={() => setEditPersonOpen(false)}
        onSaved={() => { setEditPersonOpen(false); router.refresh(); }}
        onDeleted={() => { setEditPersonOpen(false); router.push("/deudas"); }} />

      {f.selectMode && (
        <SelectionSumBar count={f.selectedIds.length} totalFormatted={formatCurrency(f.selectedSum, currency)}
          countLabel={movLabels.selectedCount} totalLabel={movLabels.selectedTotal}
          clearLabel={movLabels.clearSelection} doneLabel={movLabels.cancelSelect}
          onClear={() => f.setSelectedIds([])} onDone={() => { f.setSelectMode(false); f.setSelectedIds([]); }} />
      )}
      <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />
    </>
  );
}
