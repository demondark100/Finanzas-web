import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { getSession } from "@/modules/auth/services/session-service";
import { ContactDetailView } from "@/modules/debts";
import { getContactDetail } from "@/modules/debts/services/debt-entries-service";
import styles from "../deudas.module.css";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = {
  title: "Detalle de Préstamo | Finanzas-web",
};

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const cookieStore = await cookies();
  if (cookieStore.get("finanzas_locked")?.value === "true") {
    return null;
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const detail = await getContactDetail(id, session.userId);
  if (!detail) notFound();

  const locale = await getUserLocale(session.userId);
  const dict = getDictionary(locale);

  return (
    <main className={styles.pageContainer}>
      <ContactDetailView
        contact={detail.contact}
        entries={detail.entries}
        currency={detail.currency}
        locale={locale}
        labels={dict.debts}
        movLabels={dict.movements}
        savingText={dict.home.saving}
      />
    </main>
  );
}
