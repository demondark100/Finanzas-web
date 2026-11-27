import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { getSession } from "@/modules/auth/services/session-service";
import { MovementDetail } from "@/modules/transactions";
import { getTransactionDetail } from "@/modules/transactions/services/transaction-detail-service";
import styles from "../movimientos.module.css";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata = {
  title: "Detalle de Movimiento | Finanzas",
};

export default async function MovementDetailPage({
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

  const detail = await getTransactionDetail(id, session.userId);
  if (!detail) notFound();

  const locale = await getUserLocale(session.userId);
  const dict = getDictionary(locale);

  return (
    <main className={styles.pageContainer}>
      <MovementDetail
        item={detail.item}
        currency={detail.currency}
        locale={locale}
        labels={dict.movements}
        homeLabels={dict.home}
      />
    </main>
  );
}
