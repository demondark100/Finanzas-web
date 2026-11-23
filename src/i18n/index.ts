import es from "./dictionaries/es.json";
import en from "./dictionaries/en.json";

export type Locale = "es" | "en";
export type Dictionary = typeof es;

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale = "es"): Dictionary {
  return dictionaries[locale] || dictionaries.es;
}
