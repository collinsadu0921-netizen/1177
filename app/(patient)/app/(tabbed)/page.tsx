import Link from "next/link";
import { Stethoscope, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { PageHeader } from "@/components/ui/page-header";
import { EncounterCard } from "@/components/patient/encounter-card";
import { createClient } from "@/lib/supabase/server";
import { getPatientByUserId } from "@/domains/patients/queries";
import { getEncountersByPatient } from "@/domains/encounters/queries";

export const metadata = { title: "Home" };

export default async function PatientHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const patient = user ? (await getPatientByUserId(user.id)).data : null;
  const encounters = patient
    ? (await getEncountersByPatient(patient.id)).data ?? []
    : [];

  const recentEncounters = encounters.slice(0, 3);
  const firstName = patient?.fullName.split(" ")[0] ?? "there";

  return (
    <div className="page-container py-6 flex flex-col gap-6 animate-page-in">
      {/* Greeting */}
      <PageHeader
        title={`Hi, ${firstName}`}
        subtitle="How are you feeling today?"
        size="lg"
      />

      {/* Profile setup prompt */}
      {!patient && (
        <Card className="border border-amber-200 bg-amber-50/80 shadow-none">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-900">Complete your profile</p>
              <p className="text-xs text-amber-700 mt-0.5">
                We need a few details to personalise your care.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100">
              <Link href="/app/profile">Set up</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Primary CTA */}
      <Link href="/app/check" className="block">
        <Card className="bg-primary text-primary-foreground border-0 shadow-elevated cursor-pointer active:scale-[0.99] transition-transform">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-base leading-tight">Start Symptom Check</p>
                  <p className="text-sm text-primary-foreground/75 mt-0.5">
                    Takes about 2 minutes
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary-foreground/70 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Recent encounters */}
      {recentEncounters.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Recent"
            variant="subtle"
            action={
              <Link
                href="/app/history"
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline underline-offset-2"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            }
          />
          {recentEncounters.map((enc) => (
            <EncounterCard key={enc.id} encounter={enc} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {encounters.length === 0 && patient && (
        <EmptyState
          variant="dashed"
          icon={<Stethoscope className="h-6 w-6" />}
          title="No visits yet"
          description="Start a symptom check when you're not feeling well."
        />
      )}
    </div>
  );
}
