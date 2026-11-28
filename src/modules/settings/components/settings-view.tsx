"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Moon, Pencil, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import type { Dictionary, Locale } from "@/i18n";
import { logoutAction } from "@/modules/auth/handlers/auth-actions";
import { updatePreferencesAction } from "../handlers/settings-actions";
import type { SupportedCurrency, SupportedTheme, UserSettingsData } from "../types";
import { PushSettingsCard } from "@/modules/notifications";
import { ChangePinModal } from "./change-pin-modal";
import { EditProfileModal } from "./edit-profile-modal";
import { PreferencesCard } from "./preferences-card";
import styles from "./settings.module.css";

interface SettingsViewProps {
  user: UserSettingsData;
  rates?: { USD: number; EUR: number };
  labels: Dictionary["settings"];
  notifLabels?: Dictionary["notifications"];
  savingText: string;
}

export function SettingsView({ user, rates, labels, notifLabels, savingText }: SettingsViewProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTheme = (next: SupportedTheme) => {
    if (next === theme) return;
    setTheme(next);
    startTransition(async () => { await updatePreferencesAction({ theme: next }); setToastMsg(labels.savedToast); });
  };

  const updatePref = (patch: { language?: Locale; currency?: SupportedCurrency }) => {
    startTransition(async () => {
      await updatePreferencesAction(patch);
      setToastMsg(labels.savedToast);
      router.refresh();
    });
  };

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.userHeader}>
          <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user.name}</h2>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
          <button type="button" onClick={() => setEditProfileOpen(true)} className={styles.editIconBtn} aria-label={labels.editProfile}>
            <Pencil size={16} />
          </button>
        </div>
      </Card>

      <Card>
        <h3 className={styles.sectionTitle}>{labels.appearance}</h3>
        <div className={styles.segmentedRow}>
          <button type="button" disabled={isPending} onClick={() => handleTheme("light")}
            className={theme === "light" ? styles.segActive : styles.segBtn}>
            <Sun size={15} /> {labels.themeLight}
          </button>
          <button type="button" disabled={isPending} onClick={() => handleTheme("dark")}
            className={theme === "dark" ? styles.segActive : styles.segBtn}>
            <Moon size={15} /> {labels.themeDark}
          </button>
        </div>
      </Card>

      <PreferencesCard
        preferredLanguage={user.preferredLanguage} preferredCurrency={user.preferredCurrency}
        rates={rates} labels={labels} isPending={isPending}
        onLanguageChange={(l) => l !== user.preferredLanguage && updatePref({ language: l })}
        onCurrencyChange={(c) => c !== user.preferredCurrency && updatePref({ currency: c })}
      />

      {notifLabels && <PushSettingsCard labels={notifLabels} onToast={setToastMsg} />}

      <Card>
        <h3 className={styles.sectionTitle}>{labels.securityTitle}</h3>
        <div className={styles.rowWithMargin}>
          <div className={styles.secLeft}>
            <span className={styles.secIcon}><KeyRound size={16} /></span>
            <div><p className={styles.itemLabel}>{labels.changePin}</p><p className={styles.itemDesc}>{labels.changePinDesc}</p></div>
          </div>
          <button type="button" onClick={() => setChangePinOpen(true)} className={styles.actionSmallBtn}>{labels.changeBtn}</button>
        </div>
        <div className={styles.row}>
          <div className={styles.secLeft}>
            <span className={styles.secIcon}><Lock size={16} /></span>
            <div><p className={styles.itemLabel}>{labels.lockNow}</p><p className={styles.itemDesc}>{labels.lockNowDesc}</p></div>
          </div>
          <button type="button" onClick={() => window.dispatchEvent(new Event("finanzas:lock"))} className={styles.actionSmallBtn}>{labels.lockBtn}</button>
        </div>
      </Card>

      <form action={logoutAction} onSubmit={() => localStorage.removeItem("finanzas_locked")}>
        <Button variant="secondary" className={styles.logoutBtn}>{labels.logout}</Button>
      </form>

      <EditProfileModal isOpen={editProfileOpen} currentName={user.name} labels={labels} savingText={savingText}
        onClose={() => setEditProfileOpen(false)} onSuccess={() => { setEditProfileOpen(false); setToastMsg(labels.savedToast); router.refresh(); }} />
      <ChangePinModal isOpen={changePinOpen} labels={labels}
        onClose={() => setChangePinOpen(false)} onSuccess={() => { setChangePinOpen(false); setToastMsg(labels.pinChangedToast); }} />
      <Toast message={toastMsg} onDismiss={() => setToastMsg(null)} />
    </div>
  );
}
