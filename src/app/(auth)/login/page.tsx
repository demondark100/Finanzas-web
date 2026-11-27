import { Wallet } from "lucide-react";
import { LoginPassword } from "@/modules/auth/components/login-password";
import styles from "@/modules/auth/components/auth.module.css";

export const metadata = {
  title: "Iniciar Sesión | Finanzas",
};

export default function LoginPage() {
  return (
    <main className={styles.authWrapper}>
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon}>
          <Wallet size={28} strokeWidth={2.2} />
        </div>
        <h1 className={styles.title}>Finanzas</h1>
        <p className={styles.subtitle}>Tus cuentas y préstamos bajo control</p>
      </div>

      <LoginPassword />
    </main>
  );
}
