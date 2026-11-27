import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: TRANSACTION_TYPES }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    concept: text("concept").notNull(),
    category: text("category"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("transactions_user_occurred_idx").on(
      table.userId,
      table.occurredAt.desc()
    ),
    check("transactions_type_check", sql`${table.type} IN ('INCOME', 'EXPENSE')`),
    check("transactions_amount_positive_check", sql`${table.amount} > 0`),
  ]
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
