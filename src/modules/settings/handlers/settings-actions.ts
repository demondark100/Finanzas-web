"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/i18n/server-locale";
import type { Locale } from "@/i18n";
import { validatePin } from "@/modules/auth/helpers/validation";
import { verifyUserPin } from "@/modules/auth/services/auth-service";
import { createSession, getSession } from "@/modules/auth/services/session-service";
import { requireUnlockedSession } from "@/modules/debts/helpers/session-guard";
import {
  updateUserName,
  updateUserPin,
  updateUserPreferences,
} from "../services/settings-service";
import {
  SUPPORTED_CURRENCIES,
  type SettingsActionResult,
  type SupportedCurrency,
  type SupportedTheme,
} from "../types";

export async function updateProfileAction(formData: FormData): Promise<SettingsActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    const name = String(formData.get("name") ?? "").trim().slice(0, 60);
    if (name.length < 2) return { success: false, error: "Ingresa un nombre válido (mínimo 2 letras)" };

    await updateUserName(auth.userId, name);
    const session = await getSession();
    if (session) await createSession({ ...session, name });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo guardar" };
  }
}

export async function updatePreferencesAction(input: {
  currency?: SupportedCurrency;
  language?: Locale;
  theme?: SupportedTheme;
}): Promise<SettingsActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    const updates: {
      preferredCurrency?: SupportedCurrency;
      preferredLanguage?: Locale;
      preferredTheme?: SupportedTheme;
    } = {};

    if (input.currency && SUPPORTED_CURRENCIES.includes(input.currency)) {
      updates.preferredCurrency = input.currency;
    }
    if (input.language === "es" || input.language === "en") {
      updates.preferredLanguage = input.language;
      const cookieStore = await cookies();
      cookieStore.set(LOCALE_COOKIE, input.language, {
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        sameSite: "lax",
      });
    }
    if (input.theme === "light" || input.theme === "dark") {
      updates.preferredTheme = input.theme;
    }

    await updateUserPreferences(auth.userId, updates);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo guardar" };
  }
}

export async function changePinAction(
  currentPin: string,
  newPin: string
): Promise<SettingsActionResult> {
  try {
    const auth = await requireUnlockedSession();
    if (!auth.ok) return { success: false, error: auth.error };

    const pinErr = validatePin(newPin);
    if (pinErr) return { success: false, error: pinErr };

    const validCurrent = await verifyUserPin(auth.userId, currentPin);
    if (!validCurrent) return { success: false, error: "Tu PIN actual es incorrecto" };

    await updateUserPin(auth.userId, newPin);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "No se pudo cambiar el PIN" };
  }
}

export async function lockAppNowAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("finanzas_locked", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  revalidatePath("/", "layout");
}
