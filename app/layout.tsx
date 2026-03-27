import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// ── Inter: loaded via next/font for zero-CLS, self-hosted subset ──
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  // Load all weights we use: 400 body, 500 medium, 600 semibold, 700 bold
  weight: ["400", "500", "600", "700"],
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    template: "%s · eHealth",
    default: "eHealth",
  },
  description:
    "Check your symptoms, get a triage assessment, and connect with a clinician — all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "eHealth",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          "font-sans"
        )}
      >
        {children}
      </body>
    </html>
  );
}
