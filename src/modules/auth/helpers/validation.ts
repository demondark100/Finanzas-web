export function validateEmail(email: string): string | null {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !re.test(email)) {
    return "Ingresa un correo electrónico válido";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  return null;
}

export function validatePin(pin: string, expectedLength = 6): string | null {
  if (!pin || pin.length !== expectedLength || !/^\d+$/.test(pin)) {
    return `El PIN debe tener exactamente ${expectedLength} números`;
  }
  return null;
}
