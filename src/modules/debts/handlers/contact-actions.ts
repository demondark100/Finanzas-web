"use server";

import { revalidatePath } from "next/cache";
import { normalizeOptionalText, validateContactName } from "../helpers/debt-math";
import { requireUnlockedSession } from "../helpers/session-guard";
import {
  createDebtContact,
  deleteDebtContact,
  updateDebtContact,
} from "../services/debt-contacts-service";
import type { DebtActionResult } from "../types";

export async function createContactAction(formData: FormData): Promise<DebtActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    const name = validateContactName(formData.get("name"));
    if (!name) return { success: false, error: "Ingresa un nombre de al menos 2 letras" };

    const contactId = await createDebtContact({
      userId: auth.userId,
      name,
      phone: normalizeOptionalText(formData.get("phone"), 30),
      note: normalizeOptionalText(formData.get("note"), 100),
    });

    revalidatePath("/deudas");
    return { success: true, contactId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo guardar" };
  }
}

export async function updateContactAction(formData: FormData): Promise<DebtActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    const id = String(formData.get("id") ?? "").trim();
    const name = validateContactName(formData.get("name"));
    if (!id || !name) return { success: false, error: "Ingresa un nombre válido" };

    const ok = await updateDebtContact({
      id,
      userId: auth.userId,
      name,
      phone: normalizeOptionalText(formData.get("phone"), 30),
      note: normalizeOptionalText(formData.get("note"), 100),
    });
    if (!ok) return { success: false, error: "No se encontró la persona" };

    revalidatePath("/deudas");
    revalidatePath(`/deudas/${id}`);
    return { success: true, contactId: id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo actualizar" };
  }
}

export async function deleteContactAction(id: string): Promise<DebtActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!id) return { success: false, error: "Persona inválida" };

    const ok = await deleteDebtContact(id, auth.userId);
    if (!ok) return { success: false, error: "No se encontró la persona" };

    revalidatePath("/deudas");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo eliminar" };
  }
}
