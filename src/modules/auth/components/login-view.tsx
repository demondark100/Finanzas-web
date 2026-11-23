"use client";

import React, { useState } from "react";
import { PinUnlock } from "./pin-unlock";
import { LoginPassword } from "./login-password";

interface LoginViewProps {
  initialUserName?: string;
  hasSavedSession: boolean;
}

export function LoginView({ initialUserName, hasSavedSession }: LoginViewProps) {
  // Si tiene sesión guardada en el dispositivo, por defecto mostramos el teclado PIN (tipo Yape)
  const [showPin, setShowPin] = useState(hasSavedSession);

  if (showPin && hasSavedSession) {
    return (
      <PinUnlock
        userName={initialUserName}
        onUsePassword={() => setShowPin(false)}
      />
    );
  }

  return (
    <LoginPassword
      hasSavedSession={hasSavedSession}
      onShowPin={() => setShowPin(true)}
    />
  );
}
