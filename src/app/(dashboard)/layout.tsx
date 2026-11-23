import { redirect } from "next/navigation";
import { getSession } from "@/modules/auth/services/session-service";
import { BottomNav } from "@/components/ui/bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.userId) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Contenedor con margen inferior para evitar que el BottomNav tape el contenido */}
      <div style={{ paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
