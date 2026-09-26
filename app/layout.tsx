import type { Metadata } from "next";
import "./globals.css";
import PWAProvider from "./pwa-provider";
import OfflineIndicator from "./offline-indicator";

export const metadata: Metadata = {
  title: "YatraAI",
  description: "Scan. Understand. Stay safe. A lightweight AI PWA for Bharatpur.",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/icon-192.svg" },
  ],
};

export const viewport = {
  themeColor: "#eef2ef",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <OfflineIndicator />
        <PWAProvider />
        {children}
      </body>
    </html>
  );
}
