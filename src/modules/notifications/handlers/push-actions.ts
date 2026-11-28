"use server";

import { headers } from "next/headers";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { requireUnlockedSession } from "@/modules/debts/helpers/session-guard";
import {
  deletePushSubscription,
  savePushSubscription,
} from "../services/push-subscription-service";
import { sendPushToUser } from "../services/web-push-service";
import type { NotificationActionResult } from "../types";

export async function subscribePushAction(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<NotificationActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };
    if (!input.endpoint || !input.p256dh || !input.auth) {
      return { success: false, error: "Suscripción push inválida" };
    }

    const ua = (await headers()).get("user-agent");
    await savePushSubscription(auth.userId, { ...input, userAgent: ua });
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo activar",
    };
  }
}

export async function unsubscribePushAction(
  endpoint: string
): Promise<NotificationActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };
    if (endpoint) await deletePushSubscription(auth.userId, endpoint);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "No se pudo desactivar",
    };
  }
}

export async function sendTestPushAction(): Promise<NotificationActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    const locale = await getUserLocale(auth.userId);
    const dict = getDictionary(locale);
    const sent = await sendPushToUser(auth.userId, {
      title: dict.notifications.pushTestTitle,
      body: dict.notifications.pushTestBody,
      url: "/deudas",
      tag: "finanzas-push-test",
    });

    if (sent === 0) {
      return { success: false, error: "No se pudo enviar el aviso (revisa las llaves VAPID)" };
    }
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error enviando notificación",
    };
  }
}
