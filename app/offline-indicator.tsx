"use client";

import { useSyncExternalStore } from "react";

export default function OfflineIndicator() {
  const online = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("online", onChange);
      window.addEventListener("offline", onChange);
      return () => {
        window.removeEventListener("online", onChange);
        window.removeEventListener("offline", onChange);
      };
    },
    () => navigator.onLine,
    () => true,
  );

  if (online) return null;
  return (
    <div className="offline-bar" role="status">
      Offline mode — SOS and cached info still work.
    </div>
  );
}
