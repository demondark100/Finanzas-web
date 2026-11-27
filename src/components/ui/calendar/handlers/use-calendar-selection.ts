"use client";

import { useState } from "react";
import { isBeforeDay, isSameDay, startOfDay } from "../helpers/date-utils";
import type { CalendarMode, CalendarPreset, DateRange } from "../types";

interface UseCalendarSelectionParams {
  mode: CalendarMode;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  rangeValue?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  multipleValue?: Date[];
  onMultipleChange?: (dates: Date[]) => void;
}

export function useCalendarSelection(params: UseCalendarSelectionParams) {
  const { mode, value, onChange, rangeValue, onRangeChange, multipleValue, onMultipleChange } = params;
  const [internalSingle, setInternalSingle] = useState<Date | null>(null);
  const [internalRange, setInternalRange] = useState<DateRange>({ from: null, to: null });
  const [internalMultiple, setInternalMultiple] = useState<Date[]>([]);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const selectedSingle = value !== undefined ? value : internalSingle;
  const selectedRange = rangeValue !== undefined ? rangeValue : internalRange;
  const selectedMultiple = multipleValue !== undefined ? multipleValue : internalMultiple;

  const updateSingle = (d: Date | null) => {
    if (value === undefined) setInternalSingle(d);
    onChange?.(d);
  };

  const updateRange = (next: DateRange) => {
    if (rangeValue === undefined) setInternalRange(next);
    onRangeChange?.(next);
  };

  const updateMultiple = (next: Date[]) => {
    if (multipleValue === undefined) setInternalMultiple(next);
    onMultipleChange?.(next);
  };

  const handleSelectDay = (rawDate: Date) => {
    const date = startOfDay(rawDate);
    if (mode === "single") {
      updateSingle(date);
      return;
    }
    if (mode === "multiple") {
      const exists = selectedMultiple.some((d) => isSameDay(d, date));
      const next = exists
        ? selectedMultiple.filter((d) => !isSameDay(d, date))
        : [...selectedMultiple, date];
      updateMultiple(next);
      return;
    }

    const { from, to } = selectedRange;
    if (!from || (from && to)) {
      updateRange({ from: date, to: null });
      return;
    }
    if (isBeforeDay(date, from)) {
      updateRange({ from: date, to: from });
    } else {
      updateRange({ from, to: date });
    }
    setHoverDate(null);
  };

  const handleApplyPreset = (preset: CalendarPreset) => {
    if (mode === "range" && preset.range) updateRange(preset.range);
    if (mode === "single" && preset.date) updateSingle(startOfDay(preset.date));
  };

  const handleClear = () => {
    setHoverDate(null);
    if (mode === "single") updateSingle(null);
    if (mode === "range") updateRange({ from: null, to: null });
    if (mode === "multiple") updateMultiple([]);
  };

  return {
    selectedSingle,
    selectedRange,
    selectedMultiple,
    hoverDate,
    setHoverDate,
    handleSelectDay,
    handleApplyPreset,
    handleClear,
  };
}
