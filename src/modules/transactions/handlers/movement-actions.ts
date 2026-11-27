"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { convertToBaseFormatted, getExchangeRates } from "@/lib/currency/exchange-service";
import { getSession } from "@/modules/auth/services/session-service";
import { getUserCurrency } from "../services/transaction-service";
import {
  normalizeCategory,
  normalizeConcept,
  validateAmount,
} from "../helpers/validation";
import {
  deleteTransactionById,
  updateTransactionById,
} from "../services/transaction-history-service";
import type { TransactionActionResult, TransactionType } from "../types";

async function requireUnlockedUser(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session?.userId) {
    return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };
  }
  const cookieStore = await cookies();
  if (cookieStore.get("finanzas_locked")?.value === "true") {
    return { ok: false, error: "Desbloquea la app con tu PIN primero." };
  }
  return { ok: true, userId: session.userId };
}

export async function updateTransactionAction(
  formData: FormData
): Promise<TransactionActionResult> {
  try {
    const auth = await requireUnlockedUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const id = String(formData.get("id") ?? "").trim();
    const rawType = String(formData.get("type") ?? "").trim();
    if (!id || (rawType !== "INCOME" && rawType !== "EXPENSE")) {
      return { success: false, error: "Movimiento inválido" };
    }

    const type: TransactionType = rawType;
    const amountCheck = validateAmount(formData.get("amount"));
    if (!amountCheck.ok) return { success: false, error: amountCheck.error };

    const [currency, rates] = await Promise.all([
      getUserCurrency(auth.userId),
      getExchangeRates(),
    ]);

    const updated = await updateTransactionById({
      id,
      userId: auth.userId,
      type,
      amount: convertToBaseFormatted(amountCheck.numeric, currency, rates),
      concept: normalizeConcept(formData.get("concept"), type),
      category: normalizeCategory(formData.get("category")),
    });

    if (!updated) return { success: false, error: "No se encontró el movimiento" };

    revalidatePath("/");
    revalidatePath("/movimientos");
    revalidatePath(`/movimientos/${id}`);
    return { success: true, transaction: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo actualizar";
    return { success: false, error: message };
  }
}

export async function deleteTransactionAction(
  id: string
): Promise<TransactionActionResult> {
  try {
    const auth = await requireUnlockedUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const cleanId = String(id ?? "").trim();
    if (!cleanId) return { success: false, error: "Movimiento inválido" };

    const deleted = await deleteTransactionById(cleanId, auth.userId);
    if (!deleted) return { success: false, error: "No se encontró el movimiento" };

    revalidatePath("/");
    revalidatePath("/movimientos");
    revalidatePath(`/movimientos/${id}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo eliminar";
    return { success: false, error: message };
  }
}
