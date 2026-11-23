import { getSession } from "@/modules/auth/services/session-service";
import { LoginView } from "@/modules/auth/components/login-view";
import styles from "@/modules/auth/components/auth.module.css";

export const metadata = {
  title: "Iniciar Sesión | Finanzas-web",
};

export default async function LoginPage() {
  const session = await getSession();
  const hasSavedSession = Boolean(session?.userId);

  return (
    <main className={styles.authWrapper}>
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon}>💰</div>
        <h1 className={styles.title}>Finanzas-web</h1>
        <p className={styles.subtitle}>Tus cuentas y préstamos bajo control</p>
      </div>

      <LoginView
        initialUserName={session?.name}
        hasSavedSession={hasSavedSession}
      />
    </main>
  );
}
