"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  CheckCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TriageResultCard } from "@/components/encounter/triage-result-card";
import { closeEncounter } from "@/domains/encounters/actions";
import { formatDate } from "@/lib/utils";
import { triageBadgeVariant } from "@/domains/triage/engine";

// Note: In a real app, this would be a Server Component fetching from DB.
// For the MVP scaffold, data fetching is shown as a pattern to wire up.
// The page accepts params and handles the close action client-side.

interface PageProps {
  params: Promise<{ id: string }>;
}

// Placeholder encounter type for the scaffold
interface EncounterView {
  id: string;
  chiefComplaint: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
  clinicianNotes: string | null;
  triageOutcome: { level: string; label: string; recommendation: string; seekCareWithin: string } | null;
  symptoms: { symptomId: string; label: string; severity: string; duration: string }[];
  patient?: { fullName: string };
}

export default function ClinicianEncounterPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [closed, setClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (!notes.trim()) {
      setError("Please add clinical notes before closing.");
      return;
    }

    startTransition(async () => {
      // Clinician ID would come from session in production
      const result = await closeEncounter(id, "clinician-placeholder-id", notes);
      if (result.error) {
        setError(result.error);
        return;
      }
      setClosed(true);
      setTimeout(() => router.push("/clinician/queue"), 1500);
    });
  }

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

  if (closed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 flex flex-col items-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold">Case closed</h2>
        <p className="text-muted-foreground text-sm">
          Redirecting to queue…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-5">
      {/* Back nav */}
      <Link
        href="/clinician/queue"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Queue
      </Link>

      {/* Instructions to wire up data */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <p className="text-xs text-amber-800">
            <strong>Dev note:</strong> Connect{" "}
            <code className="font-mono">getEncounterById({id})</code> in a
            Server Component wrapper to populate encounter data below.
          </p>
        </CardContent>
      </Card>

      {/* Encounter ID reference */}
      <div>
        <h1 className="text-xl font-bold">Encounter Review</h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">#{id}</p>
      </div>

      {/* Clinician notes form */}
      <Card>
        <CardContent className="p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Clinical Notes
          </h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">
              Add your clinical assessment and follow-up instructions
            </Label>
            <Textarea
              id="notes"
              placeholder="Patient presents with… Recommended course of action…"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError(null);
              }}
              disabled={isPending}
              rows={5}
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Close button */}
      <Button
        size="xl"
        onClick={handleClose}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? (
          "Closing case…"
        ) : (
          <>
            <CheckCircle className="h-5 w-5" /> Close case
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Closing a case notifies the patient and marks the encounter as resolved.
      </p>
    </div>
  );
}
