import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("finanzas_session");
  const { pathname } = request.nextUrl;

  // Rutas públicas de autenticación
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Si no está autenticado y busca acceder a la app protegida
  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si ya tiene sesión activa y navega hacia /register, enviarlo al home
  if (sessionCookie && pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.svg|.*\\.png).*)"],
};
