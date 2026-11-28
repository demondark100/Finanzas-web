import { sendNotification, setVapidDetails } from "web-push";
import { and, eq, gte, inArray } from "drizzle-orm";
import { getUserLocale } from "@/i18n/server-locale";
import { db } from "@/lib/db";
import { debtNotificationStates } from "@/lib/db/schema";
import { buildDuePushPayload, type WebPushPayload } from "../helpers/push-payload";
import { getDueNotifications } from "./notification-service";
import {
  deletePushSubscriptionByEndpoint,
  getAllSubscribedUserIds,
  getUserPushSubscriptions,
} from "./push-subscription-service";

const PUSH_COOLDOWN_MS = 18 * 3_600_000;

function configureVapid(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const priv = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:admin@finanzas-web.local";
  if (!pub || !priv) return false;
  setVapidDetails(subject, pub, priv);
  return true;
}

export async function sendPushToUser(userId: string, payload: WebPushPayload): Promise<number> {
  if (!configureVapid()) return 0;
  const subs = await getUserPushSubscriptions(userId);
  if (subs.length === 0) return 0;

  let sent = 0;
  const body = JSON.stringify(payload);

  for (const sub of subs) {
    try {
      await sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        body
      );
      sent += 1;
    } catch (err: unknown) {
      const status = typeof err === "object" && err && "statusCode" in err
        ? Number((err as { statusCode?: number }).statusCode)
        : 0;
      if (status === 404 || status === 410) {
        await deletePushSubscriptionByEndpoint(sub.endpoint);
      }
    }
  }
  return sent;
}

async function markEntriesPushed(userId: string, entries: { entryId: string; dueDate: string }[]) {
  const now = new Date();
  await db.transaction(async (tx) => {
    for (const item of entries) {
      await tx
        .insert(debtNotificationStates)
        .values({
          userId,
          entryId: item.entryId,
          dueDateSnapshot: new Date(item.dueDate),
          lastPushSentAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [debtNotificationStates.userId, debtNotificationStates.entryId],
          set: { lastPushSentAt: now, updatedAt: now },
        });
    }
  });
}

/** Envía notificaciones push diarias de cobros/pagos vencidos o que vencen hoy. */
export async function runScheduledDuePushJob(): Promise<{ users: number; sent: number }> {
  if (!configureVapid()) return { users: 0, sent: 0 };

  const userIds = await getAllSubscribedUserIds();
  const cutoff = new Date(Date.now() - PUSH_COOLDOWN_MS);
  let totalSent = 0;

  for (const userId of userIds) {
    const [summary, locale] = await Promise.all([
      getDueNotifications(userId),
      getUserLocale(userId),
    ]);
    const urgent = summary.items.filter((i) => i.severity !== "upcoming");
    if (urgent.length === 0) continue;

    const recentRows = await db
      .select({ entryId: debtNotificationStates.entryId })
      .from(debtNotificationStates)
      .where(
        and(
          eq(debtNotificationStates.userId, userId),
          inArray(debtNotificationStates.entryId, urgent.map((u) => u.entryId)),
          gte(debtNotificationStates.lastPushSentAt, cutoff)
        )
      );
    const recentlySent = new Set(recentRows.map((r) => r.entryId));
    const pending = urgent.filter((u) => !recentlySent.has(u.entryId));
    const payload = buildDuePushPayload(pending, summary.currency, locale);
    if (!payload) continue;

    const count = await sendPushToUser(userId, payload);
    if (count > 0) {
      totalSent += count;
      await markEntriesPushed(userId, pending);
    }
  }

  return { users: userIds.length, sent: totalSent };
}
