import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/services/session-service";
import { SettingsView } from "@/modules/settings/components/settings-view";
import styles from "../dashboard.module.css";

export const metadata = {
  title: "Ajustes | Finanzas-web",
};

export default async function AjustesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <main className={styles.pageContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.userName}>Mi Cuenta y Ajustes</h1>
          <p className={styles.greeting}>Personaliza tu experiencia y preferencias</p>
        </div>
      </header>

      <SettingsView user={session} />
    </main>
  );
}
