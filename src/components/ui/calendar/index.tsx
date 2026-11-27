"use client";

import React, { useMemo, useState } from "react";
import { CalendarGrid } from "./components/calendar-grid";
import { CalendarHeader } from "./components/calendar-header";
import { CalendarMonthYear } from "./components/calendar-month-year";
import { CalendarPresets } from "./components/calendar-presets";
import { DatePickerField } from "./components/date-picker-field";
import { useCalendarSelection } from "./handlers/use-calendar-selection";
import { addMonths, startOfDay } from "./helpers/date-utils";
import { buildMonthGrid, getDefaultRangePresets, getWeekdayLabels } from "./helpers/grid-builder";
import type { CalendarProps } from "./types";
import styles from "./styles/calendar.module.css";

export * from "./types";

export function Calendar(props: CalendarProps) {
  const {
    mode = "single", value, onChange, rangeValue, onRangeChange,
    multipleValue, onMultipleChange, minDate, maxDate, disabledDates,
    isDateDisabled, markedDates, weekStartsOn = 1, locale = "es",
    showPresets = mode === "range", presets,
    showTodayButton = !(mode === "range" && showPresets),
    allowClear = false, borderless = false, defaultMonth, className = "",
  } = props;

  const anchor = defaultMonth || value || rangeValue?.from || new Date();
  const [viewDate, setViewDate] = useState(() => new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const [pickerOpen, setPickerOpen] = useState(false);

  const selection = useCalendarSelection({
    mode, value, onChange, rangeValue, onRangeChange, multipleValue, onMultipleChange,
  });

  const weekdays = useMemo(() => getWeekdayLabels(locale, weekStartsOn), [locale, weekStartsOn]);
  const cells = useMemo(
    () => buildMonthGrid({ viewDate, weekStartsOn, minDate, maxDate, disabledDates, isDateDisabled }),
    [viewDate, weekStartsOn, minDate, maxDate, disabledDates, isDateDisabled]
  );
  const activePresets = useMemo(
    () => presets ?? (showPresets && mode === "range" ? getDefaultRangePresets(locale) : []),
    [presets, showPresets, mode, locale]
  );

  const handleGoToday = () => {
    const today = startOfDay(new Date());
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setPickerOpen(false);
    if (mode === "single") selection.handleSelectDay(today);
  };

  const hasValue = Boolean(
    selection.selectedSingle || selection.selectedRange.from || selection.selectedMultiple.length
  );

  return (
    <div className={`${styles.calendar} ${borderless ? styles.borderless : ""} ${className}`.trim()}>
      <CalendarHeader
        viewDate={viewDate} locale={locale} pickerOpen={pickerOpen}
        onPrevMonth={() => setViewDate((d) => addMonths(d, -1))}
        onNextMonth={() => setViewDate((d) => addMonths(d, 1))}
        onTogglePicker={() => setPickerOpen((o) => !o)}
      />

      {!pickerOpen && activePresets.length > 0 && (
        <CalendarPresets
          presets={activePresets} mode={mode}
          selectedSingle={selection.selectedSingle} selectedRange={selection.selectedRange}
          onApply={(p) => {
            selection.handleApplyPreset(p);
            const target = p.range?.from || p.date;
            if (target) setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
          }}
        />
      )}

      {pickerOpen ? (
        <CalendarMonthYear
          viewDate={viewDate} locale={locale}
          onSelectMonthYear={(y, m) => { setViewDate(new Date(y, m, 1)); setPickerOpen(false); }}
        />
      ) : (
        <CalendarGrid
          weekdays={weekdays} cells={cells} mode={mode} markedDates={markedDates}
          selectedSingle={selection.selectedSingle} selectedRange={selection.selectedRange}
          selectedMultiple={selection.selectedMultiple} hoverDate={selection.hoverDate}
          onSelectDay={selection.handleSelectDay} onHoverDay={selection.setHoverDate}
        />
      )}

      {(showTodayButton || (allowClear && hasValue)) && (
        <div className={styles.footer}>
          {showTodayButton && (
            <button type="button" onClick={handleGoToday} className={styles.footerBtn}>
              {locale === "en" ? "Today" : "Hoy"}
            </button>
          )}
          {allowClear && hasValue && (
            <button type="button" onClick={selection.handleClear} className={styles.clearBtn}>
              {locale === "en" ? "Clear" : "Limpiar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function DatePicker(props: Omit<React.ComponentProps<typeof DatePickerField>, "CalendarComponent">) {
  return <DatePickerField {...props} CalendarComponent={Calendar} />;
}
