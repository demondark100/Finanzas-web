import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Préstamos y Deudas | Finanzas-web",
};

export default function DeudasPage() {
  return (
    <main style={{ padding: "20px 16px", maxWidth: 460, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Préstamos</h1>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
            Control de lo que te deben o debes
          </p>
        </div>
        <Button style={{ width: "auto", minHeight: 38, padding: "8px 14px", fontSize: 13 }}>
          + Anotar
        </Button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        <button
          style={{
            padding: "12px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-primary-light)",
            color: "var(--color-primary)",
            fontSize: 15,
            fontWeight: 700,
            border: "1.5px solid var(--color-primary)",
          }}
        >
          Me deben
        </button>
        <button
          style={{
            padding: "12px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-muted)",
            fontSize: 15,
            fontWeight: 600,
            border: "1px solid var(--color-border)",
          }}
        >
          Debo pagar
        </button>
      </div>

      <Card style={{ textAlign: "center", padding: "32px 16px" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🤝</div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Todo al día</h3>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
          No tienes préstamos pendientes por cobrar en este momento.
        </p>
      </Card>
    </main>
  );
}
