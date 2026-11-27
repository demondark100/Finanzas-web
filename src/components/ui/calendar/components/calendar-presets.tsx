"use client";

import React from "react";
import { isSameDay } from "../helpers/date-utils";
import type { CalendarMode, CalendarPreset, DateRange } from "../types";
import styles from "../styles/calendar-controls.module.css";

interface CalendarPresetsProps {
  presets: CalendarPreset[];
  mode: CalendarMode;
  selectedSingle: Date | null;
  selectedRange: DateRange;
  onApply: (preset: CalendarPreset) => void;
}

export function CalendarPresets({
  presets,
  mode,
  selectedSingle,
  selectedRange,
  onApply,
}: CalendarPresetsProps) {
  if (presets.length === 0) return null;

  return (
    <div className={styles.presetsRow}>
      {presets.map((preset) => {
        const isActive =
          mode === "range" && preset.range
            ? isSameDay(selectedRange.from, preset.range.from) &&
              isSameDay(selectedRange.to, preset.range.to)
            : mode === "single" && preset.date
              ? isSameDay(selectedSingle, preset.date)
              : false;

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApply(preset)}
            className={`${styles.presetChip} ${isActive ? styles.presetActive : ""}`.trim()}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
