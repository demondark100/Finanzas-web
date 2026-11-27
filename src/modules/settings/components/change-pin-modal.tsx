"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { PinPad } from "@/components/ui/pin-pad";
import type { Dictionary } from "@/i18n";
import { changePinAction } from "../handlers/settings-actions";
import styles from "./settings.module.css";

interface ChangePinModalProps {
  isOpen: boolean;
  labels: Dictionary["settings"];
  onClose: () => void;
  onSuccess: () => void;
}

type PinStep = "current" | "new" | "confirm";

export function ChangePinModal({
  isOpen, labels, onClose, onSuccess,
}: ChangePinModalProps) {
  const [step, setStep] = useState<PinStep>("current");
  const [pinValue, setPinValue] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    setStep("current");
    setPinValue("");
    setCurrentPin("");
    setNewPin("");
    setError(null);
  }, [isOpen]);

  const title =
    step === "current"
      ? labels.pinCurrentStep
      : step === "new"
        ? labels.pinNewStep
        : labels.pinConfirmStep;

  const handleComplete = (code: string) => {
    setError(null);
    if (step === "current") {
      setCurrentPin(code);
      setPinValue("");
      setStep("new");
      return;
    }
    if (step === "new") {
      setNewPin(code);
      setPinValue("");
      setStep("confirm");
      return;
    }
    if (code !== newPin) {
      setPinValue("");
      setNewPin("");
      setStep("new");
      setError(labels.pinMismatch);
      return;
    }
    startTransition(async () => {
      const res = await changePinAction(currentPin, code);
      if (!res.success) {
        setPinValue("");
        setCurrentPin("");
        setNewPin("");
        setStep("current");
        setError(res.error || "No se pudo cambiar el PIN");
        return;
      }
      onSuccess();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={labels.changePin}>
      <div className={styles.pinWrap}>
        <p className={styles.pinSubtitle}>{title}</p>
        {error && <p className={styles.errorText}>{error}</p>}
        <PinPad
          value={pinValue}
          onChange={setPinValue}
          onComplete={handleComplete}
          disabled={isPending}
        />
      </div>
    </Modal>
  );
}
