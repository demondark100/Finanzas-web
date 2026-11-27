"use server";

import { revalidatePath } from "next/cache";
import { convertToBaseFormatted, getExchangeRates } from "@/lib/currency/exchange-service";
import { validateAmount } from "@/modules/transactions/helpers/validation";
import { getUserCurrency } from "@/modules/transactions/services/transaction-service";
import {
  isValidDebtKind,
  normalizeOptionalText,
  parseDateInput,
} from "../helpers/debt-math";
import { requireUnlockedSession } from "../helpers/session-guard";
import { createDebtEntry } from "../services/debt-entries-service";
import {
  deleteDebtEntryById,
  updateDebtEntryById,
} from "../services/debt-entry-mutations";
import type { DebtActionResult } from "../types";

function revalidateDebtPaths(contactId: string) {
  revalidatePath("/deudas");
  revalidatePath(`/deudas/${contactId}`);
  revalidatePath("/");
}

export async function addDebtEntryAction(formData: FormData): Promise<DebtActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    const contactId = String(formData.get("contactId") ?? "").trim();
    const kind = formData.get("kind");
    if (!contactId || !isValidDebtKind(kind)) {
      return { success: false, error: "Datos del movimiento inválidos" };
    }

    const amountCheck = validateAmount(formData.get("amount"));
    if (!amountCheck.ok) return { success: false, error: amountCheck.error };

    const [currency, rates] = await Promise.all([
      getUserCurrency(auth.userId),
      getExchangeRates(),
    ]);

    const ok = await createDebtEntry({
      userId: auth.userId,
      contactId,
      kind,
      amount: convertToBaseFormatted(amountCheck.numeric, currency, rates),
      note: normalizeOptionalText(formData.get("note"), 100),
      occurredAt: parseDateInput(formData.get("occurredAt"), true) ?? new Date(),
      dueDate: parseDateInput(formData.get("dueDate"), false),
    });

    if (!ok) return { success: false, error: "No se encontró la persona" };
    revalidateDebtPaths(contactId);
    return { success: true, contactId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo guardar" };
  }
}

export async function updateDebtEntryAction(formData: FormData): Promise<DebtActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    const id = String(formData.get("id") ?? "").trim();
    const kind = formData.get("kind");
    if (!id || !isValidDebtKind(kind)) {
      return { success: false, error: "Movimiento inválido" };
    }

    const amountCheck = validateAmount(formData.get("amount"));
    if (!amountCheck.ok) return { success: false, error: amountCheck.error };

    const [currency, rates] = await Promise.all([
      getUserCurrency(auth.userId),
      getExchangeRates(),
    ]);

    const contactId = await updateDebtEntryById({
      id,
      userId: auth.userId,
      kind,
      amount: convertToBaseFormatted(amountCheck.numeric, currency, rates),
      note: normalizeOptionalText(formData.get("note"), 100),
      occurredAt: parseDateInput(formData.get("occurredAt"), true) ?? new Date(),
      dueDate: parseDateInput(formData.get("dueDate"), false),
    });

    if (!contactId) return { success: false, error: "No se encontró el movimiento" };
    revalidateDebtPaths(contactId);
    revalidatePath(`/deudas/${contactId}/${id}`);
    return { success: true, contactId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo actualizar" };
  }
}

export async function deleteDebtEntryAction(id: string): Promise<DebtActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!id) return { success: false, error: "Movimiento inválido" };

    const contactId = await deleteDebtEntryById(id, auth.userId);
    if (!contactId) return { success: false, error: "No se encontró el movimiento" };

    revalidateDebtPaths(contactId);
    return { success: true, contactId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo eliminar" };
  }
}
