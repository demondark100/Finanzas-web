"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { registerAction } from "../handlers/auth-actions";
import { RegisterPinStep } from "./register-pin-step";
import styles from "./auth.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "pin">("credentials");
  const [formDataState, setFormDataState] = useState<{
    name: string;
    email: string;
    password: string;
  }>({ name: "", email: "", password: "" });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setFormDataState({ name, email, password });
    setStep("pin"); // Pasamos inmediatamente a la pantalla de crear PIN tipo Yape
  };

  const handlePinComplete = (pin: string) => {
    setError(null);
    const data = new FormData();
    data.append("name", formDataState.name);
    data.append("email", formDataState.email);
    data.append("password", formDataState.password);
    data.append("pin", pin);

    startTransition(async () => {
      const result = await registerAction(data);
      if (!result.success) {
        setError(result.error || "Ocurrió un error al registrarse");
        setStep("credentials");
      } else {
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <Card>
      {step === "credentials" ? (
        <>
          <form onSubmit={handleCredentialsSubmit} className={styles.form}>
            {error && <div className={styles.alertError}>{error}</div>}

            <Input
              label="Tu Nombre Completo"
              name="name"
              defaultValue={formDataState.name}
              placeholder="Ej. Daniel López"
              required
            />
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              defaultValue={formDataState.email}
              placeholder="correo@ejemplo.com"
              required
            />
            <Input
              label="Crea una Contraseña Maestra"
              name="password"
              type="password"
              defaultValue={formDataState.password}
              placeholder="Mínimo 6 caracteres"
              required
            />

            <Button type="submit">Continuar a Crear mi PIN →</Button>
          </form>

          <div className={styles.footerActions}>
            <p className={styles.subtitle}>¿Ya tienes una cuenta?</p>
            <Link href="/login" className={styles.switchLink}>
              Iniciar Sesión
            </Link>
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
