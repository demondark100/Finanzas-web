import { ShieldCheck } from "lucide-react";
import { RegisterForm } from "@/modules/auth/components/register-form";
import styles from "@/modules/auth/components/auth.module.css";

export const metadata = {
  title: "Crear Cuenta | Finanzas",
};

export default function RegisterPage() {
  return (
    <main className={styles.authWrapper}>
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon}>
          <ShieldCheck size={28} strokeWidth={2.2} />
        </div>
        <h1 className={styles.title}>Crea tu Cuenta</h1>
        <p className={styles.subtitle}>Fácil, seguro y privado</p>
      </div>

      <RegisterForm />
    </main>
  );
}
