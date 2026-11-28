"use client";

import React from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/i18n";
import { usePushSubscription } from "./use-push-subscription";
import styles from "./push-settings-card.module.css";

interface PushSettingsCardProps {
  labels: Dictionary["notifications"];
  onToast: (message: string) => void;
}

export function PushSettingsCard({ labels, onToast }: PushSettingsCardProps) {
  const push = usePushSubscription(onToast);

  if (push.state === "loading") return null;

  const isActive = push.state === "active";
  const isBlocked = push.state === "denied" || push.state === "unsupported";
  const titleLabel = isActive ? labels.pushActiveLabel : labels.pushInactiveLabel;
  const desc =
    push.state === "active"
      ? labels.pushActiveDesc
      : push.state === "denied"
        ? labels.pushDeniedDesc
        : push.state === "unsupported"
          ? labels.pushUnsupportedDesc
          : labels.pushInactiveDesc;

  return (
    <Card>
      <h3 className={styles["finanzas-push-card__heading"]}>{labels.pushTitle}</h3>
      <div className={styles["finanzas-push-card__row"]}>
        <div className={styles["finanzas-push-card__info"]}>
          <span
            className={`${styles["finanzas-push-card__icon"]} ${
              isActive ? styles["finanzas-push-card__icon--active"] : ""
            }`.trim()}
            aria-hidden="true"
          >
            {isActive ? <Bell size={16} /> : <BellOff size={16} />}
          </span>
          <div>
            <p className={styles["finanzas-push-card__title"]}>{titleLabel}</p>
            <p className={styles["finanzas-push-card__desc"]}>{desc}</p>
          </div>
        </div>
      </div>

      {!isBlocked && (
        <div className={styles["finanzas-push-card__actions"]}>
          {isActive ? (
            <>
              <button
                type="button"
                disabled={push.isPending}
                onClick={() => push.sendTest(labels.pushTestSentToast)}
                className={styles["finanzas-push-card__btn"]}
              >
                <Send size={14} /> {labels.pushTestBtn}
              </button>
              <button
                type="button"
                disabled={push.isPending}
                onClick={() => push.disable(labels.pushDisabledToast)}
                className={styles["finanzas-push-card__btn"]}
              >
                {labels.pushDisableBtn}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={push.isPending}
              onClick={() => push.enable(labels.pushEnabledToast)}
              className={`${styles["finanzas-push-card__btn"]} ${styles["finanzas-push-card__btn--primary"]}`}
            >
              <Bell size={14} /> {labels.pushEnableBtn}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
