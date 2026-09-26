"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("yatraai:lang");
    if (saved) setLang(saved);
  }, []);

  function selectLang(v: string) {
    setLang(v);
    try {
      localStorage.setItem("yatraai:lang", v);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 px-5 pb-28 pt-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Language and offline cache.</p>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-zinc-700">Language</h2>
        <div className="mt-2 flex gap-2">
          {[
            { code: "en", label: "English" },
            { code: "ne", label: "नेपाली" },
            { code: "hi", label: "हिन्दी" },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => selectLang(l.code)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                lang === l.code
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-zinc-700">Offline cache</h2>
        <p className="mt-1 text-sm text-zinc-500">
          SOS and emergency info are cached automatically so they work without
          internet.
        </p>
      </section>
    </div>
  );
}