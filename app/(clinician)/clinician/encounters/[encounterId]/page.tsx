import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  FileText,
  MapPin,
  Phone,
  Pill,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TriageResultCard } from "@/components/encounter/triage-result-card";
import { EncounterActionPanel } from "@/components/clinician/encounter-action-panel";
import { getEncounterById } from "@/domains/encounters/queries";
import { getPatientById } from "@/domains/patients/queries";
import { getCategoryById } from "@/domains/symptoms/categories";
import { formatDate, formatRelativeTime, initials, formatCondition } from "@/lib/utils";

export const metadata = { title: "Encounter Review" };

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

const SEX_LABELS: Record<string, string> = {
  male:              "Male",
  female:            "Female",
  other:             "Other",
  prefer_not_to_say: "—",
};

function statusBadgeVariant(status: string) {
  if (status === "closed")      return "closed"      as const;
  if (status === "reviewed")    return "reviewed"    as const;
  if (status === "in_progress") return "in_progress" as const;
  return "pending" as const;
}

export default async function EncounterReviewPage({ params }: PageProps) {
  const { encounterId } = await params;

  const encounterResult = await getEncounterById(encounterId);
  if (!encounterResult.data) notFound();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const enc = encounterResult.data!;

  const patientResult = await getPatientById(enc.patientId);
  const patient = patientResult.data;

  const ctx      = enc.intakeContext;
  const category = ctx ? getCategoryById(ctx.categoryId) : undefined;

  const dangerSignLabels =
    ctx && ctx.dangerSigns.length > 0 && category
      ? ctx.dangerSigns
          .map((id) => category.dangerSigns.find((d) => d.id === id)?.label ?? id)
          .filter(Boolean)
      : [];

  const hasConditions = ctx && ctx.conditions.filter((c) => c !== "none").length > 0;

  const dob = patient ? new Date(patient.dateOfBirth) : null;
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 flex flex-col gap-5">

      {/* Breadcrumb row */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/clinician/queue"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Queue
        </Link>
        <Badge variant={statusBadgeVariant(enc.status)}>
          {STATUS_LABELS[enc.status]}
        </Badge>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight leading-tight">
          {enc.chiefComplaint}
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          #{encounterId.slice(0, 8)}
          <span className="font-sans mx-1.5 opacity-50">·</span>
          {formatRelativeTime(enc.createdAt)}
          <span className="mx-1.5 opacity-50">·</span>
          {formatDate(enc.createdAt)}
        </p>
      </div>

      {/* ── Two-column desktop layout ──────────────────────────────────── */}
      <div className="flex flex-col gap-5 md:grid md:grid-cols-[260px_1fr] md:items-start md:gap-6">

        {/* ── Left sidebar ──────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4 md:sticky md:top-[105px]">

          {/* Patient card */}
          <Card>
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar size="default">
                  <AvatarFallback>
                    {patient ? initials(patient.fullName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">
                    {patient?.fullName ?? "Unknown patient"}
                  </p>
                  {age !== null && patient && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {age} yrs · {SEX_LABELS[patient.sex] ?? patient.sex}
                    </p>
                  )}
                </div>
              </div>

              {patient && (
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 shrink-0" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 shrink-0" />
                    DOB {formatDate(patient.dateOfBirth)}
                  </div>
                  {patient.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {patient.location}
                    </div>
                  )}
                </div>
              )}

              {patient && (
                <Link
                  href={`/clinician/patients/${patient.id}`}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View full profile →
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Intake context — medication & conditions */}
          {ctx && (ctx.takesMedication || hasConditions) && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5" />
                  Medical context
                </p>

                {ctx.takesMedication && (
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">
                      Medication
                    </p>
                    <p className="text-xs leading-relaxed">
                      {ctx.medication ?? "Taking medication (unspecified)"}
                    </p>
                  </div>
                )}

                {hasConditions && (
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-1.5">
                      Known conditions
                    </p>
                    <div className="flex flex-wrap gap-1">
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

          {/* Timeline */}
          <Card>
            <CardContent className="p-4 space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Timeline
              </p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">Submitted</p>
                    <p>{formatDate(enc.createdAt)}</p>
                  </div>
                </div>
                {(enc.status === "reviewed" || enc.status === "closed") && (
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">Reviewed</p>
                      <p>{formatDate(enc.updatedAt)}</p>
                    </div>
                  </div>
                )}
                {enc.closedAt && (
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">Closed</p>
                      <p>{formatDate(enc.closedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* ── Main column ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Triage result */}
          {enc.triageOutcome && (
            <TriageResultCard outcome={enc.triageOutcome} />
          )}

          {/* Reported symptoms */}
          {enc.symptoms.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Reported Symptoms
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
          )}

          {/* Danger signs */}
          {dangerSignLabels.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Warning Signs Reported
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

          {/* Action panel */}
          <EncounterActionPanel
            encounterId={enc.id}
            status={enc.status}
            initialDiagnosis={enc.diagnosis ?? ""}
            initialNotes={enc.clinicianNotes ?? ""}
            initialPrescription={enc.prescription ?? ""}
            initialReferral={enc.referral ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
