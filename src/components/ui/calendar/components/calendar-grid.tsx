"use client";

import React, { useMemo } from "react";
import { buildMarkerMap, getCellVisualState } from "../helpers/cell-state";
import type {
  CalendarDayCell,
  CalendarMarker,
  CalendarMode,
  DateRange,
} from "../types";
import styles from "../styles/calendar-grid.module.css";

interface CalendarGridProps {
  weekdays: string[];
  cells: CalendarDayCell[];
  mode: CalendarMode;
  selectedSingle: Date | null;
  selectedRange: DateRange;
  selectedMultiple: Date[];
  hoverDate: Date | null;
  markedDates?: CalendarMarker[];
  onSelectDay: (date: Date) => void;
  onHoverDay: (date: Date | null) => void;
}

export function CalendarGrid({
  weekdays, cells, mode, selectedSingle, selectedRange, selectedMultiple,
  hoverDate, markedDates, onSelectDay, onHoverDay,
}: CalendarGridProps) {
  const markerMap = useMemo(() => buildMarkerMap(markedDates), [markedDates]);

  return (
    <div className={styles.gridWrapper} onMouseLeave={() => onHoverDay(null)}>
      <div className={styles.weekdaysRow} role="row">
        {weekdays.map((day) => (
          <span key={day} className={styles.weekday}>{day}</span>
        ))}
      </div>

      <div className={styles.daysGrid} role="grid">
        {cells.map((cell) => {
          const v = getCellVisualState({
            date: cell.date, cellKey: cell.key, mode, selectedSingle,
            selectedRange, selectedMultiple, hoverDate, markerMap,
          });
          const cellWrapCls = [
            styles.cellWrap,
            v.isInRange ? styles.inRange : "",
            v.isRangeStart ? styles.rangeStart : "",
            v.isRangeEnd ? styles.rangeEnd : "",
          ].filter(Boolean).join(" ");

          const dayBtnCls = [
            styles.dayBtn,
            !cell.inCurrentMonth ? styles.outsideMonth : "",
            cell.isToday ? styles.today : "",
            v.isSelected ? styles.selected : "",
          ].filter(Boolean).join(" ");

          return (
            <div key={cell.key} className={cellWrapCls}>
              <button
                type="button"
                disabled={cell.isDisabled}
                onClick={() => onSelectDay(cell.date)}
                onMouseEnter={() => mode === "range" && !cell.isDisabled && onHoverDay(cell.date)}
                className={dayBtnCls}
                aria-pressed={v.isSelected}
              >
                <span>{cell.dayNumber}</span>
                {v.markerTone && <span className={`${styles.dot} ${styles[`dot_${v.markerTone}`]}`} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
