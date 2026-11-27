import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { getExchangeRates } from "@/lib/currency/exchange-service";
import { getSession } from "@/modules/auth/services/session-service";
import { SettingsView } from "@/modules/settings";
import { getUserSettings } from "@/modules/settings/services/settings-service";
import styles from "../dashboard.module.css";

export const metadata = {
  title: "Ajustes | Finanzas-web",
};

export default async function AjustesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const cookieStore = await cookies();
  if (cookieStore.get("finanzas_locked")?.value === "true") {
    return null;
  }

  const [userSettings, locale, rates] = await Promise.all([
    getUserSettings(session.userId),
    getUserLocale(session.userId),
    getExchangeRates(),
  ]);
  if (!userSettings) redirect("/login");

  const dict = getDictionary(locale);

  return (
    <main className={styles.pageContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.userName}>{dict.settings.title}</h1>
          <p className={styles.greeting}>{dict.settings.subtitle}</p>
        </div>
      </header>

      <SettingsView
        user={userSettings}
        rates={rates}
        labels={dict.settings}
        savingText={dict.home.saving}
      />
    </main>
  );
}
