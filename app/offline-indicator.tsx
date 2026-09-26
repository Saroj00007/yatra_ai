"use client";

import { useEffect, useState } from "react";

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 text-white text-center text-xs py-1.5">
      Offline mode — SOS and cached info still work.
    </div>
  );
}