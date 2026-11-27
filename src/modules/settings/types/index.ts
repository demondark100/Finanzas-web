import type { Locale } from "@/i18n";

export const SUPPORTED_CURRENCIES = ["PEN", "USD", "EUR"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
export type SupportedTheme = "light" | "dark";

export interface UserSettingsData {
  id: string;
  name: string;
  email: string;
  preferredCurrency: SupportedCurrency;
  preferredLanguage: Locale;
  preferredTheme: SupportedTheme;
}

export interface SettingsActionResult {
  success: boolean;
  error?: string;
}
