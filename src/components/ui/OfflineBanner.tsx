"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** Shown while the browser reports no connection. React Query pauses and resumes
 * queries on its own based on the same signal, so this only needs to inform the user. */
export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-110 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900"
    >
      You&apos;re offline. Some actions won&apos;t work until you reconnect.
    </div>
  );
}
