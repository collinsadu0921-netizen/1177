import Link from "next/link";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EncounterCard } from "@/components/patient/encounter-card";
import { createClient } from "@/lib/supabase/server";
import { getPatientByUserId } from "@/domains/patients/queries";
import { getEncountersByPatient } from "@/domains/encounters/queries";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const patient = user
    ? (await getPatientByUserId(user.id)).data
    : null;

  const encounters = patient
    ? (await getEncountersByPatient(patient.id)).data ?? []
    : [];

  // Group encounters by month
  const grouped: Record<string, typeof encounters> = {};
  for (const enc of encounters) {
    const monthKey = new Date(enc.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(enc);
  }

  return (
    <div className="page-container py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your past symptom checks and assessments
        </p>
      </div>

      {encounters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 flex flex-col items-center text-center gap-3">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No history yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your past visits will appear here.
              </p>
            </div>
            <Link
              href="/encounter/new"
              className="text-sm text-primary font-medium underline underline-offset-2 mt-2"
            >
              Start a symptom check
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([month, encs]) => (
            <div key={month} className="flex flex-col gap-3">
              {/* Month separator */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {month}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
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
