"use client";

import React, { useState } from "react";
import { PinPad } from "@/components/ui/pin-pad";
import { Button } from "@/components/ui/button";
import styles from "./auth.module.css";

interface RegisterPinStepProps {
  onComplete: (pin: string) => void;
  onBack: () => void;
  isPending: boolean;
}

export function RegisterPinStep({ onComplete, onBack, isPending }: RegisterPinStepProps) {
  const [firstPin, setFirstPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFirstComplete = (pin: string) => {
    setError(null);
    setIsConfirming(true);
  };

  const handleConfirmComplete = (secondPin: string) => {
    if (secondPin !== firstPin) {
      setError("Los códigos PIN no coinciden. Inténtalo de nuevo.");
      setConfirmPin("");
      setIsConfirming(false);
      setFirstPin("");
      return;
    }
    setError(null);
    onComplete(secondPin);
  };

  return (
    <div>
      <div className={styles.brandHeader}>
        <div className={styles.brandIcon}>🔑</div>
        <h2 className={styles.title}>
          {isConfirming ? "Confirma tu PIN" : "Crea tu PIN de 6 Números"}
        </h2>
        <p className={styles.subtitle}>
          {isConfirming
            ? "Vuelve a escribir tus 6 dígitos para confirmar"
            : "Este PIN te servirá para entrar rápido a tu cuenta"}
        </p>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}

      <PinPad
        length={6}
        value={isConfirming ? confirmPin : firstPin}
        onChange={isConfirming ? setConfirmPin : setFirstPin}
        onComplete={isConfirming ? handleConfirmComplete : handleFirstComplete}
        disabled={isPending}
      />

      <div className={styles.footerActions}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (isConfirming) {
              setIsConfirming(false);
              setConfirmPin("");
            } else {
              onBack();
            }
          }}
          disabled={isPending}
        >
          {isConfirming ? "Volver a escribir el PIN" : "← Modificar mis datos"}
        </Button>
      </div>
    </div>
  );
}
