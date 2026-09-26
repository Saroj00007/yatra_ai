import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  History,
  MapPin,
  MessageCircle,
  Settings,
  ShieldAlert,
  Siren,
} from "lucide-react";
import BottomNav from "./components/bottom-nav";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const greeting = getGreeting();

  return (
    <div className="app-shell home-shell">
      <header className="home-header">
        <div>
          <div className="wordmark">
            <span className="wordmark-mark" aria-hidden="true">Y</span>
            <span>YatraAI</span>
          </div>
          <p className="greeting">{greeting}</p>
          <h1 className="home-title">See more in Bharatpur.</h1>
          <div className="place-chip">
            <MapPin size={13} strokeWidth={2.2} aria-hidden="true" />
            <span>Bharatpur, Nepal</span>
          </div>
        </div>
        <Link href="/settings" aria-label="Open settings" className="icon-button pressable">
          <Settings size={18} strokeWidth={2} />
        </Link>
      </header>

      <main>
        <Link href="/scan" className="scan-portal pressable">
          <div className="scan-portal__top">
            <span className="scan-portal__signal">Ready to look closer</span>
            <span className="scan-portal__mode">camera + text</span>
          </div>
          <div className="scan-portal__content">
            <span className="scan-portal__icon" aria-hidden="true">
              <Camera size={24} strokeWidth={1.9} />
            </span>
            <h2>Point. Discover.</h2>
            <p>Turn a landmark, sign, or local object into a useful story.</p>
            <div className="scan-portal__bottom">
              <span className="primary-action">
                Open the guide
                <ArrowUpRight size={14} strokeWidth={2.3} />
              </span>
              <span className="scan-portal__hint">Works with a photo</span>
            </div>
          </div>
        </Link>

        <div className="tile-grid">
          <FeatureTile href="/scan" icon={MessageCircle} title="Ask a question" subtitle="Type what you want to know" />
          <FeatureTile href="/scan" icon={History} title="Your trail" subtitle="Come back to recent scans" />
        </div>

        <Link href="/sos" className="safety-strip pressable">
          <span className="safety-strip__icon" aria-hidden="true">
            <ShieldAlert size={17} strokeWidth={2.1} />
          </span>
          <span className="safety-strip__copy">
            <span className="safety-strip__title">Emergency help</span>
            <span className="safety-strip__detail">Cached on your device · available offline</span>
          </span>
          <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </main>

      <Link href="/sos" aria-label="Open emergency SOS" className="sos-fab pressable">
        <Siren size={18} strokeWidth={2.1} />
      </Link>
      <BottomNav />
    </div>
  );
}

function FeatureTile({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} className="feature-tile pressable">
      <span className="feature-tile__icon" aria-hidden="true">
        <Icon size={17} strokeWidth={2} />
      </span>
      <span>
        <span className="feature-tile__title block">{title}</span>
        <span className="feature-tile__subtitle block">{subtitle}</span>
      </span>
    </Link>
  );
}
