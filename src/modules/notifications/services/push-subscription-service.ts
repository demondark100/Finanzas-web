import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

export interface PushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}

export async function savePushSubscription(
  userId: string,
  sub: PushSubscriptionInput
): Promise<void> {
  const now = new Date();
  await db
    .insert(pushSubscriptions)
    .values({
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
      userAgent: sub.userAgent ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [pushSubscriptions.endpoint],
      set: {
        userId,
        p256dh: sub.p256dh,
        auth: sub.auth,
        userAgent: sub.userAgent ?? null,
        updatedAt: now,
      },
    });
}

export async function deletePushSubscription(userId: string, endpoint: string): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
}

export async function deletePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function getUserPushSubscriptions(userId: string) {
  return db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
}

export async function getAllSubscribedUserIds(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ userId: pushSubscriptions.userId })
    .from(pushSubscriptions);
  return rows.map((r) => r.userId);
}
