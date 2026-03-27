import { ClinicianHeader } from "@/components/layout/clinician-header";

export default function ClinicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClinicianHeader />
      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
}
