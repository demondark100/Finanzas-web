import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/services/session-service";
import { BottomNav } from "@/components/ui/bottom-nav";
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

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.contentWrapper}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
