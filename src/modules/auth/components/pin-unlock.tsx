"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PinPad } from "@/components/ui/pin-pad";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loginPinAction } from "../handlers/auth-actions";
import styles from "./auth.module.css";

interface PinUnlockProps {
  userName?: string;
  onUsePassword: () => void;
}

export function PinUnlock({ userName, onUsePassword }: PinUnlockProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleComplete = (completedPin: string) => {
    setError(null);
    startTransition(async () => {
      const result = await loginPinAction(completedPin);
      if (!result.success) {
        setError(result.error || "PIN incorrecto");
        setPin("");
      } else {
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <Card>
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon}>🔒</div>
        <h2 className={styles.title}>{userName ? `¡Hola, ${userName}!` : "Ingresa tu PIN"}</h2>
        <p className={styles.subtitle}>Escribe tus 6 dígitos para entrar</p>
      </div>

      {error && <div className={styles.alertError} style={{ marginBottom: 16 }}>{error}</div>}

      <PinPad
        length={6}
        value={pin}
        onChange={setPin}
        onComplete={handleComplete}
        disabled={isPending}
      />

      <div className={styles.footerActions}>
        <Button type="button" variant="ghost" onClick={onUsePassword}>
          Ingresar con contraseña
        </Button>
      </div>
    </Card>
  );
}
