import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Movimientos | Finanzas-web",
};

export default function MovimientosPage() {
  return (
    <main style={{ padding: "20px 16px", maxWidth: 460, margin: "0 auto" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Movimientos</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
          Historial de todos tus gastos e ingresos
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-primary)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Todos
        </button>
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Ingresos
        </button>
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Gastos
        </button>
      </div>

      <Card style={{ textAlign: "center", padding: "32px 16px" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Sin movimientos aún</h3>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
          Cuando anotes ingresos o gastos aparecerán aquí ordenados por fecha.
        </p>
      </Card>
    </main>
  );
}
