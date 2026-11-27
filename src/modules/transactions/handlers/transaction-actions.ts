"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { convertToBaseFormatted, getExchangeRates } from "@/lib/currency/exchange-service";
import { getSession } from "@/modules/auth/services/session-service";
import {
  normalizeCategory,
  normalizeConcept,
  validateAmount,
} from "../helpers/validation";
import { toIsoDateParam } from "../helpers/formatters";
import { createTransaction, getUserCurrency } from "../services/transaction-service";
import type { TransactionActionResult, TransactionType } from "../types";

function parseOptionalOccurredAt(raw: FormDataEntryValue | null): Date | undefined {
  const str = String(raw ?? "").trim();
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return undefined;
  if (str === toIsoDateParam(new Date())) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

async function handleCreateTransaction(
  type: TransactionType,
  formData: FormData
): Promise<TransactionActionResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Tu sesión expiró. Vuelve a ingresar." };
    }

    const cookieStore = await cookies();
    if (cookieStore.get("finanzas_locked")?.value === "true") {
      return { success: false, error: "Desbloquea la app con tu PIN primero." };
    }

    const amountCheck = validateAmount(formData.get("amount"));
    if (!amountCheck.ok) {
      return { success: false, error: amountCheck.error };
    }

    const concept = normalizeConcept(formData.get("concept"), type);
    const category = normalizeCategory(formData.get("category"));
    const occurredAt = parseOptionalOccurredAt(formData.get("occurredAt"));
    const [currency, rates] = await Promise.all([
      getUserCurrency(session.userId),
      getExchangeRates(),
    ]);

    const transaction = await createTransaction({
      userId: session.userId,
      type,
      amount: convertToBaseFormatted(amountCheck.numeric, currency, rates),
      concept,
      category,
      occurredAt,
    });

    revalidatePath("/");
    revalidatePath("/movimientos");

    return { success: true, transaction };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "No se pudo guardar el movimiento";
    return { success: false, error: message };
  }
}

export async function addIncomeAction(
  formData: FormData
): Promise<TransactionActionResult> {
  return handleCreateTransaction("INCOME", formData);
}

export async function addExpenseAction(
  formData: FormData
): Promise<TransactionActionResult> {
  return handleCreateTransaction("EXPENSE", formData);
}
