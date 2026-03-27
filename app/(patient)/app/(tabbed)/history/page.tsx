import Link from "next/link";
import { Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EncounterCard } from "@/components/patient/encounter-card";
import { createClient } from "@/lib/supabase/server";
import { getPatientByUserId } from "@/domains/patients/queries";
import { getEncountersByPatient } from "@/domains/encounters/queries";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const patient = user ? (await getPatientByUserId(user.id)).data : null;
  const encounters = patient
    ? (await getEncountersByPatient(patient.id)).data ?? []
    : [];

  // Group by calendar month
  const grouped: Record<string, typeof encounters> = {};
  for (const enc of encounters) {
    const key = new Date(enc.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    (grouped[key] ??= []).push(enc);
  }

  return (
    <div className="page-container py-6 flex flex-col gap-6 animate-page-in">
      <PageHeader
        title="History"
        subtitle="Your past symptom checks and assessments"
      />

      {encounters.length === 0 ? (
        <EmptyState
          variant="dashed"
          icon={<Clock className="h-6 w-6" />}
          title="No history yet"
          description="Your past visits will appear here."
          action={
            <Button asChild size="sm" variant="soft">
              <Link href="/app/check">Start a check</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([month, encs]) => (
            <div key={month} className="flex flex-col gap-3">
              <div className="divider-label">{month}</div>
              {encs.map((enc) => (
                <EncounterCard key={enc.id} encounter={enc} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
