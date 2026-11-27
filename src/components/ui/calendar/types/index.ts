export type CalendarMode = "single" | "range" | "multiple";
export type CalendarLocale = "es" | "en";
export type MarkerTone = "primary" | "income" | "expense" | "warning";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface CalendarMarker {
  date: Date;
  tone?: MarkerTone;
}

export interface CalendarPreset {
  id: string;
  label: string;
  range?: DateRange;
  date?: Date;
}

export interface CalendarProps {
  mode?: CalendarMode;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  rangeValue?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  multipleValue?: Date[];
  onMultipleChange?: (dates: Date[]) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  isDateDisabled?: (date: Date) => boolean;
  markedDates?: CalendarMarker[];
  weekStartsOn?: 0 | 1;
  locale?: CalendarLocale;
  showPresets?: boolean;
  presets?: CalendarPreset[];
  showTodayButton?: boolean;
  allowClear?: boolean;
  borderless?: boolean;
  defaultMonth?: Date;
  className?: string;
}

export interface CalendarDayCell {
  date: Date;
  key: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
}
