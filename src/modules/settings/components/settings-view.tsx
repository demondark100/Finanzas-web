"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/modules/auth/handlers/auth-actions";
import styles from "./settings.module.css";

interface SettingsViewProps {
  user: {
    name: string;
    email: string;
  };
}

export function SettingsView({ user }: SettingsViewProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.container}>
      {/* Datos del usuario */}
      <Card>
        <div className={styles.userHeader}>
          <div className={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className={styles.userName}>{user.name}</h2>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Preferencias de Apariencia */}
      <Card>
        <h3 className={styles.sectionTitle}>Apariencia</h3>
        <div className={styles.row}>
          <div>
            <p className={styles.itemLabel}>Modo Oscuro</p>
            <p className={styles.itemDesc}>
              {theme === "dark" ? "Activado (fondo oscuro)" : "Desactivado (fondo claro)"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeBtn}
          >
            {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
        </div>
      </Card>

      {/* Idioma y Moneda */}
      <Card>
        <h3 className={styles.sectionTitle}>Idioma y Moneda</h3>
        <div className={styles.rowWithMargin}>
          <span className={styles.itemLabel}>Idioma actual</span>
          <span className={styles.badgeValue}>Español (ES)</span>
        </div>
        <div className={styles.row}>
          <span className={styles.itemLabel}>Moneda principal</span>
          <span className={styles.badgeValue}>Soles (S/.)</span>
        </div>
      </Card>

      {/* Salir */}
      <form action={logoutAction}>
        <Button variant="secondary" className={styles.logoutBtn}>
          Cerrar Sesión
        </Button>
      </form>
    </div>
  );
}
