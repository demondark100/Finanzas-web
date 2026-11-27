"use client";

import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import type { CalendarLocale, CalendarProps, DateRange } from "../types";
import styles from "../styles/date-picker-field.module.css";

interface DatePickerFieldProps extends CalendarProps {
  label?: string;
  placeholder?: string;
  CalendarComponent: React.ComponentType<CalendarProps>;
}

function formatDisplayDate(date: Date, locale: CalendarLocale): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatSummary(
  mode: CalendarProps["mode"],
  value: Date | null | undefined,
  rangeValue: DateRange | undefined,
  multipleValue: Date[] | undefined,
  locale: CalendarLocale,
  placeholder: string
): string {
  if (mode === "range") {
    if (!rangeValue?.from) return placeholder;
    if (!rangeValue.to) return formatDisplayDate(rangeValue.from, locale);
    return `${formatDisplayDate(rangeValue.from, locale)} – ${formatDisplayDate(rangeValue.to, locale)}`;
  }
  if (mode === "multiple") {
    const count = multipleValue?.length ?? 0;
    if (count === 0) return placeholder;
    if (count === 1 && multipleValue?.[0]) return formatDisplayDate(multipleValue[0], locale);
    return locale === "en" ? `${count} dates selected` : `${count} fechas elegidas`;
  }
  return value ? formatDisplayDate(value, locale) : placeholder;
}

export function DatePickerField({
  label,
  placeholder,
  mode = "single",
  locale = "es",
  value,
  onChange,
  rangeValue,
  onRangeChange,
  multipleValue,
  onMultipleChange,
  CalendarComponent,
  ...rest
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const defaultPlaceholder = locale === "en" ? "Select date" : "Elegir fecha";
  const display = formatSummary(
    mode, value, rangeValue, multipleValue, locale, placeholder || defaultPlaceholder
  );
  const hasSelection = Boolean(value || rangeValue?.from || (multipleValue?.length ?? 0) > 0);
  const modalTitle =
    label ||
    (mode === "range"
      ? locale === "en"
        ? "Date range"
        : "Rango de fechas"
      : locale === "en"
        ? "Select date"
        : "Elige una fecha");

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <button type="button" onClick={() => setOpen(true)} className={styles.trigger}>
        <span className={styles.icon} aria-hidden="true">
          <CalendarDays size={18} />
        </span>
        <span className={hasSelection ? styles.valueText : styles.placeholderText}>
          {display}
        </span>
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={modalTitle}>
        {mode === "range" && rangeValue?.from && (
          <div className={styles.rangePreview}>
            <span>{formatDisplayDate(rangeValue.from, locale)}</span>
            <span className={styles.rangeDash}>–</span>
            <span>{rangeValue.to ? formatDisplayDate(rangeValue.to, locale) : "..."}</span>
          </div>
        )}
        <CalendarComponent
          mode={mode}
          locale={locale}
          borderless
          value={value}
          onChange={(d) => {
            onChange?.(d);
            setOpen(false);
          }}
          rangeValue={rangeValue}
          onRangeChange={(r) => {
            onRangeChange?.(r);
            if ((r.from && r.to) || (!r.from && !r.to)) setOpen(false);
          }}
          multipleValue={multipleValue}
          onMultipleChange={onMultipleChange}
          {...rest}
        />
      </Modal>
    </div>
  );
}
