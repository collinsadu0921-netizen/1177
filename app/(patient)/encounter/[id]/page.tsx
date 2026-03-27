import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TriageResultCard } from "@/components/encounter/triage-result-card";
import { getEncounterById } from "@/domains/encounters/queries";
import { formatDate } from "@/lib/utils";
import { triageBadgeVariant } from "@/domains/triage/engine";

export const metadata = { title: "Encounter" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EncounterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getEncounterById(id);

  if (!result.data) notFound();

  const enc = result.data;

  const STATUS_LABELS: Record<typeof enc.status, string> = {
    in_progress: "In Progress",
    pending_review: "Pending Review",
    reviewed: "Reviewed",
    closed: "Closed",
  };

  const SEVERITY_LABELS: Record<string, string> = {
    mild: "Mild",
    moderate: "Moderate",
    severe: "Severe",
  };

  const DURATION_LABELS: Record<string, string> = {
    less_than_1_day: "< 1 day",
    "1_3_days": "1–3 days",
    "4_7_days": "4–7 days",
    more_than_1_week: "> 1 week",
  };

  return (
    <div className="page-container py-6 flex flex-col gap-5">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Link
          href="/history"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          History
        </Link>
      </div>

      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight">{enc.chiefComplaint}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(enc.createdAt)}
          </p>
        </div>
        <Badge
          variant={
            enc.status === "closed"
              ? "closed"
              : enc.status === "reviewed"
              ? "reviewed"
              : "pending"
          }
        >
          {STATUS_LABELS[enc.status]}
        </Badge>
      </div>

      {/* Triage outcome */}
      {enc.triageOutcome && (
        <TriageResultCard outcome={enc.triageOutcome} />
      )}

      {/* Symptoms */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Reported Symptoms
          </h2>
          <div className="flex flex-col divide-y divide-border">
            {enc.symptoms.map((s) => (
              <div key={s.symptomId} className="py-2.5 flex items-center justify-between">
                <span className="text-sm">{s.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
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

      {/* Clinician notes (if reviewed/closed) */}
      {enc.clinicianNotes && (
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Clinician Notes
            </h2>
            <p className="text-sm text-foreground leading-relaxed">
              {enc.clinicianNotes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Submitted on {formatDate(enc.createdAt)}</span>
        </div>
        {enc.closedAt && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Closed on {formatDate(enc.closedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
