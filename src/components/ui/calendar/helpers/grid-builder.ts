import type {
  CalendarDayCell,
  CalendarLocale,
  CalendarPreset,
} from "../types";
import { checkDateDisabled, isSameDay, startOfDay, toDateKey } from "./date-utils";

const WEEKDAYS_ES_MON = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const WEEKDAYS_ES_SUN = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const WEEKDAYS_EN_MON = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEKDAYS_EN_SUN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function getWeekdayLabels(locale: CalendarLocale, weekStartsOn: 0 | 1): string[] {
  if (locale === "en") return weekStartsOn === 1 ? WEEKDAYS_EN_MON : WEEKDAYS_EN_SUN;
  return weekStartsOn === 1 ? WEEKDAYS_ES_MON : WEEKDAYS_ES_SUN;
}

export function getMonthNames(locale: CalendarLocale): string[] {
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
    month: "short",
  });
  return Array.from({ length: 12 }, (_, idx) => {
    const raw = fmt.format(new Date(2026, idx, 1)).replace(".", "");
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });
}

export function getFullMonthTitle(date: Date, locale: CalendarLocale): string {
  const raw = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-PE", {
    month: "long",
    year: "numeric",
  }).format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function buildMonthGrid(params: {
  viewDate: Date;
  weekStartsOn: 0 | 1;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  isDateDisabled?: (d: Date) => boolean;
}): CalendarDayCell[] {
  const { viewDate, weekStartsOn, minDate, maxDate, disabledDates, isDateDisabled } = params;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() - weekStartsOn + 7) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  const today = startOfDay(new Date());

  return Array.from({ length: 42 }, (_, idx) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + idx);
    return {
      date,
      key: toDateKey(date),
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isDisabled: checkDateDisabled(date, minDate, maxDate, disabledDates, isDateDisabled),
    };
  });
}

export function getDefaultRangePresets(locale: CalendarLocale): CalendarPreset[] {
  const now = startOfDay(new Date());
  const sevenAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return [
    { id: "today", label: locale === "en" ? "Today" : "Hoy", range: { from: now, to: now } },
    { id: "last7", label: locale === "en" ? "Last 7 days" : "7 días", range: { from: sevenAgo, to: now } },
    { id: "thisMonth", label: locale === "en" ? "This month" : "Este mes", range: { from: monthStart, to: now } },
    { id: "lastMonth", label: locale === "en" ? "Last month" : "Mes pasado", range: { from: prevStart, to: prevEnd } },
  ];
}
