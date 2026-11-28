import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finanzas-web | Control de Gastos y Préstamos",
  description: "Control de finanzas personales, gastos y préstamos mobile-first",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finanzas",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
