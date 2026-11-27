import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { getSession } from "@/modules/auth/services/session-service";
import { HomeDashboard } from "@/modules/transactions";
import { getDashboardTransactions } from "@/modules/transactions/services/transaction-service";
import styles from "./dashboard.module.css";

export default async function HomePage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const cookieStore = await cookies();
  if (cookieStore.get("finanzas_locked")?.value === "true") {
    return null;
  }

  const locale = await getUserLocale(session.userId);
  const dict = getDictionary(locale);
  const { summary, recentTransactions, currency } =
    await getDashboardTransactions(session.userId);

  return (
    <main className={styles.pageContainer}>
      <HomeDashboard
        userName={session.name}
        summary={summary}
        recentTransactions={recentTransactions}
        currency={currency}
        locale={locale}
        labels={dict.home}
      />
    </main>
  );
}
