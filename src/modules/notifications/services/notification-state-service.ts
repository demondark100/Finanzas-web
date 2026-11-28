import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { debtEntries, debtNotificationStates } from "@/lib/db/schema";

const DEFAULT_SNOOZE_HOURS = 24;
type DbClient = Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db;

async function findEntryDueDate(userId: string, entryId: string): Promise<Date | null> {
  const [row] = await db
    .select({ dueDate: debtEntries.dueDate })
    .from(debtEntries)
    .where(and(eq(debtEntries.id, entryId), eq(debtEntries.userId, userId)))
    .limit(1);

  return row?.dueDate ?? null;
}

async function upsertNotificationState(
  client: DbClient,
  input: {
    userId: string;
    entryId: string;
    dueDate: Date;
    dismissedAt: Date | null;
    snoozedUntil: Date | null;
    now: Date;
  }
) {
  await client
    .insert(debtNotificationStates)
    .values({
      userId: input.userId,
      entryId: input.entryId,
      dueDateSnapshot: input.dueDate,
      dismissedAt: input.dismissedAt,
      snoozedUntil: input.snoozedUntil,
      updatedAt: input.now,
    })
    .onConflictDoUpdate({
      target: [debtNotificationStates.userId, debtNotificationStates.entryId],
      set: {
        dueDateSnapshot: input.dueDate,
        dismissedAt: input.dismissedAt,
        snoozedUntil: input.snoozedUntil,
        updatedAt: input.now,
      },
    });
}

/** Marca una alerta como leída/descartada para su fecha límite actual. */
export async function dismissDebtNotification(userId: string, entryId: string): Promise<boolean> {
  const dueDate = await findEntryDueDate(userId, entryId);
  if (!dueDate) return false;
  const now = new Date();
  await upsertNotificationState(db, {
    userId, entryId, dueDate, dismissedAt: now, snoozedUntil: null, now,
  });
  return true;
}

/** Pospone una alerta por un número de horas (por defecto 24h). */
export async function snoozeDebtNotification(
  userId: string,
  entryId: string,
  hours = DEFAULT_SNOOZE_HOURS
): Promise<boolean> {
  const dueDate = await findEntryDueDate(userId, entryId);
  if (!dueDate) return false;
  const now = new Date();
  const snoozedUntil = new Date(now.getTime() + hours * 3_600_000);
  await upsertNotificationState(db, {
    userId, entryId, dueDate, dismissedAt: null, snoozedUntil, now,
  });
  return true;
}

/** Marca como leídas todas las alertas indicadas del usuario. */
export async function dismissAllDueNotifications(
  userId: string,
  entryIds: string[]
): Promise<number> {
  if (entryIds.length === 0) return 0;

  const rows = await db
    .select({ id: debtEntries.id, dueDate: debtEntries.dueDate })
    .from(debtEntries)
    .where(
      and(
        eq(debtEntries.userId, userId),
        inArray(debtEntries.id, entryIds),
        isNotNull(debtEntries.dueDate)
      )
    );

  if (rows.length === 0) return 0;
  const now = new Date();

  await db.transaction(async (tx) => {
    for (const row of rows) {
      if (!row.dueDate) continue;
      await upsertNotificationState(tx, {
        userId, entryId: row.id, dueDate: row.dueDate, dismissedAt: now, snoozedUntil: null, now,
      });
    }
  });

  return rows.length;
}
