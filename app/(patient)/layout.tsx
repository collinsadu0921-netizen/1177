import { PatientHeader } from "@/components/layout/patient-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PatientHeader />
      <main className="flex-1 screen">{children}</main>
      <BottomNav />
    </div>
  );
}
