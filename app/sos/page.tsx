"use client";

import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, ListChecks, MapPin, MessageSquare, Phone, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import BottomNav from "../components/bottom-nav";

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
    fetch("/emergency-pack.json").then((response) => response.json()).then((data: EmergencyPack) => { if (active) setPack(data); }).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { const { latitude, longitude } = position.coords; setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`); },
        () => setLocationError(true),
        { timeout: 8000 },
      );
    }
    try {
      const events = JSON.parse(localStorage.getItem("yatraai:sos-events") || "[]");
      events.push({ ts: Date.now() });
      localStorage.setItem("yatraai:sos-events", JSON.stringify(events.slice(-20)));
    } catch {}
    return () => { active = false; };
  }, []);

  if (!pack) {
    return <div className="app-shell flex min-h-screen items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-river border-t-transparent" aria-label="Loading emergency information" /></div>;
  }

  return (
    <div className="app-shell page-shell">
      <header className="page-topbar">
        <Link href="/" className="back-link" aria-label="Back to home"><ArrowLeft size={17} strokeWidth={2.1} /></Link>
        <div className="page-heading"><h1>Emergency help</h1><p>Fast, clear support when you need it.</p></div>
      </header>

      <section className="emergency-hero">
        <div className="emergency-hero__title"><ShieldAlert size={18} /><span>SOS works offline</span></div>
        <p className="emergency-hero__copy">Call a local service, share a message, or use the information below to decide your next step.</p>
      </section>

      <div className="emergency-grid">
        {pack.emergency_numbers.map((number) => (
          <a key={number.number} href={`tel:${number.number}`} className="emergency-call pressable">
            <Phone size={17} className="emergency-call__icon" strokeWidth={2.1} />
            <span><span className="emergency-call__label block">{number.label}</span><span className="emergency-call__number block">{number.number}</span></span>
          </a>
        ))}
      </div>

      <section className="emergency-section info-card">
        <div className="section-heading"><MapPin size={16} /><span>Your location</span></div>
        <p className="location-value">{location ?? (locationError ? "Location unavailable" : "Acquiring your location…")}</p>
      </section>

      <a href="sms:" className="sos-message pressable"><MessageSquare size={16} /><span>Send SOS message</span></a>

      <section className="emergency-section">
        <div className="section-heading"><Building2 size={16} /><span>Nearest hospitals</span></div>
        <ul className="hospital-list">
          {pack.hospitals.map((hospital) => <li key={hospital.phone} className="hospital-row"><span className="hospital-row__name">{hospital.name}</span><a href={`tel:${hospital.phone}`} className="hospital-row__call">Call</a></li>)}
        </ul>
      </section>

      <section className="emergency-section">
        <div className="section-heading"><ListChecks size={16} /><span>What to do now</span></div>
        <ul className="instruction-list">
          {pack.instructions.map((line, index) => <li key={index} className="instruction-row"><CheckCircle2 size={15} /><span>{line}</span></li>)}
        </ul>
      </section>

      <BottomNav />
    </div>
  );
}
