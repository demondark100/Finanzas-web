import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { Locale } from "./index";

export const LOCALE_COOKIE = "finanzas_lang";

export function parseLocale(raw?: string | null): Locale {
  return raw === "en" ? "en" : "es";
}

export async function getUserLocale(userId?: string): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (fromCookie === "es" || fromCookie === "en") {
    return fromCookie;
  }

  if (userId) {
    const [row] = await db
      .select({ preferredLanguage: users.preferredLanguage })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (row?.preferredLanguage === "en") return "en";
  }

  return "es";
}
