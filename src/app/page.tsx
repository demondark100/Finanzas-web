import { redirect } from "next/navigation";
import { getSession, logoutAction } from "@/modules/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect("/login");
  }

  return (
    <main style={{ padding: "20px 16px", maxWidth: 460, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>Bienvenido de nuevo</p>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>{session.name}</h1>
        </div>
        <form action={logoutAction}>
          <Button variant="secondary" style={{ width: "auto", minHeight: 38, padding: "8px 14px", fontSize: 14 }}>
            Salir
          </Button>
        </form>
      </header>

      <Card style={{ marginBottom: 20, textAlign: "center", padding: "24px 16px" }}>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 6 }}>Dinero disponible</p>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "var(--color-primary)" }}>S/. 0.00</h2>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <Button style={{ backgroundColor: "var(--color-income)", color: "#fff" }}>
          + Recibí Dinero
        </Button>
        <Button style={{ backgroundColor: "var(--color-expense)", color: "#fff" }}>
          - Hice un Gasto
        </Button>
      </div>

      <Card>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Paso 1: Autenticación Lista</h3>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
          Tu inicio de sesión y registro tipo Yape con PIN de 6 dígitos y persistencia en dispositivo está activo y funcionando.
        </p>
      </Card>
    </main>
  );
}
