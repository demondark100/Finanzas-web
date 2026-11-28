"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, Home, Settings, Users } from "lucide-react";
import type { Dictionary } from "@/i18n";
import { useNotifications } from "@/modules/notifications";
import styles from "./bottom-nav.module.css";

interface BottomNavProps {
  labels?: Dictionary["nav"];
}

export function BottomNav({ labels }: BottomNavProps) {
  const pathname = usePathname();
  const notif = useNotifications();
  const alertCount = notif?.totalCount ?? 0;
  const hasUrgent = (notif?.urgentCount ?? 0) > 0;

  const navItems = [
    { href: "/", label: labels?.home ?? "Inicio", Icon: Home },
    { href: "/movimientos", label: labels?.movements ?? "Movimientos", Icon: ArrowLeftRight },
    { href: "/deudas", label: labels?.debts ?? "Préstamos", Icon: Users },
    { href: "/ajustes", label: labels?.settings ?? "Ajustes", Icon: Settings },
  ];

  return (
    <nav className={styles.bottomNav} aria-label="Navegación principal">
      {navItems.map(({ href, label, Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const showBadge = href === "/deudas" && alertCount > 0;

        return (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={styles.iconPill}>
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
              {showBadge && (
                <span
                  className={`${styles.navBadge} ${hasUrgent ? styles.navBadgeUrgent : styles.navBadgeSoon}`}
                >
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
