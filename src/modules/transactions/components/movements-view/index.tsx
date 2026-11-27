"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionSumBar } from "@/components/ui/selection-sum-bar";
import { Toast } from "@/components/ui/toast";
import type { DateRange } from "@/components/ui/calendar";
import type { Dictionary, Locale } from "@/i18n";
import { formatCurrency, parseIsoDateParam, toIsoDateParam } from "../../helpers/formatters";
import type { MovementDateRangeInput, MovementPeriod, MovementTypeFilter, TransactionItem } from "../../types";
import { MovementList } from "../movement-list";
import { MovementsFilters } from "../movements-filters";
import { MovementsSummaryCard } from "../movements-summary-card";
import { TransactionModal } from "../transaction-modal";
import styles from "./movements-view.module.css";

interface MovementsViewProps {
  items: TransactionItem[];
  currency: string;
  period: MovementPeriod;
  includeLoans?: boolean;
  customRangeInput?: MovementDateRangeInput;
  locale?: Locale;
  labels: Dictionary["movements"];
  homeLabels: Dictionary["home"];
}

export function MovementsView({
  items, currency, period, includeLoans = false, customRangeInput, locale = "es", labels, homeLabels,
}: MovementsViewProps) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<MovementTypeFilter>("ALL");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [draftRange, setDraftRange] = useState<DateRange>(() => ({
    from: parseIsoDateParam(customRangeInput?.from), to: parseIsoDateParam(customRangeInput?.to),
  }));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => (typeFilter === "ALL" || i.type === typeFilter) && (!q || i.concept.toLowerCase().includes(q)));
  }, [items, typeFilter, search]);

  const selectedSum = useMemo(() => {
    const chosen = filtered.filter((i) => selectedIds.includes(i.id));
    if (chosen.length === 0) return 0;
    if (chosen.every((i) => i.type === chosen[0].type)) return chosen.reduce((a, i) => a + i.amount, 0);
    return chosen.reduce((a, i) => (i.type === "INCOME" ? a + i.amount : a - i.amount), 0);
  }, [filtered, selectedIds]);

  const buildUrl = (nextPeriod: MovementPeriod, nextRange: DateRange, nextLoans: boolean) => {
    const q = new URLSearchParams();
    if (nextPeriod !== "this_month") q.set("period", nextPeriod);
    if (nextPeriod === "custom" && nextRange.from && nextRange.to) {
      q.set("from", toIsoDateParam(nextRange.from)); q.set("to", toIsoDateParam(nextRange.to));
    }
    if (nextLoans) q.set("loans", "1");
    return q.toString() ? `/movimientos?${q.toString()}` : "/movimientos";
  };

  const handlePeriodChange = (next: MovementPeriod) => {
    setDraftRange({ from: null, to: null }); setSelectedIds([]);
    router.replace(buildUrl(next, { from: null, to: null }, includeLoans));
  };
  const handleCustomRange = (range: DateRange) => {
    setDraftRange(range); setSelectedIds([]);
    if (!range.from && !range.to) return router.replace(buildUrl("this_month", { from: null, to: null }, includeLoans));
    if (range.from && range.to) router.replace(buildUrl("custom", range, includeLoans));
  };

  const activeRange: DateRange = period === "custom" && !draftRange.from
    ? { from: parseIsoDateParam(customRangeInput?.from), to: parseIsoDateParam(customRangeInput?.to) }
    : draftRange;

  const toggleId = (id: string) => setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const countWord = filtered.length === 1 ? labels.singleCountLabel : labels.countLabel;

  return (
    <>
      <header className={styles.header}>
        <div><h1 className={styles.title}>{labels.title}</h1><p className={styles.subtitle}>{labels.subtitle}</p></div>
        <Button type="button" onClick={() => setAddOpen(true)} className={styles.addBtn}>
          <Plus size={16} /> {labels.newMovement.replace(/^\+\s*/, "")}
        </Button>
      </header>
      <MovementsFilters
        typeFilter={typeFilter} period={period} includeLoans={includeLoans} customRange={activeRange} search={search} locale={locale} labels={labels}
        onTypeChange={(v) => { setTypeFilter(v); setSelectedIds([]); }} onPeriodChange={handlePeriodChange}
        onToggleLoans={() => router.replace(buildUrl(period, activeRange, !includeLoans))}
        onCustomRangeChange={handleCustomRange} onSearchChange={(q) => { setSearch(q); setSelectedIds([]); }}
      />
      <MovementsSummaryCard items={filtered} typeFilter={typeFilter} search={search} currency={currency} labels={labels} />
      {filtered.length > 0 && (
        <div className={styles.toolbarRow}>
          <span className={styles.summaryCount}>{filtered.length} {countWord}</span>
          <button type="button" onClick={() => { setSelectMode((s) => !s); setSelectedIds([]); }}
            className={selectMode ? styles.sumBtnActive : styles.sumBtn}>
            <Calculator size={14} /> {selectMode ? labels.cancelSelect : labels.selectToSum}
          </button>
        </div>
      )}
      <MovementList items={filtered} hasAnyInPeriod={items.length > 0} currency={currency} locale={locale}
        labels={labels} selectMode={selectMode} selectedIds={selectedIds} onToggleSelect={toggleId} />
      <TransactionModal type={addOpen ? "EXPENSE" : null} currency={currency} locale={locale} labels={homeLabels}
        onClose={() => setAddOpen(false)}
        onSuccess={(t) => { setAddOpen(false); setToastMsg(t === "INCOME" ? homeLabels.incomeSaved : homeLabels.expenseSaved); router.refresh(); }} />
      {selectMode && (
        <SelectionSumBar count={selectedIds.length} totalFormatted={formatCurrency(selectedSum, currency)}
          isNegative={selectedSum < 0} countLabel={labels.selectedCount} totalLabel={labels.selectedTotal}
          clearLabel={labels.clearSelection} doneLabel={labels.cancelSelect}
          onClear={() => setSelectedIds([])} onDone={() => { setSelectMode(false); setSelectedIds([]); }} />
      )}
      <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />
    </>
  );
}
