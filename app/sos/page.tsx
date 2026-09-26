"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type EmergencyPack = {
  emergency_numbers: { label: string; number: string; type: string }[];
  hospitals: { name: string; phone: string }[];
  instructions: string[];
};

export default function SosPage() {
  const [pack, setPack] = useState<EmergencyPack | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/emergency-pack.json")
      .then((r) => r.json())
      .then((d: EmergencyPack) => {
        if (active) setPack(d);
      })
      .catch(() => {});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        },
        () => setLocationError(true),
        { timeout: 8000 }
      );
    }

    try {
      const events = JSON.parse(
        localStorage.getItem("yatraai:sos-events") || "[]"
      );
      events.push({ ts: Date.now(), location });
      localStorage.setItem(
        "yatraai:sos-events",
        JSON.stringify(events.slice(-20))
      );
    } catch {}

    return () => {
      active = false;
    };
  }, []);

  if (!pack) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 px-5 pb-28 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="text-3xl">🆘</span>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Emergency help</h1>
          <p className="text-xs text-zinc-500">Works offline · Cached on this device</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {pack.emergency_numbers.map((n) => (
          <a
            key={n.number}
            href={`tel:${n.number}`}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-4 shadow-sm active:scale-95 transition-transform"
          >
            <span className="text-2xl">📞</span>
            <span className="text-sm font-semibold text-zinc-900">{n.label}</span>
            <span className="text-xs text-zinc-500">{n.number}</span>
          </a>
        ))}
      </div>

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <span className="text-sm font-medium text-zinc-900">Your location</span>
        </div>
        <p className="mt-1 text-sm text-zinc-600 break-all">
          {location ?? (locationError ? "Location unavailable" : "Acquiring…")}
        </p>
      </div>

      <a
        href="sms:"
        className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-rose-600 py-4 text-white font-semibold shadow-sm active:scale-95 transition-transform"
      >
        <span className="text-lg">💬</span>
        Send SOS message
      </a>

      <div className="mb-5">
        <h2 className="mb-2 text-sm font-medium text-zinc-700">Nearest hospitals</h2>
        <ul className="space-y-2">
          {pack.hospitals.map((h) => (
            <li
              key={h.phone}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className="text-sm font-medium text-zinc-900">{h.name}</span>
              <a
                href={`tel:${h.phone}`}
                className="text-sm font-semibold text-rose-600"
              >
                Call
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">What to do</h2>
        <ul className="space-y-2">
          {pack.instructions.map((line, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-600">
              <span className="text-rose-500">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/"
        className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg"
      >
        Back to home
      </Link>
    </div>
  );
}