import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n";
import { getUserLocale } from "@/i18n/server-locale";
import { getSession } from "@/modules/auth/services/session-service";
import { BottomNav } from "@/components/ui/bottom-nav";
import { SecurityLock } from "@/modules/auth/components/security-lock";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const isLocked = cookieStore.get("finanzas_locked")?.value === "true";
  const locale = await getUserLocale(session.userId);
  const dict = getDictionary(locale);

  return (
    <div className={styles.layoutContainer}>
      <SecurityLock userName={session.name} initialLocked={isLocked} />
      {!isLocked && (
        <>
          <div className={styles.contentWrapper}>
            {children}
          </div>
          <BottomNav labels={dict.nav} />
        </>
      )}
    </div>
  );
}
