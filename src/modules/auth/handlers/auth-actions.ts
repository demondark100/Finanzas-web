"use server";

import { redirect } from "next/navigation";
import {
  createUser,
  findUserByEmail,
  verifyUserCredentials,
  verifyUserPin,
} from "../services/auth-service";
import { createSession, destroySession, getSession } from "../services/session-service";
import { validateEmail, validatePassword, validatePin } from "../helpers/validation";
import { AuthActionResult } from "../types";

export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const pin = formData.get("pin") as string;

  if (!name || name.trim().length < 2) return { success: false, error: "Ingresa tu nombre completo" };
  const emailErr = validateEmail(email);
  if (emailErr) return { success: false, error: emailErr };
  const passErr = validatePassword(password);
  if (passErr) return { success: false, error: passErr };
  const pinErr = validatePin(pin);
  if (pinErr) return { success: false, error: pinErr };

  const existing = await findUserByEmail(email);
  if (existing) return { success: false, error: "Este correo ya está registrado" };

  const user = await createUser({ name, email, passwordPlain: password, pinPlain: pin });
  await createSession({ userId: user.id, email: user.email, name: user.name, isUnlocked: true });
  return { success: true };
}

export async function loginPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await verifyUserCredentials(email, password);
  if (!user) return { success: false, error: "Correo o contraseña incorrectos" };

  await createSession({ userId: user.id, email: user.email, name: user.name, isUnlocked: true });
  return { success: true };
}

export async function loginPinAction(pin: string): Promise<AuthActionResult> {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "No hay sesión activa para desbloquear" };

  const isValid = await verifyUserPin(session.userId, pin);
  if (!isValid) return { success: false, error: "PIN incorrecto" };

  await createSession({ ...session, isUnlocked: true });
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
