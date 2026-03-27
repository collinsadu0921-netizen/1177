import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Calendar, Activity } from "lucide-react";
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
  male:             "Male",
  female:           "Female",
  other:            "Other",
  prefer_not_to_say:"Prefer not to say",
};

export default async function PatientDetailPage({ params }: PageProps) {
  const { patientId } = await params;

  const [patientResult, encountersResult] = await Promise.all([
    getPatientById(patientId),
    getEncountersByPatient(patientId),
  ]);

  if (!patientResult.data) notFound();

  const patient = patientResult.data;
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

      {/* Patient card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{initials(patient.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{patient.fullName}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {age} yrs · {SEX_LABELS[patient.sex] ?? patient.sex}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {patient.phone}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  DOB {formatDate(patient.dateOfBirth)}
                </span>
              </div>
            </div>
          </div>
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
                      <p className="font-medium text-sm leading-snug">
                        {enc.chiefComplaint}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(enc.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {enc.triageOutcome && (
                        <Badge
                          variant={triageBadgeVariant(enc.triageOutcome.level as never)}
                          size="sm"
                        >
                          {enc.triageOutcome.label}
                        </Badge>
                      )}
                      <Badge
                        variant={enc.status === "closed" ? "closed" : "pending"}
                        size="sm"
                      >
                        {enc.status.replace("_", " ")}
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
