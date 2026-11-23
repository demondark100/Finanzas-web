"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loginPasswordAction } from "../handlers/auth-actions";
import styles from "./auth.module.css";

export function LoginPassword() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string || "").trim();
    const password = (formData.get("password") as string || "");

    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = "Ingresa tu correo";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Correo no válido";
    if (!password) errors.password = "Ingresa tu contraseña";

    if (Object.keys(errors).length > 0) return setFieldErrors(errors);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const res = await loginPasswordAction(formData);
        if (!res.success) setServerError(res.error || "Credenciales incorrectas");
        else window.location.href = "/";
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Error al conectar");
      }
    });
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

        <Input
          label="Contraseña"
          name="password"
          type="password"
          placeholder="Tu contraseña"
          error={fieldErrors.password}
          onChange={() => setFieldErrors((p) => ({ ...p, password: undefined }))}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Iniciando sesión..." : "Ingresar a mi Cuenta"}
        </Button>
      </form>

      <div className={styles.footerActions}>
        <p className={styles.subtitle}>¿Aún no tienes cuenta?</p>
        <Link href="/register" className={styles.switchLink}>
          Registrarme gratis
        </Link>
      </div>
    </Card>
  );
}
