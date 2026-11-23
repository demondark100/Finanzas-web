import { Card } from "@/components/ui/card";
import styles from "./movimientos.module.css";

export const metadata = {
  title: "Movimientos | Finanzas-web",
};

export default function MovimientosPage() {
  return (
    <main className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Movimientos</h1>
        <p className={styles.subtitle}>
          Historial de todos tus gastos e ingresos
        </p>
      </header>

      <div className={styles.filterChips}>
        <button className={styles.chipActive}>Todos</button>
        <button className={styles.chip}>Ingresos</button>
        <button className={styles.chip}>Gastos</button>
      </div>

      <Card className={styles.emptyCard}>
        <div className={styles.emptyIcon}>📄</div>
        <h3 className={styles.emptyTitle}>Sin movimientos aún</h3>
        <p className={styles.emptyDesc}>
          Cuando anotes ingresos o gastos aparecerán aquí ordenados por fecha.
        </p>
      </Card>
    </main>
  );
}
