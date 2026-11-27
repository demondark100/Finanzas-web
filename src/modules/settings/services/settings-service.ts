import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashValue } from "@/modules/auth/helpers/hash";
import type {
  SupportedCurrency,
  SupportedTheme,
  UserSettingsData,
} from "../types";
import type { Locale } from "@/i18n";

function normalizeCurrency(raw?: string | null): SupportedCurrency {
  if (raw === "USD" || raw === "EUR") return raw;
  return "PEN";
}

export async function getUserSettings(userId: string): Promise<UserSettingsData | null> {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      preferredCurrency: users.preferredCurrency,
      preferredLanguage: users.preferredLanguage,
      preferredTheme: users.preferredTheme,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    preferredCurrency: normalizeCurrency(row.preferredCurrency),
    preferredLanguage: row.preferredLanguage === "en" ? "en" : "es",
    preferredTheme: row.preferredTheme === "dark" ? "dark" : "light",
  };
}

export async function updateUserName(userId: string, name: string): Promise<void> {
  await db
    .update(users)
    .set({ name, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserPreferences(
  userId: string,
  prefs: {
    preferredCurrency?: SupportedCurrency;
    preferredLanguage?: Locale;
    preferredTheme?: SupportedTheme;
  }
): Promise<void> {
  await db
    .update(users)
    .set({ ...prefs, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserPin(userId: string, newPinPlain: string): Promise<void> {
  const pinHash = await hashValue(newPinPlain);
  await db
    .update(users)
    .set({ pinHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
