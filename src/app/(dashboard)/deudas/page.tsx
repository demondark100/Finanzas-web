import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import styles from "./deudas.module.css";

export const metadata = {
  title: "Préstamos y Deudas | Finanzas-web",
};

export default function DeudasPage() {
  return (
    <main className={styles.pageContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Préstamos</h1>
          <p className={styles.subtitle}>
            Control de lo que te deben o debes
          </p>
        </div>
        <Button className={styles.btnAnotar}>
          + Anotar
        </Button>
      </header>

      <div className={styles.tabsGrid}>
        <button className={styles.tabActive}>
          Me deben
        </button>
        <button className={styles.tab}>
          Debo pagar
        </button>
      </div>

      <Card className={styles.emptyCard}>
        <div className={styles.emptyIcon}>🤝</div>
        <h3 className={styles.emptyTitle}>Todo al día</h3>
        <p className={styles.emptyDesc}>
          No tienes préstamos pendientes por cobrar en este momento.
        </p>
      </Card>
    </main>
  );
}
