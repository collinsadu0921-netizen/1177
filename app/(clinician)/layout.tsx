import { ClinicianHeader } from "@/components/layout/clinician-header";
import { ClinicianNav } from "@/components/layout/clinician-nav";

export default function ClinicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClinicianHeader />
      <ClinicianNav />
      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
}
