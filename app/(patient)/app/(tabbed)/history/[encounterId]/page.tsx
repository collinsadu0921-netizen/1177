import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TriageResultCard } from "@/components/encounter/triage-result-card";
import { getEncounterById } from "@/domains/encounters/queries";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Visit detail" };

interface PageProps {
  params: Promise<{ encounterId: string }>;
}

const STATUS_LABELS = {
  in_progress:    "In Progress",
  pending_review: "Pending Review",
  reviewed:       "Reviewed",
  closed:         "Closed",
} as const;

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

export default async function HistoryEncounterPage({ params }: PageProps) {
  const { encounterId } = await params;
  const result = await getEncounterById(encounterId);
  if (!result.data) notFound();

  const enc = result.data;

  return (
    <div className="page-container py-6 flex flex-col gap-5 animate-page-in">
      {/* Back */}
      <Link
        href="/app/history"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        History
      </Link>

      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-tight">
            {enc.chiefComplaint}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(enc.createdAt)}
          </p>
        </div>
        <Badge
          variant={enc.status === "closed" ? "closed" : enc.status === "reviewed" ? "reviewed" : "pending"}
          className="shrink-0"
        >
          {STATUS_LABELS[enc.status]}
        </Badge>
      </div>

      {/* Triage result */}
      {enc.triageOutcome && <TriageResultCard outcome={enc.triageOutcome} />}

      {/* Symptoms */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            Reported Symptoms
          </h2>
          <div className="divide-y divide-border/60">
            {enc.symptoms.map((s) => (
              <div key={s.symptomId} className="py-2.5 flex items-center justify-between gap-3">
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

      {/* Clinician notes */}
      {enc.clinicianNotes && (
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              Clinician Notes
            </h2>
            <p className="text-sm leading-relaxed">{enc.clinicianNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Submitted {formatDate(enc.createdAt)}
        </div>
        {enc.closedAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Closed {formatDate(enc.closedAt)}
          </div>
        )}
      </div>
    </div>
  );
}
