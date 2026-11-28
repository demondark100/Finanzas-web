import type { Locale } from "@/i18n";
import { formatCurrency } from "@/modules/transactions/helpers/formatters";
import type { DebtNotificationItem } from "../types";

export interface WebPushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

/** Construye un resumen compacto de cobros/pagos vencidos o de hoy para Web Push. */
export function buildDuePushPayload(
  items: DebtNotificationItem[],
  currency: string,
  locale: Locale
): WebPushPayload | null {
  if (items.length === 0) return null;

  if (items.length === 1) {
    const item = items[0];
    const amt = formatCurrency(item.entryAmount, currency);
    const title =
      locale === "en"
        ? item.direction === "receivable"
          ? `${item.contactName} owes you ${amt}`
          : `You owe ${item.contactName} ${amt}`
        : item.direction === "receivable"
          ? `${item.contactName} debe pagarte ${amt}`
          : `Debes pagar a ${item.contactName} ${amt}`;
    const body =
      locale === "en"
        ? item.severity === "overdue"
          ? "Payment is overdue. Tap to review."
          : "Payment is due today. Tap to review."
        : item.severity === "overdue"
          ? "El plazo venció. Toca para revisar o registrar el abono."
          : "El plazo vence hoy. Toca para revisar.";

    return {
      title,
      body,
      url: `/deudas/${item.contactId}`,
      tag: `finanzas-due-${item.entryId}`,
    };
  }

  const receivableCount = items.filter((i) => i.direction === "receivable").length;
  const payableCount = items.length - receivableCount;
  const title =
    locale === "en"
      ? `${items.length} due payments to review`
      : `Tienes ${items.length} cobros o pagos pendientes`;
  const body =
    locale === "en"
      ? `To collect: ${receivableCount} · To pay: ${payableCount}. Tap to view.`
      : `Por cobrar: ${receivableCount} · Por pagar: ${payableCount}. Toca para revisar.`;

  return { title, body, url: "/deudas", tag: "finanzas-due-summary" };
}
