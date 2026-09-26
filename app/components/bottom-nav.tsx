"use client";

import Link from "next/link";
import { Camera, Home, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <Link
        href="/"
        className={`bottom-nav__link ${pathname === "/" ? "bottom-nav__link--active" : ""}`}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <Home size={17} strokeWidth={pathname === "/" ? 2.4 : 1.9} />
        <span>Home</span>
      </Link>
      <Link href="/scan" className="bottom-nav__scan" aria-label="Scan">
        <Camera size={21} strokeWidth={2} />
      </Link>
      <Link
        href="/settings"
        className={`bottom-nav__link ${pathname === "/settings" ? "bottom-nav__link--active" : ""}`}
        aria-current={pathname === "/settings" ? "page" : undefined}
      >
        <Settings size={17} strokeWidth={pathname === "/settings" ? 2.4 : 1.9} />
        <span>Settings</span>
      </Link>
    </nav>
  );
}
