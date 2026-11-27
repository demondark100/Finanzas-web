"use client";

import React from "react";
import { Search, Users, X } from "lucide-react";
import { DatePicker, type DateRange } from "@/components/ui/calendar";
import type { Dictionary, Locale } from "@/i18n";
import type { MovementPeriod, MovementTypeFilter } from "../../types";
import styles from "./movements-filters.module.css";

interface MovementsFiltersProps {
  typeFilter: MovementTypeFilter;
  period: MovementPeriod;
  includeLoans: boolean;
  customRange: DateRange;
  search: string;
  locale: Locale;
  labels: Dictionary["movements"];
  onTypeChange: (value: MovementTypeFilter) => void;
  onPeriodChange: (value: MovementPeriod) => void;
  onToggleLoans: () => void;
  onCustomRangeChange: (range: DateRange) => void;
  onSearchChange: (value: string) => void;
}

export function MovementsFilters({
  typeFilter, period, includeLoans, customRange, search, locale, labels,
  onTypeChange, onPeriodChange, onToggleLoans, onCustomRangeChange, onSearchChange,
}: MovementsFiltersProps) {
  const typeOptions: { value: MovementTypeFilter; label: string }[] = [
    { value: "ALL", label: labels.all },
    { value: "INCOME", label: labels.incomes },
    { value: "EXPENSE", label: labels.expenses },
  ];

  const periodOptions: { value: MovementPeriod; label: string }[] = [
    { value: "this_month", label: labels.thisMonth },
    { value: "last_month", label: labels.lastMonth },
    { value: "all", label: labels.allTime },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBox}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="search"
          placeholder={labels.searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        {search && (
          <button type="button" onClick={() => onSearchChange("")} className={styles.clearBtn} aria-label="Limpiar">
            <X size={15} />
          </button>
        )}
      </div>

      <div className={styles.chipsRow} role="tablist" aria-label="Tipo">
        {typeOptions.map((opt) => (
          <button key={opt.value} type="button" role="tab" aria-selected={typeFilter === opt.value}
            onClick={() => onTypeChange(opt.value)}
            className={typeFilter === opt.value ? styles.chipActive : styles.chip}>
            {opt.label}
          </button>
        ))}
      </div>

      <div className={styles.periodRow}>
        {periodOptions.map((opt) => (
          <button key={opt.value} type="button" onClick={() => onPeriodChange(opt.value)}
            className={period === opt.value ? styles.periodActive : styles.periodBtn}>
            {opt.label}
          </button>
        ))}
        <button type="button" onClick={onToggleLoans}
          className={includeLoans ? styles.periodActive : styles.periodBtn}>
          <Users size={13} /> {labels.includeLoans}
        </button>
      </div>

      <DatePicker
        mode="range" locale={locale} placeholder={labels.customRangePlaceholder}
        rangeValue={customRange} onRangeChange={onCustomRangeChange}
        maxDate={new Date()} showPresets allowClear
      />
    </div>
  );
}
