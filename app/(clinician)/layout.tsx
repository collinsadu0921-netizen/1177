import { createClient } from "@/lib/supabase/server";
import { ClinicianHeader } from "@/components/layout/clinician-header";
import { ClinicianNav } from "@/components/layout/clinician-nav";
import { getClinicianByUserId } from "@/domains/clinicians/queries";
import { getClinicianQueue } from "@/domains/encounters/queries";

export default async function ClinicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [clinicianResult, queueResult] = await Promise.all([
    user ? getClinicianByUserId(user.id) : Promise.resolve({ data: null, error: null }),
    getClinicianQueue(),
  ]);

  const clinician   = clinicianResult.data;
  const queueCount  = queueResult.data?.filter((i) => i.status === "pending_review").length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClinicianHeader name={clinician?.fullName} queueCount={queueCount} />
      <ClinicianNav />
      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
}
