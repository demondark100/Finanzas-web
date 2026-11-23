"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { PinPad } from "@/components/ui/pin-pad";
import { loginPinAction, logoutAction } from "../../handlers/auth-actions";
import styles from "./security-lock.module.css";

interface SecurityLockProps {
  userName: string;
  timeoutMinutes?: number;
}

export function SecurityLock({ userName, timeoutMinutes = 2 }: SecurityLockProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastActiveRef = useRef<number>(Date.now());
  const timeoutMs = timeoutMinutes * 60 * 1000;

  useEffect(() => {
    const updateActivity = () => {
      if (!isLocked) lastActiveRef.current = Date.now();
    };

    const checkTimeout = () => {
      if (!isLocked && Date.now() - lastActiveRef.current >= timeoutMs) {
        setIsLocked(true);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastActiveRef.current >= 30000) {
          setIsLocked(true); // Bloquear al volver tras 30s de inactividad
        }
      }
    };

    const events = ["mousedown", "touchstart", "keydown", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, updateActivity, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibility);
    const interval = setInterval(checkTimeout, 5000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, updateActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [isLocked, timeoutMs]);

  const handlePinComplete = (enteredPin: string) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await loginPinAction(enteredPin);
        if (!res.success) {
          setError(res.error || "PIN incorrecto");
          setPin("");
        } else {
          setIsLocked(false);
          setPin("");
          lastActiveRef.current = Date.now();
        }
      } catch {
        setError("Error al verificar PIN");
        setPin("");
      }
    });
  };

  if (!isLocked) return null;

  return (
    <div className={styles.lockOverlay}>
      <div className={styles.lockCard}>
        <div className={styles.iconWrapper}>🔒</div>
        <h2 className={styles.title}>¡Hola, {userName}!</h2>
        <p className={styles.subtitle}>Escribe tu PIN de 6 dígitos para continuar</p>

        {error && <div className={styles.alertError}>{error}</div>}

        <PinPad
          length={6}
          value={pin}
          onChange={setPin}
          onComplete={handlePinComplete}
          disabled={isPending}
        />

        <div className={styles.footer}>
          <form action={logoutAction}>
            <button type="submit" className={styles.logoutBtn}>
              Cerrar sesión / Salir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
