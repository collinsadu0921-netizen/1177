import Link from "next/link";
import { Stethoscope, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EncounterCard } from "@/components/patient/encounter-card";
import { createClient } from "@/lib/supabase/server";
import { getPatientByUserId } from "@/domains/patients/queries";
import { getEncountersByPatient } from "@/domains/encounters/queries";

export const metadata = { title: "Home" };

export default async function HomePage() {
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

  const recentEncounters = encounters.slice(0, 3);
  const firstName = patient?.fullName.split(" ")[0] ?? "there";

  return (
    <div className="page-container py-6 flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          Hi, {firstName}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          How are you feeling today?
        </p>
      </div>

      {/* Primary CTA */}
      <Link href="/encounter/new">
        <Card className="bg-primary text-primary-foreground border-0 shadow-lg cursor-pointer active:scale-[0.99] transition-transform">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-base">Start Symptom Check</p>
                  <p className="text-sm text-primary-foreground/80 mt-0.5">
                    Takes about 2 minutes
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary-foreground/70" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Recent encounters */}
      {recentEncounters.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Recent
            </h2>
            <Link
              href="/history"
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {recentEncounters.map((enc) => (
            <EncounterCard key={enc.id} encounter={enc} />
          ))}
        </div>
      )}

      {/* Empty state for first-time users */}
      {encounters.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">No visits yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a symptom check when you&apos;re not feeling well.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile prompt if not set up */}
      {!patient && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-amber-800">
              Complete your health profile for better care
            </p>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link href="/profile">Set up</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
