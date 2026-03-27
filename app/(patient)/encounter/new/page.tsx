"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SymptomChip } from "@/components/encounter/symptom-chip";
import { SYMPTOMS, SYMPTOM_CATEGORIES } from "@/domains/symptoms/data";
import { createEncounter } from "@/domains/encounters/actions";
import { getPatientByUserId } from "@/domains/patients/queries";
import { createClient } from "@/lib/supabase/client";
import type {
  SymptomEntry,
  SymptomSeverity,
  SymptomDuration,
} from "@/lib/types";

type Step = "complaint" | "symptoms" | "details" | "review";

const STEPS: Step[] = ["complaint", "symptoms", "details", "review"];
const STEP_LABELS: Record<Step, string> = {
  complaint: "What's wrong?",
  symptoms: "Select symptoms",
  details: "Symptom details",
  review: "Review",
};

const SEVERITY_OPTIONS: { value: SymptomSeverity; label: string }[] = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

const DURATION_OPTIONS: { value: SymptomDuration; label: string }[] = [
  { value: "less_than_1_day", label: "Less than a day" },
  { value: "1_3_days", label: "1–3 days" },
  { value: "4_7_days", label: "4–7 days" },
  { value: "more_than_1_week", label: "More than a week" },
];

export default function NewEncounterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("complaint");
  const [complaint, setComplaint] = useState("");
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("general");
  const [symptomEntries, setSymptomEntries] = useState<
    Record<string, { severity: SymptomSeverity; duration: SymptomDuration }>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function toggleSymptom(id: string) {
    setSelectedSymptomIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function updateEntry(
    id: string,
    field: "severity" | "duration",
    value: string
  ) {
    setSymptomEntries((prev) => ({
      ...prev,
      [id]: {
        severity: (prev[id]?.severity ?? "mild") as SymptomSeverity,
        duration: (prev[id]?.duration ?? "1_3_days") as SymptomDuration,
        [field]: value,
      },
    }));
  }

  function handleNext() {
    setError(null);
    if (step === "complaint") {
      if (!complaint.trim()) {
        setError("Please describe what's wrong.");
        return;
      }
      setStep("symptoms");
    } else if (step === "symptoms") {
      if (selectedSymptomIds.size === 0) {
        setError("Please select at least one symptom.");
        return;
      }
      // Pre-fill default details
      setSymptomEntries((prev) => {
        const next = { ...prev };
        selectedSymptomIds.forEach((id) => {
          if (!next[id]) {
            next[id] = { severity: "mild", duration: "1_3_days" };
          }
        });
        return next;
      });
      setStep("details");
    } else if (step === "details") {
      setStep("review");
    }
  }

  function handleBack() {
    setError(null);
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  function handleSubmit() {
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: patient } = await getPatientByUserId(user.id);
      if (!patient) {
        setError("Please complete your profile first.");
        router.push("/profile");
        return;
      }

      const entries: SymptomEntry[] = Array.from(selectedSymptomIds).map((id) => {
        const symptom = SYMPTOMS.find((s) => s.id === id)!;
        const detail = symptomEntries[id] ?? { severity: "mild", duration: "1_3_days" };
        return {
          symptomId: id,
          label: symptom.label,
          severity: detail.severity,
          duration: detail.duration,
        };
      });

      const result = await createEncounter(patient.id, complaint, entries);
      if (result.error) {
        setError(result.error);
        return;
      }

      router.push(`/encounter/${result.data!.id}`);
    });
  }

  const categorySymptoms = SYMPTOMS.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="page-container py-3">
          <div className="flex items-center gap-3 mb-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <span className="text-sm font-semibold text-muted-foreground flex-1">
              Step {stepIndex + 1} of {STEPS.length} — {STEP_LABELS[step]}
            </span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-6 flex flex-col gap-5 flex-1">

        {/* Step 1: Chief complaint */}
        {step === "complaint" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold">What&apos;s bothering you?</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Describe your main concern in a few words.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="complaint">Chief complaint</Label>
              <Input
                id="complaint"
                placeholder="e.g. persistent headache since this morning"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                autoFocus
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {complaint.length}/200
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Symptom selection */}
        {step === "symptoms" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold">Select your symptoms</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Tap all that apply.
              </p>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
              {SYMPTOM_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Symptom chips */}
            <div className="flex flex-wrap gap-2">
              {categorySymptoms.map((symptom) => (
                <SymptomChip
                  key={symptom.id}
                  label={symptom.label}
                  selected={selectedSymptomIds.has(symptom.id)}
                  onClick={() => toggleSymptom(symptom.id)}
                />
              ))}
            </div>

            {selectedSymptomIds.size > 0 && (
              <p className="text-xs text-primary font-medium">
                {selectedSymptomIds.size} symptom
                {selectedSymptomIds.size !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        {/* Step 3: Symptom details */}
        {step === "details" && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold">Tell us more</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Rate each symptom.
              </p>
            </div>

            {Array.from(selectedSymptomIds).map((id) => {
              const symptom = SYMPTOMS.find((s) => s.id === id)!;
              const entry = symptomEntries[id] ?? {
                severity: "mild",
                duration: "1_3_days",
              };
              return (
                <div
                  key={id}
                  className="rounded-2xl border border-border p-4 flex flex-col gap-3"
                >
                  <p className="font-semibold text-sm">{symptom.label}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Severity</Label>
                      <Select
                        value={entry.severity}
                        onValueChange={(v) => updateEntry(id, "severity", v)}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Duration</Label>
                      <Select
                        value={entry.duration}
                        onValueChange={(v) => updateEntry(id, "duration", v)}
                      >
                        <SelectTrigger className="h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 4: Review */}
        {step === "review" && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold">Review & submit</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Check your details before submitting.
              </p>
            </div>

            <div className="rounded-2xl border border-border divide-y divide-border">
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Chief complaint
                </p>
                <p className="text-sm font-medium mt-1">{complaint}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  Symptoms ({selectedSymptomIds.size})
                </p>
                <div className="flex flex-col gap-2">
                  {Array.from(selectedSymptomIds).map((id) => {
                    const symptom = SYMPTOMS.find((s) => s.id === id)!;
                    const entry = symptomEntries[id];
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{symptom.label}</span>
                        <span className="text-muted-foreground capitalize">
                          {entry?.severity} · {entry?.duration.replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is not a substitute for professional medical advice.
                If you have a medical emergency, call 911 immediately.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Sticky bottom action */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-4">
        <div className="max-w-md mx-auto">
          {step !== "review" ? (
            <Button
              type="button"
              size="xl"
              className="w-full"
              onClick={handleNext}
            >
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="xl"
              className="w-full"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                "Submitting…"
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" /> Submit check
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
