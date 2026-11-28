"use server";

import { revalidatePath } from "next/cache";
import { requireUnlockedSession } from "@/modules/debts/helpers/session-guard";
import {
  dismissAllDueNotifications,
  dismissDebtNotification,
  snoozeDebtNotification,
} from "../services/notification-state-service";
import type { NotificationActionResult } from "../types";

function revalidateNotificationViews() {
  revalidatePath("/", "layout");
  revalidatePath("/deudas");
}

export async function dismissNotificationAction(
  entryId: string
): Promise<NotificationActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!entryId) return { success: false, error: "Notificación inválida" };

    const ok = await dismissDebtNotification(auth.userId, entryId);
    if (!ok) return { success: false, error: "No se encontró el registro" };

    revalidateNotificationViews();
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo descartar",
    };
  }
}

export async function snoozeNotificationAction(
  entryId: string
): Promise<NotificationActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!entryId) return { success: false, error: "Notificación inválida" };

    const ok = await snoozeDebtNotification(auth.userId, entryId);
    if (!ok) return { success: false, error: "No se encontró el registro" };

    revalidateNotificationViews();
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo posponer",
    };
  }
}

export async function dismissAllNotificationsAction(
  entryIds: string[]
): Promise<NotificationActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    await dismissAllDueNotifications(auth.userId, entryIds);
    revalidateNotificationViews();
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudieron limpiar",
    };
  }
}
