import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/services/session-service";
import { logoutAction } from "@/modules/auth/handlers/auth-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import styles from "./dashboard.module.css";

export default async function HomePage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <main className={styles.pageContainer}>
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>Bienvenido de nuevo</p>
          <h1 className={styles.userName}>{session.name}</h1>
        </div>
        <form action={logoutAction}>
          <Button variant="secondary" className={styles.logoutSmallBtn}>
            Salir
          </Button>
        </form>
      </header>

      <Card className={styles.balanceCard}>
        <p className={styles.balanceLabel}>Dinero disponible</p>
        <h2 className={styles.balanceAmount}>S/. 0.00</h2>
      </Card>

      <div className={styles.actionsGrid}>
        <Button className={styles.btnIncome}>
          + Recibí Dinero
        </Button>
        <Button className={styles.btnExpense}>
          - Hice un Gasto
        </Button>
      </div>

      <Card>
        <h3 className={styles.sectionHeading}>Últimos Movimientos</h3>
        <p className={styles.emptyStateText}>
          Aún no tienes movimientos registrados este mes.
        </p>
      </Card>
    </main>
  );
}
