import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopCalci — Dairy Parlour Sales Tracker & Counter POS",
  description: "Offline-first sales recording, auto-calculation, and trend tracker for retail dairy parlours.",
  applicationName: "ShopCalci",
  appleWebApp: {
    capable: true,
    title: "ShopCalci",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0369a1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-100">
      <body className="min-h-full flex flex-col antialiased text-slate-900 bg-slate-100">
        {children}
      </body>
    </html>
  );
}
