import { notFound } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowLeft, Calendar, MapPin, Phone, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getPatientById } from "@/domains/patients/queries";
import { getEncountersByPatient } from "@/domains/encounters/queries";
import { triageBadgeVariant } from "@/domains/triage/engine";
import { initials, formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

const SEX_LABELS: Record<string, string> = {
  male:              "Male",
  female:            "Female",
  other:             "Other",
  prefer_not_to_say: "Prefer not to say",
};

const STATUS_LABELS: Record<string, string> = {
  in_progress:    "In Progress",
  pending_review: "Pending",
  reviewed:       "Reviewed",
  closed:         "Closed",
};

function statusBadgeVariant(status: string) {
  if (status === "closed")      return "closed"      as const;
  if (status === "reviewed")    return "reviewed"    as const;
  if (status === "in_progress") return "in_progress" as const;
  return "pending" as const;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const { patientId } = await params;

  const [patientResult, encountersResult] = await Promise.all([
    getPatientById(patientId),
    getEncountersByPatient(patientId),
  ]);

  if (!patientResult.data) notFound();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const patient    = patientResult.data!;
  const encounters = encountersResult.data ?? [];

  const dob = new Date(patient.dateOfBirth);
  const age = Math.floor(
    (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-5">

      {/* Back */}
      <Link
        href="/clinician/patients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Patients
      </Link>

      {/* Patient header card */}
      <Card>
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{initials(patient.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{patient.fullName}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {age} yrs · {SEX_LABELS[patient.sex] ?? patient.sex}
              </p>
            </div>
          </div>

          {/* Contact & demographics */}
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {patient.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              DOB {formatDate(patient.dateOfBirth)}
            </div>
            {patient.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {patient.location}
              </div>
            )}
          </div>

          {/* Emergency contact */}
          {patient.emergencyContact && (
            <div className="pt-3 border-t border-border/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Emergency contact
              </p>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{patient.emergencyContact.name}</span>
                  <span className="text-muted-foreground text-xs">
                    · {patient.emergencyContact.relationship}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {patient.emergencyContact.phone}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encounter history */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Visit History ({encounters.length})
        </h2>

        {encounters.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-6 w-6 text-muted-foreground" />}
            title="No visits yet"
            description="This patient has not submitted any encounters."
            variant="dashed"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {encounters.map((enc) => (
              <Link
                key={enc.id}
                href={`/clinician/encounters/${enc.id}`}
              >
                <Card interactive>
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-snug line-clamp-1">
                        {enc.chiefComplaint}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(enc.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {enc.triageOutcome && (
                        <Badge
                          variant={triageBadgeVariant(enc.triageOutcome.level)}
                          size="sm"
                          dot
                        >
                          {enc.triageOutcome.label}
                        </Badge>
                      )}
                      <Badge variant={statusBadgeVariant(enc.status)} size="sm">
                        {STATUS_LABELS[enc.status]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
