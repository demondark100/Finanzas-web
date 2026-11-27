"use client";

import React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import type { CalendarLocale } from "../types";
import { getFullMonthTitle } from "../helpers/grid-builder";
import styles from "../styles/calendar.module.css";

interface CalendarHeaderProps {
  viewDate: Date;
  locale: CalendarLocale;
  pickerOpen: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTogglePicker: () => void;
}

export function CalendarHeader({
  viewDate,
  locale,
  pickerOpen,
  onPrevMonth,
  onNextMonth,
  onTogglePicker,
}: CalendarHeaderProps) {
  return (
    <div className={styles.header}>
      <button
        type="button"
        onClick={onPrevMonth}
        className={styles.navBtn}
        aria-label={locale === "en" ? "Previous month" : "Mes anterior"}
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        onClick={onTogglePicker}
        className={styles.titleBtn}
        aria-expanded={pickerOpen}
      >
        <span>{getFullMonthTitle(viewDate, locale)}</span>
        <span className={styles.caret}>
          {pickerOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      <button
        type="button"
        onClick={onNextMonth}
        className={styles.navBtn}
        aria-label={locale === "en" ? "Next month" : "Mes siguiente"}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
