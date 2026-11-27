import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { getSession } from "@/modules/auth/services/session-service";
import { DebtsOverview } from "@/modules/debts";
import { getDebtsOverview } from "@/modules/debts/services/debt-contacts-service";
import styles from "./deudas.module.css";

export const metadata = {
  title: "Préstamos y Deudas | Finanzas-web",
};

export default async function DeudasPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const cookieStore = await cookies();
  if (cookieStore.get("finanzas_locked")?.value === "true") {
    return null;
  }

  const locale = await getUserLocale(session.userId);
  const dict = getDictionary(locale);
  const { contacts, totalReceivable, totalPayable, currency } =
    await getDebtsOverview(session.userId);

  return (
    <main className={styles.pageContainer}>
      <DebtsOverview
        contacts={contacts}
        totalReceivable={totalReceivable}
        totalPayable={totalPayable}
        currency={currency}
        labels={dict.debts}
        movLabels={dict.movements}
        savingText={dict.home.saving}
      />
    </main>
  );
}
