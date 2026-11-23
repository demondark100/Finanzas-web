"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { registerAction } from "../handlers/auth-actions";
import { RegisterPinStep } from "./register-pin-step";
import styles from "./auth.module.css";

export function RegisterForm() {
  const [step, setStep] = useState<"credentials" | "pin">("credentials");
  const [formDataState, setFormDataState] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string || "").trim();
    const email = (form.get("email") as string || "").trim();
    const password = (form.get("password") as string || "");

    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name || name.length < 2) errors.name = "Ingresa tu nombre completo";
    if (!email) errors.email = "Ingresa tu correo";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Formato de correo no válido";
    if (!password || password.length < 6) errors.password = "Mínimo 6 caracteres";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormDataState({ name, email, password });
    setStep("pin");
  };

  const handlePinComplete = (pin: string) => {
    setServerError(null);
    const data = new FormData();
    data.append("name", formDataState.name);
    data.append("email", formDataState.email);
    data.append("password", formDataState.password);
    data.append("pin", pin);

    startTransition(async () => {
      try {
        const result = await registerAction(data);
        if (!result.success) {
          setServerError(result.error || "Error al registrarse");
          setStep("credentials");
        } else {
          window.location.href = "/";
        }
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Error al conectar");
        setStep("credentials");
      }
    });
  };

  return (
    <Card>
      {step === "credentials" ? (
        <>
          <form onSubmit={handleCredentialsSubmit} noValidate className={styles.form}>
            {serverError && <div className={styles.alertError}>{serverError}</div>}
            <Input
              label="Tu Nombre Completo"
              name="name"
              defaultValue={formDataState.name}
              placeholder="Ej. Daniel López"
              error={fieldErrors.name}
              onChange={() => setFieldErrors((p) => ({ ...p, name: undefined }))}
            />
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              defaultValue={formDataState.email}
              placeholder="correo@ejemplo.com"
              error={fieldErrors.email}
              onChange={() => setFieldErrors((p) => ({ ...p, email: undefined }))}
            />
            <Input
              label="Crea una Contraseña Maestra"
              name="password"
              type="password"
              defaultValue={formDataState.password}
              placeholder="Mínimo 6 caracteres"
              error={fieldErrors.password}
              onChange={() => setFieldErrors((p) => ({ ...p, password: undefined }))}
            />
            <Button type="submit">Continuar a Crear mi PIN →</Button>
          </form>
          <div className={styles.footerActions}>
            <p className={styles.subtitle}>¿Ya tienes una cuenta?</p>
            <Link href="/login" className={styles.switchLink}>Iniciar Sesión</Link>
          </div>
        </>
      ) : (
        <RegisterPinStep
          onComplete={handlePinComplete}
          onBack={() => setStep("credentials")}
          isPending={isPending}
        />
      )}
    </Card>
  );
}
