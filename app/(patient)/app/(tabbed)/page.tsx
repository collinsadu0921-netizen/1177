import Link from "next/link";
import { Stethoscope, ChevronRight, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EncounterCard } from "@/components/patient/encounter-card";
import { CareTipCard } from "@/components/patient/care-tip-card";
import { createClient } from "@/lib/supabase/server";
import { getPatientByUserId } from "@/domains/patients/queries";
import { getEncountersByPatient } from "@/domains/encounters/queries";

export const metadata = { title: "Home" };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function PatientHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const patient = user ? (await getPatientByUserId(user.id)).data : null;
  const encounters = patient
    ? (await getEncountersByPatient(patient.id)).data ?? []
    : [];

  const recentEncounters = encounters.slice(0, 3);
  const firstName = patient?.fullName?.split(" ")[0] ?? "there";
  const greeting  = getGreeting();
  const hasProfile = !!patient;

  return (
    <div className="page-container py-6 flex flex-col gap-6 animate-page-in">

      {/* ── Greeting ───────────────────────────────────────────────────── */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {greeting}, {firstName}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          How are you feeling today?
        </p>
      </div>

      {/* ── Profile incomplete banner ───────────────────────────────────── */}
      {!hasProfile && (
        <Card className="border-amber-200 bg-amber-50/80 shadow-none">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                Complete your profile
              </p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                We need a few details to personalise your care before you can
                start a health check.
              </p>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-3 border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                <Link href="/app/profile">Set up profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Primary CTA ────────────────────────────────────────────────── */}
      <Link href="/app/check" className="block" aria-label="Start health check">
        <div
          className={[
            "relative overflow-hidden rounded-2xl bg-primary px-5 py-5",
            "shadow-elevated active:scale-[0.99] transition-transform duration-100",
            !hasProfile ? "opacity-60 pointer-events-none" : "",
          ].join(" ")}
        >
          {/* Decorative circle */}
          <span
            className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10"
            aria-hidden
          />
          <span
            className="absolute -right-2 -bottom-8 h-20 w-20 rounded-full bg-white/5"
            aria-hidden
          />

          <div className="relative flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base text-white leading-tight">
                Start health check
              </p>
              <p className="text-sm text-white/70 mt-0.5">
                Guided symptom review — about 2 minutes
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-white/60 shrink-0" />
          </div>
        </div>
      </Link>

      {/* ── Recent encounters ──────────────────────────────────────────── */}
      {recentEncounters.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent visits
            </h2>
            {encounters.length > 3 && (
              <Link
                href="/app/history"
                className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline underline-offset-2"
              >
                View all{" "}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {recentEncounters.map((enc) => (
            <EncounterCard key={enc.id} encounter={enc} />
          ))}

          {/* Nudge to see full history if exactly 3 shown */}
          {encounters.length > 3 && (
            <Link href="/app/history" className="block">
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border/60 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                <ChevronRight className="h-4 w-4" />
                {encounters.length - 3} more visit{encounters.length - 3 !== 1 ? "s" : ""} in history
              </div>
            </Link>
          )}
        </section>
      )}

      {/* ── Empty state (profile exists, no encounters yet) ────────────── */}
      {hasProfile && encounters.length === 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent visits
          </h2>
          <div className="rounded-2xl border-2 border-dashed border-border/70 px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
              <Stethoscope className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1.5 max-w-[220px]">
              <p className="font-semibold text-sm">No visits yet</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use the health check to describe your symptoms and get an
                instant triage result.
              </p>
            </div>
            <Button asChild size="sm" variant="soft">
              <Link href="/app/check">Start your first check</Link>
            </Button>
          </div>
        </section>
      )}

      {/* ── Care tip ───────────────────────────────────────────────────── */}
      <CareTipCard />

    </div>
  );
}
