import React from "react";
import { Card } from "@/components/ui/card";
import type { Dictionary, Locale } from "@/i18n";
import type { SupportedCurrency } from "../types";
import styles from "./settings.module.css";

interface PreferencesCardProps {
  preferredLanguage: Locale;
  preferredCurrency: SupportedCurrency;
  rates?: { USD: number; EUR: number };
  labels: Dictionary["settings"];
  isPending: boolean;
  onLanguageChange: (language: Locale) => void;
  onCurrencyChange: (currency: SupportedCurrency) => void;
}

const CURRENCIES: { code: SupportedCurrency; label: string }[] = [
  { code: "PEN", label: "S/. PEN" },
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
];

export function PreferencesCard({
  preferredLanguage,
  preferredCurrency,
  rates,
  labels,
  isPending,
  onLanguageChange,
  onCurrencyChange,
}: PreferencesCardProps) {
  return (
    <Card>
      <h3 className={styles.sectionTitle}>{labels.preferencesTitle}</h3>

      <div className={styles.blockGroupWithMargin}>
        <span className={styles.itemLabel}>{labels.language}</span>
        <div className={styles.segmentedRow}>
          {(["es", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              disabled={isPending}
              onClick={() => onLanguageChange(lang)}
              className={preferredLanguage === lang ? styles.segActive : styles.segBtn}
            >
              {lang === "es" ? "ES · Español" : "EN · English"}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.blockGroup}>
        <span className={styles.itemLabel}>{labels.currency}</span>
        <div className={styles.segmentedRow}>
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              disabled={isPending}
              onClick={() => onCurrencyChange(c.code)}
              className={preferredCurrency === c.code ? styles.segActive : styles.segBtn}
            >
              {c.label}
            </button>
          ))}
        </div>
        {rates && rates.USD > 0 && rates.EUR > 0 && (
          <p className={styles.rateHint}>
            1 USD ≈ S/. {(1 / rates.USD).toFixed(2)} · 1 EUR ≈ S/. {(1 / rates.EUR).toFixed(2)}
          </p>
        )}
      </div>
    </Card>
  );
}
