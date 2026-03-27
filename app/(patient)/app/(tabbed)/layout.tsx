import { PatientHeader } from "@/components/layout/patient-header";
import { BottomNav } from "@/components/layout/bottom-nav";

/**
 * Tabbed layout — all /app/* pages that use the persistent bottom nav.
 * Applies to: /app, /app/history, /app/history/[id], /app/profile
 */
export default function TabbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PatientHeader />
      <main className="flex-1 screen">{children}</main>
      <BottomNav />
    </div>
  );
}
