import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { getSession } from "@/modules/auth/services/session-service";
import { DebtEntryDetail } from "@/modules/debts";
import { getDebtEntryDetail } from "@/modules/debts/services/debt-entry-detail-service";
import styles from "../../deudas.module.css";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = {
  title: "Detalle de Registro | Finanzas",
};

export default async function DebtEntryDetailPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const cookieStore = await cookies();
  if (cookieStore.get("finanzas_locked")?.value === "true") {
    return null;
  }

  const { id, entryId } = await params;
  if (!UUID_RE.test(id) || !UUID_RE.test(entryId)) notFound();

  const detail = await getDebtEntryDetail(id, entryId, session.userId);
  if (!detail) notFound();

  const locale = await getUserLocale(session.userId);
  const dict = getDictionary(locale);

  return (
    <main className={styles.pageContainer}>
      <DebtEntryDetail
        contactId={detail.contactId}
        contactName={detail.contactName}
        entry={detail.entry}
        currency={detail.currency}
        locale={locale}
        labels={dict.debts}
        movLabels={dict.movements}
        savingText={dict.home.saving}
      />
    </main>
  );
}
