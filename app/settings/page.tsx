"use client";

import Link from "next/link";
import { ArrowLeft, Check, Languages, WifiOff } from "lucide-react";
import { useState } from "react";
import BottomNav from "../components/bottom-nav";

const languages = [
  { code: "en", label: "English" },
  { code: "ne", label: "नेपाली" },
  { code: "hi", label: "हिन्दी" },
];

export default function SettingsPage() {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("yatraai:lang") || "en";
  });

  function selectLang(value: string) {
    setLang(value);
    try { localStorage.setItem("yatraai:lang", value); } catch {}
  }

  return (
    <div className="app-shell page-shell">
      <header className="page-topbar">
        <Link href="/" className="back-link" aria-label="Back to home"><ArrowLeft size={17} strokeWidth={2.1} /></Link>
        <div className="page-heading"><h1>Settings</h1><p>Make YatraAI feel like yours.</p></div>
      </header>

      <section className="settings-card">
        <div className="settings-card__title"><Languages size={17} /><span>Preferred language</span></div>
        <p className="settings-card__copy">Choose the language you want to use for guide answers.</p>
        <div className="language-list" role="group" aria-label="Preferred language">
          {languages.map((language) => {
            const selected = lang === language.code;
            return (
              <button key={language.code} onClick={() => selectLang(language.code)} className={`language-option ${selected ? "language-option--selected" : ""}`} aria-pressed={selected}>
                <span>{language.label}</span>
                {selected && <Check size={16} strokeWidth={2.2} aria-label="Selected" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card__title"><WifiOff size={17} /><span>Offline support</span></div>
        <p className="settings-card__copy">Emergency numbers and safety instructions are cached automatically, so SOS remains useful when the signal disappears.</p>
      </section>

      <BottomNav />
    </div>
  );
}
