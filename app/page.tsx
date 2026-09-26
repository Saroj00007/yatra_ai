import Link from "next/link";
import {
  ArrowRight,
  Camera,
  ChevronRight,
  History,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  Settings,
  ShieldAlert,
  Siren,
} from "lucide-react";

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
    <div className="relative flex min-h-screen flex-col bg-white text-zinc-900">
      {/* App header */}
      <header className="px-5 pt-14 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-zinc-400">{greeting}</p>
            <h1 className="mt-0.5 text-[26px] font-bold leading-tight tracking-tight">
              Explore Bharatpur
            </h1>
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1">
              <MapPin size={12} className="text-zinc-500" strokeWidth={2.4} />
              <span className="text-[11px] font-medium text-zinc-600">
                Bharatpur, Nepal
              </span>
            </div>
          </div>
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:scale-95 transition-transform"
          >
            <Settings size={18} strokeWidth={2.2} />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 pb-36">
        {/* Scan hero — the core feature */}
        <Link
          href="/scan"
          className="group relative mt-4 block overflow-hidden rounded-[32px] bg-zinc-950 p-7 active:scale-[0.98] transition-transform"
        >
          <span className="pointer-events-none absolute left-5 top-5 h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-white/25" />
          <span className="pointer-events-none absolute right-5 top-5 h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-white/25" />
          <span className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 rounded-bl-2xl border-b-2 border-l-2 border-white/25" />
          <span className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-white/25" />

          <div className="relative flex flex-col items-center py-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <Camera size={26} className="text-white" strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 text-[19px] font-semibold text-white">
              Scan anything
            </h2>
            <p className="mt-1.5 max-w-[230px] text-[13px] leading-relaxed text-zinc-400">
              Point your camera at a landmark, sign, or object for an instant,
              easy explanation
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-zinc-900">
              Open camera
              <ArrowRight size={13} strokeWidth={2.4} />
            </span>
          </div>
        </Link>

        {/* Supporting quick actions */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <FeatureTile
            href="/scan"
            icon={MessageCircle}
            title="Ask AI"
            subtitle="Type a question"
          />
          <FeatureTile
            href="/scan"
            icon={History}
            title="History"
            subtitle="Recent scans"
          />
        </div>

        {/* SOS — supporting safety feature, kept modest */}
        <Link
          href="/sos"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3.5 active:scale-[0.98] transition-transform"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100">
            <ShieldAlert size={16} className="text-rose-600" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-rose-700">
              Emergency SOS
            </p>
            <p className="text-[11px] text-rose-400">
              Always available · works offline
            </p>
          </div>
          <ChevronRight size={16} className="text-rose-300" />
        </Link>
      </main>

      {/* Floating SOS quick-access button */}
      <Link
        href="/sos"
        aria-label="Emergency SOS"
        className="fixed bottom-[100px] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 shadow-lg shadow-rose-600/30 active:scale-95 transition-transform"
      >
        <Siren size={19} className="text-white" strokeWidth={2} />
      </Link>

      {/* Native-style bottom tab bar with raised scan action */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-100 bg-white/95 backdrop-blur pb-safe">
        <div className="relative flex h-[64px] items-center justify-around px-8">
          <NavTab href="/" icon={HomeIcon} label="Home" active />
          <span className="w-14" aria-hidden />
          <NavTab href="/settings" icon={Settings} label="Settings" />
        </div>
        <Link
          href="/scan"
          aria-label="Scan"
          className="absolute -top-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-zinc-950 shadow-lg shadow-zinc-900/25 active:scale-95 transition-transform"
        >
          <Camera size={22} className="text-white" strokeWidth={1.8} />
        </Link>
      </nav>
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
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
        <Icon size={18} className="text-zinc-700" strokeWidth={2} />
      </span>
      <div>
        <p className="text-[14px] font-semibold text-zinc-900">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-zinc-500">{subtitle}</p>
      </div>
    </Link>
  );
}

function NavTab({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
        active ? "text-zinc-900" : "text-zinc-400"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.2 : 1.9} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}