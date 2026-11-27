import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { getSession } from "@/modules/auth/services/session-service";
import { MovementsView, type MovementPeriod } from "@/modules/transactions";
import { getMovementsHistory } from "@/modules/transactions/services/transaction-history-service";
import styles from "./movimientos.module.css";

export const metadata = {
  title: "Movimientos | Finanzas-web",
};

function parsePeriod(raw?: string, hasCustomDates?: boolean): MovementPeriod {
  if (raw === "last_month" || raw === "all") return raw;
  if (raw === "custom" && hasCustomDates) return "custom";
  return "this_month";
}

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string; loans?: string }>;
}) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const cookieStore = await cookies();
  if (cookieStore.get("finanzas_locked")?.value === "true") {
    return null;
  }

  const params = await searchParams;
  const hasCustomDates = Boolean(params.from && params.to);
  const period = parsePeriod(params.period, hasCustomDates);
  const includeLoans = params.loans === "1";
  const customRangeInput =
    period === "custom" ? { from: params.from, to: params.to } : undefined;
  const locale = await getUserLocale(session.userId);
  const dict = getDictionary(locale);
  const { items, currency } = await getMovementsHistory(
    session.userId,
    period,
    customRangeInput,
    includeLoans
  );

  return (
    <main className={styles.pageContainer}>
      <MovementsView
        items={items}
        currency={currency}
        period={period}
        includeLoans={includeLoans}
        customRangeInput={customRangeInput}
        locale={locale}
        labels={dict.movements}
        homeLabels={dict.home}
      />
    </main>
  );
}
