"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  NOTIFICATIONS_STORAGE_KEY,
  type OrderNotification,
} from "@/lib/notifications";

/**
 * Live order notifications, plus a `refresh` you must call right after
 * markAsRead/markAllAsRead so the same tab's UI updates immediately —
 * the `storage` event below only fires for OTHER tabs (e.g. a customer
 * checking out while the admin panel is open elsewhere).
 */
export function useNotifications(): [OrderNotification[], () => void] {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  const refresh = useCallback(() => {
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    refresh();

    function handleStorage(e: StorageEvent) {
      if (e.key === null || e.key === NOTIFICATIONS_STORAGE_KEY) {
        refresh();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  return [notifications, refresh];
}
