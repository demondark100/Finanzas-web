import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { debtEntries } from "./debts";

export const debtNotificationStates = pgTable(
  "debt_notification_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => debtEntries.id, { onDelete: "cascade" }),
    dueDateSnapshot: timestamp("due_date_snapshot", { withTimezone: true }).notNull(),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
    snoozedUntil: timestamp("snoozed_until", { withTimezone: true }),
    lastPushSentAt: timestamp("last_push_sent_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("debt_notif_states_user_entry_uidx").on(table.userId, table.entryId),
    index("debt_notif_states_user_idx").on(table.userId),
  ]
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("push_subscriptions_endpoint_uidx").on(table.endpoint),
    index("push_subscriptions_user_idx").on(table.userId),
  ]
);

export type DebtNotificationState = typeof debtNotificationStates.$inferSelect;
export type NewDebtNotificationState = typeof debtNotificationStates.$inferInsert;
export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscriptionRow = typeof pushSubscriptions.$inferInsert;
