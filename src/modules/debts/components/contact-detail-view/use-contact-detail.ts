"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "@/components/ui/calendar";
import type { DebtEntryItem } from "../../types";

export function useContactDetailFilter(entries: DebtEntryItem[]) {
  const [period, setPeriod] = useState<"all" | "this_month" | "custom">("all");
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return entries.filter((e) => {
      const t = new Date(e.occurredAt).getTime();
      if (period === "this_month") return t >= monthStart;
      if (period === "custom" && range.from && range.to) {
        const start = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()).getTime();
        const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate() + 1).getTime();
        return t >= start && t < end;
      }
      return true;
    });
  }, [entries, period, range]);

  const stats = useMemo(() => {
    let lent = 0, repaidIn = 0, borrowed = 0, repaidOut = 0;
    for (const e of filteredEntries) {
      if (e.kind === "LENT") lent += e.amount;
      else if (e.kind === "REPAYMENT_RECEIVED") repaidIn += e.amount;
      else if (e.kind === "BORROWED") borrowed += e.amount;
      else if (e.kind === "REPAYMENT_PAID") repaidOut += e.amount;
    }
    return {
      netBalance: Number((lent - repaidIn - borrowed + repaidOut).toFixed(2)),
      lent, repaidIn, borrowed, repaidOut,
    };
  }, [filteredEntries]);

  const selectedSum = useMemo(
    () => filteredEntries.filter((e) => selectedIds.includes(e.id)).reduce((acc, e) => acc + e.amount, 0),
    [filteredEntries, selectedIds]
  );

  const toggleId = (id: string) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return {
    period, setPeriod, range, setRange, selectMode, setSelectMode,
    selectedIds, setSelectedIds, filteredEntries, stats, selectedSum, toggleId,
  };
}
