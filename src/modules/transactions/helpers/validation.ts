import type { TransactionType } from "../types";

const MAX_AMOUNT = 999_999_999.99;
const MAX_CONCEPT_LENGTH = 80;

export type AmountValidationResult =
  | { ok: true; formatted: string; numeric: number }
  | { ok: false; error: string };

/**
 * Normaliza y valida el monto ingresado (acepta punto o coma decimal).
 */
export function validateAmount(rawAmount: unknown): AmountValidationResult {
  const raw = String(rawAmount ?? "").trim().replace(",", ".");
  if (!raw || !/^\d+(\.\d{1,2})?$/.test(raw)) {
    return { ok: false, error: "Ingresa un monto válido (ej. 25 o 25.50)" };
  }

  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return { ok: false, error: "El monto debe ser mayor a cero" };
  }

  if (numeric > MAX_AMOUNT) {
    return { ok: false, error: "El monto ingresado es demasiado grande" };
  }

  return { ok: true, formatted: numeric.toFixed(2), numeric };
}

/**
 * Devuelve el concepto limpio o uno por defecto si el usuario no escribió nada.
 */
export function normalizeConcept(
  rawConcept: unknown,
  type: TransactionType
): string {
  const trimmed = String(rawConcept ?? "").trim();
  if (!trimmed) {
    return type === "INCOME" ? "Ingreso" : "Gasto";
  }
  return trimmed.slice(0, MAX_CONCEPT_LENGTH);
}

/**
 * Limpia la categoría opcional del movimiento.
 */
export function normalizeCategory(rawCategory: unknown): string | null {
  const trimmed = String(rawCategory ?? "").trim();
  return trimmed ? trimmed.slice(0, 40) : null;
}
