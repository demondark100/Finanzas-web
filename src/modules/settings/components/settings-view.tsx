"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/modules/auth/handlers/auth-actions";

interface SettingsViewProps {
  user: {
    name: string;
    email: string;
  };
}

export function SettingsView({ user }: SettingsViewProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Datos del usuario */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-primary-light)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{user.name}</h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Preferencias de Apariencia */}
      <Card>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Apariencia</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>Modo Oscuro</p>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              {theme === "dark" ? "Activado (fondo oscuro)" : "Desactivado (fondo claro)"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-surface-hover)",
              border: "1px solid var(--color-border)",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
        </div>
      </Card>

      {/* Idioma y Moneda */}
      <Card>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Idioma y Moneda</h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 14 }}>Idioma actual</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)" }}>Español (ES)</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>Moneda predeterminada</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-primary)" }}>Soles (S/.)</span>
        </div>
      </Card>

      {/* Salir */}
      <form action={logoutAction}>
        <Button variant="secondary" style={{ color: "var(--color-expense)" }}>
          Cerrar Sesión
        </Button>
      </form>
    </div>
  );
}
