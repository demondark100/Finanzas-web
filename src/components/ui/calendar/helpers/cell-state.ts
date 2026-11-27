import { isAfterDay, isBeforeDay, isBetweenDays, isSameDay, toDateKey } from "./date-utils";
import type { CalendarMarker, CalendarMode, DateRange, MarkerTone } from "../types";

export interface CellVisualState {
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  markerTone: MarkerTone | null;
}

export function buildMarkerMap(markers?: CalendarMarker[]): Map<string, MarkerTone> {
  const map = new Map<string, MarkerTone>();
  markers?.forEach((m) => {
    map.set(toDateKey(m.date), m.tone || "primary");
  });
  return map;
}

export function getCellVisualState(params: {
  date: Date;
  cellKey: string;
  mode: CalendarMode;
  selectedSingle: Date | null;
  selectedRange: DateRange;
  selectedMultiple: Date[];
  hoverDate: Date | null;
  markerMap: Map<string, MarkerTone>;
}): CellVisualState {
  const { date, cellKey, mode, selectedSingle, selectedRange, selectedMultiple, hoverDate, markerMap } = params;
  const markerTone = markerMap.get(cellKey) ?? null;

  if (mode === "single") {
    return {
      isSelected: isSameDay(date, selectedSingle),
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      markerTone,
    };
  }

  if (mode === "multiple") {
    return {
      isSelected: selectedMultiple.some((d) => isSameDay(d, date)),
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      markerTone,
    };
  }

  const { from, to } = selectedRange;
  const effectiveEnd = to ?? (from && hoverDate ? hoverDate : null);
  const swapped = Boolean(from && effectiveEnd && isBeforeDay(effectiveEnd, from));
  const rangeStart = swapped ? effectiveEnd : from;
  const rangeEnd = swapped ? from : effectiveEnd;

  const isRangeStart = isSameDay(date, rangeStart);
  const isRangeEnd = isSameDay(date, rangeEnd);
  const isSingleDayRange = Boolean(rangeStart && rangeEnd && isSameDay(rangeStart, rangeEnd));
  const isInRange = Boolean(
    rangeStart && rangeEnd && !isSingleDayRange &&
    (isBetweenDays(date, rangeStart, rangeEnd) ||
      (isAfterDay(date, rangeStart) && isBeforeDay(date, rangeEnd)))
  );

  return {
    isSelected: isRangeStart || isRangeEnd,
    isRangeStart: isRangeStart && !isSingleDayRange,
    isRangeEnd: isRangeEnd && !isSingleDayRange,
    isInRange,
    markerTone,
  };
}
