import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Home, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TriageResultCard } from "@/components/encounter/triage-result-card";
import { getEncounterById } from "@/domains/encounters/queries";

interface PageProps {
  params: Promise<{ encounterId: string }>;
}

const SEVERITY_LABELS: Record<string, string> = {
  mild:     "Mild",
  moderate: "Moderate",
  severe:   "Severe",
};

const DURATION_LABELS: Record<string, string> = {
  less_than_1_day:  "< 1 day",
  "1_3_days":       "1–3 days",
  "4_7_days":       "4–7 days",
  more_than_1_week: "> 1 week",
};

export default async function TriageOutcomePage({ params }: PageProps) {
  const { encounterId } = await params;
  const result = await getEncounterById(encounterId);
  if (!result.data) notFound();

  const enc = result.data;

  return (
    <div className="min-h-screen flex flex-col bg-background animate-page-in">
      {/* Success header */}
      <div className="bg-primary px-5 pt-14 pb-8 flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Check complete</h1>
          <p className="text-sm text-white/70 mt-0.5">
            Your symptoms have been reviewed
          </p>
        </div>
      </div>

      <div className="flex-1 page-container py-6 flex flex-col gap-5">
        {/* Chief complaint */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
            Chief complaint
          </p>
          <p className="text-base font-semibold">{enc.chiefComplaint}</p>
        </div>

        {/* Triage result */}
        {enc.triageOutcome && (
          <TriageResultCard outcome={enc.triageOutcome} />
        )}

        {/* Symptoms summary */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              Reported symptoms
            </h2>
            <div className="divide-y divide-border/60">
              {enc.symptoms.map((s) => (
                <div
                  key={s.symptomId}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <span className="text-sm">{s.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" size="sm">
                      {SEVERITY_LABELS[s.severity]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {DURATION_LABELS[s.duration]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What happens next */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-2">What happens next?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A clinician will review your submission and may follow up with
              additional guidance. You can track the status in your visit
              history.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4 flex flex-col gap-2">
        <Button asChild size="xl">
          <Link href="/app">
            <Home className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/app/history">View visit history</Link>
        </Button>
      </div>
    </div>
  );
}
