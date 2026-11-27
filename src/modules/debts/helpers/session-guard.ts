import { cookies } from "next/headers";
import { getSession } from "@/modules/auth/services/session-service";

export async function requireUnlockedSession(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session?.userId) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };
  const cookieStore = await cookies();
  if (cookieStore.get("finanzas_locked")?.value === "true") {
    return { ok: false, error: "Desbloquea la app con tu PIN primero." };
  }
  return { ok: true, userId: session.userId };
}
