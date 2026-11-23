import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/services/session-service";
import { SettingsView } from "@/modules/settings/components/settings-view";

export const metadata = {
  title: "Ajustes | Finanzas-web",
};

export default async function AjustesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return (
    <main style={{ padding: "20px 16px", maxWidth: 460, margin: "0 auto" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Mi Cuenta y Ajustes</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
          Personaliza tu experiencia y preferencias
        </p>
      </header>

      <SettingsView user={session} />
    </main>
  );
}
