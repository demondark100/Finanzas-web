"use client";

import { useEffect, useState, useTransition } from "react";
import {
  sendTestPushAction,
  subscribePushAction,
  unsubscribePushAction,
} from "../../handlers/push-actions";
import {
  getOrRegisterServiceWorker,
  isWebPushSupported,
  urlBase64ToUint8Array,
} from "../../helpers/push-browser";

export type PushSupportState = "loading" | "unsupported" | "denied" | "inactive" | "active";

export function usePushSubscription(onFeedback: (msg: string) => void) {
  const [state, setState] = useState<PushSupportState>("loading");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!isWebPushSupported() || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        if (active) setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (active) setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.getRegistration("/sw.js");
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (active) setState(sub ? "active" : "inactive");
      } catch {
        if (active) setState("unsupported");
      }
    };
    void check();
    return () => { active = false; };
  }, []);

  const enable = (successText: string) => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "denied" : "inactive");
          return;
        }
        const reg = await getOrRegisterServiceWorker();
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          }));
        const json = sub.toJSON();
        const res = await subscribePushAction({
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
        });
        if (!res.success) return onFeedback(res.error ?? "Error");
        setState("active");
        onFeedback(successText);
      } catch (err: unknown) {
        onFeedback(err instanceof Error ? err.message : "Error");
      }
    });
  };

  const disable = (disabledText: string) => {
    startTransition(async () => {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await unsubscribePushAction(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("inactive");
      onFeedback(disabledText);
    });
  };

  const sendTest = (sentText: string) => {
    startTransition(async () => {
      const res = await sendTestPushAction();
      onFeedback(res.success ? sentText : (res.error ?? "Error"));
    });
  };

  return { state, isPending, enable, disable, sendTest };
}
