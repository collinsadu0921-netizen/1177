import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  FileText,
  Pill,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TriageResultCard } from "@/components/encounter/triage-result-card";
import { getEncounterById } from "@/domains/encounters/queries";
import { getCategoryById } from "@/domains/symptoms/categories";
import { formatDate, formatCondition } from "@/lib/utils";

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

function statusBadgeVariant(status: string) {
  if (status === "closed")         return "closed"    as const;
  if (status === "reviewed")       return "reviewed"  as const;
  if (status === "in_progress")    return "in_progress" as const;
  return "pending" as const;
}

export default async function HistoryEncounterPage({ params }: PageProps) {
  const { encounterId } = await params;
  const result = await getEncounterById(encounterId);

  if (!result.data) notFound();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const enc = result.data!;

  const ctx      = enc.intakeContext;
  const category = ctx ? getCategoryById(ctx.categoryId) : undefined;

  // Build danger sign labels from the category config
  const dangerSignLabels =
    ctx && ctx.dangerSigns.length > 0 && category
      ? ctx.dangerSigns
          .map((id) => category.dangerSigns.find((d) => d.id === id)?.label ?? id)
          .filter(Boolean)
      : [];

  const hasConditions = ctx && ctx.conditions.filter((c) => c !== "none").length > 0;

  return (
    <div className="page-container py-6 flex flex-col gap-5 animate-page-in">

      {/* Back link */}
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
        <Badge variant={statusBadgeVariant(enc.status)} className="shrink-0">
          {STATUS_LABELS[enc.status]}
        </Badge>
      </div>

      {/* Triage result */}
      {enc.triageOutcome && <TriageResultCard outcome={enc.triageOutcome} />}

      {/* Symptoms */}
      {enc.symptoms.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" aria-hidden />
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
      )}

      {/* Danger signs */}
      {dangerSignLabels.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Warning signs reported
            </h2>
            <ul className="space-y-1.5">
              {dangerSignLabels.map((label) => (
                <li key={label} className="flex items-start gap-2 text-sm text-red-800">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Medication & conditions */}
      {ctx && (ctx.takesMedication || hasConditions) && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Pill className="h-4 w-4" aria-hidden />
              Medical context
            </h2>

            {ctx.takesMedication && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  Current medication
                </p>
                <p className="text-sm">
                  {ctx.medication ?? "Patient indicated they take medication"}
                </p>
              </div>
            )}

            {hasConditions && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  Known conditions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ctx.conditions
                    .filter((c) => c !== "none")
                    .map((c) => (
                      <Badge key={c} variant="secondary" size="sm">
                        {formatCondition(c)}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clinician output */}
      {(enc.clinicianNotes || enc.diagnosis || enc.prescription || enc.referral) && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" aria-hidden />
              From your clinician
            </h2>
            {enc.clinicianNotes && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Notes</p>
                <p className="text-sm leading-relaxed">{enc.clinicianNotes}</p>
              </div>
            )}
            {enc.diagnosis && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Diagnosis</p>
                <p className="text-sm leading-relaxed">{enc.diagnosis}</p>
              </div>
            )}
            {enc.prescription && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Prescription</p>
                <p className="text-sm leading-relaxed">{enc.prescription}</p>
              </div>
            )}
            {enc.referral && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Referral</p>
                <p className="text-sm leading-relaxed">{enc.referral}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <div className="space-y-1 text-xs text-muted-foreground pb-6">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Submitted {formatDate(enc.createdAt)}
        </div>
        {enc.closedAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            Closed {formatDate(enc.closedAt)}
          </div>
        )}
      </div>
    </div>
  );
}
