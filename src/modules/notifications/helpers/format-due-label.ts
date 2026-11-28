import type { Dictionary } from "@/i18n";
import type { NotificationSeverity } from "../types";

/** Construye la etiqueta legible del vencimiento según días restantes o de atraso. */
export function formatDueBadgeText(
  severity: NotificationSeverity,
  daysDiff: number,
  labels: Dictionary["notifications"]
): string {
  if (severity === "overdue") {
    const absDays = Math.abs(daysDiff);
    return absDays === 1
      ? labels.overdueOneDay
      : labels.overdueDays.replace("{days}", String(absDays));
  }
  if (severity === "due_today") return labels.dueToday;
  if (daysDiff === 1) return labels.dueTomorrow;
  return labels.dueInDays.replace("{days}", String(daysDiff));
}
