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
import { transactions } from "./transactions";

export const DEBT_ENTRY_KINDS = [
  "LENT",
  "REPAYMENT_RECEIVED",
  "BORROWED",
  "REPAYMENT_PAID",
] as const;

export type DebtEntryKind = (typeof DEBT_ENTRY_KINDS)[number];

export const debtContacts = pgTable(
  "debt_contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("debt_contacts_user_name_idx").on(table.userId, table.name)]
);

export const debtEntries = pgTable(
  "debt_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => debtContacts.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: DEBT_ENTRY_KINDS }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    note: text("note"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    linkedTransactionId: uuid("linked_transaction_id").references(
      () => transactions.id,
      { onDelete: "set null" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("debt_entries_contact_occurred_idx").on(
      table.contactId,
      table.occurredAt.desc()
    ),
    index("debt_entries_user_idx").on(table.userId),
    index("debt_entries_user_due_idx").on(table.userId, table.dueDate),
    check(
      "debt_entries_kind_check",
      sql`${table.kind} IN ('LENT', 'REPAYMENT_RECEIVED', 'BORROWED', 'REPAYMENT_PAID')`
    ),
    check("debt_entries_amount_positive_check", sql`${table.amount} > 0`),
  ]
);

export type DebtContact = typeof debtContacts.$inferSelect;
export type NewDebtContact = typeof debtContacts.$inferInsert;
export type DebtEntry = typeof debtEntries.$inferSelect;
export type NewDebtEntry = typeof debtEntries.$inferInsert;
