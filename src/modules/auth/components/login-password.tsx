"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loginPasswordAction, loginEmailPinAction } from "../handlers/auth-actions";
import styles from "./auth.module.css";

interface LoginPasswordProps {
  onShowPin?: () => void;
  hasSavedSession?: boolean;
}

export function LoginPassword({ onShowPin, hasSavedSession }: LoginPasswordProps) {
  const [authMode, setAuthMode] = useState<"pin" | "password">("pin");
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; pin?: string }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string || "").trim();
    const errors: { email?: string; password?: string; pin?: string } = {};

    if (!email) errors.email = "Ingresa tu correo";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Correo no válido";

    if (authMode === "password") {
      const password = formData.get("password") as string || "";
      if (!password) errors.password = "Ingresa tu contraseña";
    } else {
      const pin = formData.get("pin") as string || "";
      if (!pin || pin.length !== 6) errors.pin = "Ingresa tu PIN de 6 dígitos";
    }

    if (Object.keys(errors).length > 0) return setFieldErrors(errors);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const res = authMode === "password"
          ? await loginPasswordAction(formData)
          : await loginEmailPinAction(formData);
        if (!res.success) setServerError(res.error || "Credenciales incorrectas");
        else window.location.href = "/";
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Error al conectar");
      }
    });
  };

  const toggleMode = () => {
    setServerError(null);
    setFieldErrors({});
    setAuthMode((m) => (m === "pin" ? "password" : "pin"));
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        {serverError && <div className={styles.alertError}>{serverError}</div>}
        <Input
          label="Correo Electrónico"
          name="email"
          type="email"
          placeholder="correo@ejemplo.com"
          error={fieldErrors.email}
          onChange={() => setFieldErrors((p) => ({ ...p, email: undefined }))}
        />
        {authMode === "pin" ? (
          <Input
            label="Tu PIN de 6 Dígitos"
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            error={fieldErrors.pin}
            onChange={() => setFieldErrors((p) => ({ ...p, pin: undefined }))}
          />
        ) : (
          <Input
            label="Contraseña"
            name="password"
            type="password"
            placeholder="Tu contraseña"
            error={fieldErrors.password}
            onChange={() => setFieldErrors((p) => ({ ...p, password: undefined }))}
          />
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Verificando..." : authMode === "pin" ? "Ingresar con PIN" : "Ingresar con Contraseña"}
        </Button>
        <Button type="button" variant="secondary" onClick={toggleMode}>
          {authMode === "pin" ? "Usar Contraseña en su lugar" : "Usar PIN de 6 dígitos"}
        </Button>
        {hasSavedSession && onShowPin && (
          <Button type="button" variant="ghost" onClick={onShowPin}>Teclado numérico en pantalla</Button>
        )}
      </form>
      <div className={styles.footerActions}>
        <p className={styles.subtitle}>¿Aún no tienes cuenta?</p>
        <Link href="/register" className={styles.switchLink}>Registrarme gratis</Link>
      </div>
    </Card>
  );
}
