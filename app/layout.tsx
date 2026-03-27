import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    template: "%s | eHealth",
    default: "eHealth — Your digital health companion",
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
  themeColor: "#0284C7",
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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          "selection:bg-primary/20 selection:text-primary"
        )}
      >
        {children}
      </body>
    </html>
  );
}
