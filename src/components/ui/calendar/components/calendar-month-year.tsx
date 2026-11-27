"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarLocale } from "../types";
import { getMonthNames } from "../helpers/grid-builder";
import styles from "../styles/calendar-controls.module.css";

interface CalendarMonthYearProps {
  viewDate: Date;
  locale: CalendarLocale;
  onSelectMonthYear: (year: number, month: number) => void;
}

export function CalendarMonthYear({
  viewDate,
  locale,
  onSelectMonthYear,
}: CalendarMonthYearProps) {
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const months = getMonthNames(locale);

  return (
    <div className={styles.pickerPanel}>
      <div className={styles.yearBar}>
        <button
          type="button"
          className={styles.yearBtn}
          onClick={() => onSelectMonthYear(currentYear - 1, currentMonth)}
          aria-label={locale === "en" ? "Previous year" : "Año anterior"}
        >
          <ChevronLeft size={18} />
        </button>
        <span className={styles.yearLabel}>{currentYear}</span>
        <button
          type="button"
          className={styles.yearBtn}
          onClick={() => onSelectMonthYear(currentYear + 1, currentMonth)}
          aria-label={locale === "en" ? "Next year" : "Año siguiente"}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={styles.monthsGrid}>
        {months.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelectMonthYear(currentYear, idx)}
            className={`${styles.monthBtn} ${idx === currentMonth ? styles.monthActive : ""}`.trim()}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
