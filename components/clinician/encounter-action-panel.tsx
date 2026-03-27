"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  CheckCircle2,
  FileText,
  Lock,
  Save,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  saveDraftEncounter,
  markEncounterReviewed,
  closeEncounter,
} from "@/domains/encounters/actions";
import { cn } from "@/lib/utils";
import type { EncounterStatus } from "@/lib/types";

interface EncounterActionPanelProps {
  encounterId:         string;
  status:              EncounterStatus;
  initialDiagnosis:    string;
  initialNotes:        string;
  initialPrescription: string;
  initialReferral:     string;
}

type PendingAction = "draft" | "review" | "close" | null;

/**
 * EncounterActionPanel — clinician documentation form for an active encounter.
 *
 * Three actions:
 *   Save Draft     — persists fields without changing status
 *   Mark Reviewed  — saves + transitions to "reviewed" (pending_review only)
 *   Close Case     — saves + transitions to "closed" (any active status)
 *
 * Closed encounters render a read-only summary.
 */
export function EncounterActionPanel({
  encounterId,
  status,
  initialDiagnosis,
  initialNotes,
  initialPrescription,
  initialReferral,
}: EncounterActionPanelProps) {
  const router = useRouter();

  const [diagnosis,    setDiagnosis]    = useState(initialDiagnosis);
  const [notes,        setNotes]        = useState(initialNotes);
  const [prescription, setPrescription] = useState(initialPrescription);
  const [referral,     setReferral]     = useState(initialReferral);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [draftSavedAt,  setDraftSavedAt]  = useState<string | null>(null);
  const [closed,        setClosed]        = useState(false);

  const [, startTransition] = useTransition();

  const isPending = pendingAction !== null;
  const isClosed  = status === "closed" || closed;

  const fields = {
    clinicianNotes: notes,
    diagnosis,
    prescription,
    referral,
  };

  function handleAction(action: Exclude<PendingAction, null>) {
    setError(null);
    setDraftSavedAt(null);
    setPendingAction(action);

    startTransition(async () => {
      let result: { data: null; error: string | null } | { data: null; error: null };

      if (action === "draft") {
        result = await saveDraftEncounter(encounterId, "", fields);
        if (!result.error) {
          setDraftSavedAt(
            new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          );
        }
      } else if (action === "review") {
        result = await markEncounterReviewed(encounterId, "", fields);
        if (!result.error) {
          router.refresh(); // re-render server component with updated status
        }
      } else {
        result = await closeEncounter(encounterId, "", fields);
        if (!result.error) {
          setClosed(true);
        }
      }

      if (result.error) setError(result.error);
      setPendingAction(null);
    });
  }

  // ── Closed / success state ───────────────────────────────────────────────

  if (closed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-900">Case closed</p>
            <p className="text-sm text-green-700 mt-0.5">
              Documentation has been saved.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/clinician/queue">Return to queue</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Read-only view (already closed before component mounted) ─────────────

  if (isClosed) {
    return (
      <Card>
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Clinical Documentation</h2>
            <span className="ml-auto text-xs">Read-only</span>
          </div>

          {initialDiagnosis && (
            <ReadOnlyField label="Diagnosis" value={initialDiagnosis} />
          )}
          {initialNotes && (
            <ReadOnlyField label="Clinical notes" value={initialNotes} />
          )}
          {initialPrescription && (
            <ReadOnlyField label="Prescription" value={initialPrescription} />
          )}
          {initialReferral && (
            <ReadOnlyField label="Referral" value={initialReferral} />
          )}
          {!initialDiagnosis && !initialNotes && !initialPrescription && !initialReferral && (
            <p className="text-sm text-muted-foreground italic">No documentation recorded.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── Editable form ────────────────────────────────────────────────────────

  return (
    <Card>
      <CardContent className="p-5 flex flex-col gap-5">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Clinical Documentation
        </h2>

        {/* Diagnosis */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enc-diagnosis">Diagnosis</Label>
          <Input
            id="enc-diagnosis"
            placeholder="e.g. Viral upper respiratory infection"
            value={diagnosis}
            onChange={(e) => { setDiagnosis(e.target.value); setDraftSavedAt(null); }}
            disabled={isPending}
          />
        </div>

        {/* Clinical notes */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enc-notes">Clinical notes</Label>
          <Textarea
            id="enc-notes"
            placeholder="Assessment findings, advice, follow-up instructions…"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setDraftSavedAt(null); }}
            disabled={isPending}
            rows={4}
          />
        </div>

        {/* Prescription */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enc-prescription">
            Prescription
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="enc-prescription"
            placeholder="Drug name, dose, frequency, duration…"
            value={prescription}
            onChange={(e) => { setPrescription(e.target.value); setDraftSavedAt(null); }}
            disabled={isPending}
            rows={2}
          />
        </div>

        {/* Referral */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="enc-referral">
            Referral
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="enc-referral"
            placeholder="e.g. Refer to cardiology for follow-up ECG"
            value={referral}
            onChange={(e) => { setReferral(e.target.value); setDraftSavedAt(null); }}
            disabled={isPending}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}

        {/* Draft saved feedback */}
        {draftSavedAt && !error && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            Draft saved at {draftSavedAt}
          </p>
        )}

        {/* Action buttons */}
        <div className={cn("flex flex-col gap-2 pt-1", "sm:flex-row sm:items-center sm:justify-between")}>
          {/* Save draft — left-aligned */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("draft")}
            loading={pendingAction === "draft"}
            disabled={isPending}
          >
            <Save className="h-4 w-4" />
            {pendingAction === "draft" ? "Saving…" : "Save draft"}
          </Button>

          {/* Primary actions — right-aligned */}
          <div className="flex gap-2">
            {status === "pending_review" && (
              <Button
                variant="soft"
                size="default"
                onClick={() => handleAction("review")}
                loading={pendingAction === "review"}
                disabled={isPending}
              >
                {pendingAction === "review" ? "Saving…" : "Mark reviewed"}
              </Button>
            )}
            <Button
              size="default"
              onClick={() => handleAction("close")}
              loading={pendingAction === "close"}
              disabled={isPending}
            >
              <CheckCircle className="h-4 w-4" />
              {pendingAction === "close" ? "Closing…" : "Close case"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Closing a case is permanent and marks the encounter as resolved.
          Clinical notes are visible to the patient after closure.
        </p>
      </CardContent>
    </Card>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}
