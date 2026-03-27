import { createClient } from "@/lib/supabase/server";
import { getPatientByUserId } from "@/domains/patients/queries";
import { PatientHeader } from "@/components/layout/patient-header";
import { BottomNav } from "@/components/layout/bottom-nav";

/**
 * Tabbed layout — /app, /app/history, /app/profile.
 * Fetches patient name here so PatientHeader can show the avatar initials
 * without each page needing to re-fetch.
 */
export default async function TabbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const patient = user ? (await getPatientByUserId(user.id)).data : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PatientHeader name={patient?.fullName} />
      <main className="flex-1 screen">{children}</main>
      <BottomNav />
    </div>
  );
}
