"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loginPasswordAction } from "../handlers/auth-actions";
import styles from "./auth.module.css";

interface LoginPasswordProps {
  onShowPin?: () => void;
  hasSavedSession?: boolean;
}

export function LoginPassword({ onShowPin, hasSavedSession }: LoginPasswordProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await loginPasswordAction(formData);
        if (!res.success) {
          setError(res.error || "Credenciales incorrectas");
        } else {
          window.location.href = "/";
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al conectar con el servidor");
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.alertError}>{error}</div>}

        <Input label="Correo Electrónico" name="email" type="email" placeholder="correo@ejemplo.com" required />
        <Input label="Contraseña" name="password" type="password" placeholder="Tu contraseña" required />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Iniciando sesión..." : "Ingresar"}
        </Button>

        {hasSavedSession && onShowPin && (
          <Button type="button" variant="secondary" onClick={onShowPin}>
            Ingresar con PIN de 6 dígitos
          </Button>
        )}
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
