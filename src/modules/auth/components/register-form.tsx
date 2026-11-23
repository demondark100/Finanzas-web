"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { registerAction } from "../handlers/auth-actions";
import styles from "./auth.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (!result.success) {
        setError(result.error || "Ocurrió un error al registrarse");
      } else {
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.alertError}>{error}</div>}

        <Input label="Tu Nombre Completo" name="name" placeholder="Ej. Daniel López" required />
        <Input label="Correo Electrónico" name="email" type="email" placeholder="correo@ejemplo.com" required />
        <Input label="Contraseña Maestra" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
        <Input
          label="Crea tu PIN de 6 Números (Acceso Rápido)"
          name="pin"
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="Ej. 123456"
          required
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando cuenta..." : "Crear mi Cuenta"}
        </Button>
      </form>

      <div className={styles.footerActions}>
        <p className={styles.subtitle}>¿Ya tienes una cuenta?</p>
        <Link href="/login" className={styles.switchLink}>
          Iniciar Sesión
        </Link>
      </div>
    </Card>
  );
}
