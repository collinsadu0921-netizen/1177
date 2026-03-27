"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepHeader } from "@/components/ui/step-header";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SymptomChip } from "@/components/encounter/symptom-chip";
import { SYMPTOMS, SYMPTOM_CATEGORIES } from "@/domains/symptoms/data";
import { createEncounter } from "@/domains/encounters/actions";
import { getPatientByUserId } from "@/domains/patients/queries";
import { createClient } from "@/lib/supabase/client";
import type { SymptomEntry, SymptomSeverity, SymptomDuration } from "@/lib/types";

type Step = "complaint" | "symptoms" | "details" | "review";

const STEPS: Step[] = ["complaint", "symptoms", "details", "review"];
const STEP_LABELS: Record<Step, string> = {
  complaint: "What's wrong?",
  symptoms:  "Select symptoms",
  details:   "Symptom details",
  review:    "Review",
};

const SEVERITY_OPTIONS: { value: SymptomSeverity; label: string }[] = [
  { value: "mild",     label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe",   label: "Severe" },
];

const DURATION_OPTIONS: { value: SymptomDuration; label: string }[] = [
  { value: "less_than_1_day",  label: "Less than a day" },
  { value: "1_3_days",         label: "1–3 days" },
  { value: "4_7_days",         label: "4–7 days" },
  { value: "more_than_1_week", label: "More than a week" },
];

export default function CheckPage() {
  const router = useRouter();
  const [step, setStep]   = useState<Step>("complaint");
  const [complaint, setComplaint] = useState("");
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("general");
  const [symptomEntries, setSymptomEntries] = useState<
    Record<string, { severity: SymptomSeverity; duration: SymptomDuration }>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stepIndex = STEPS.indexOf(step);

  function toggleSymptom(id: string) {
    setSelectedSymptomIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function updateEntry(id: string, field: "severity" | "duration", value: string) {
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
      if (!complaint.trim()) { setError("Please describe what's wrong."); return; }
      setStep("symptoms");
    } else if (step === "symptoms") {
      if (selectedSymptomIds.size === 0) { setError("Please select at least one symptom."); return; }
      setSymptomEntries((prev) => {
        const next = { ...prev };
        selectedSymptomIds.forEach((id) => { if (!next[id]) next[id] = { severity: "mild", duration: "1_3_days" }; });
        return next;
      });
      setStep("details");
    } else if (step === "details") {
      setStep("review");
    }
  }

  function handleBack() {
    setError(null);
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
    else router.push("/app");
  }

  function handleSubmit() {
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: patient } = await getPatientByUserId(user.id);
      if (!patient) {
        setError("Please complete your profile before starting a check.");
        router.push("/app/profile");
        return;
      }

      const entries: SymptomEntry[] = Array.from(selectedSymptomIds).map((id) => {
        const symptom = SYMPTOMS.find((s) => s.id === id)!;
        const detail  = symptomEntries[id] ?? { severity: "mild", duration: "1_3_days" };
        return { symptomId: id, label: symptom.label, ...detail };
      });

      const result = await createEncounter(patient.id, complaint, entries);
      if (result.error) { setError(result.error); return; }
      router.push(`/app/check/${result.data!.id}`);
    });
  }

  const categorySymptoms = SYMPTOMS.filter((s) => s.category === activeCategory);

  return (
    <>
      {/* Step header — sticky, manages progress + back */}
      <StepHeader
        current={stepIndex + 1}
        total={STEPS.length}
        stepLabel={STEP_LABELS[step]}
        onBack={handleBack}
      />

      {/* Page content */}
      <div className="page-container py-6 flex flex-col gap-5 flex-1">

        {/* Step 1: Chief complaint */}
        {step === "complaint" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold tracking-tight">What&apos;s bothering you?</h2>
              <p className="text-sm text-muted-foreground mt-1">Describe your main concern in a few words.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="complaint">Chief complaint</Label>
              <Input
                id="complaint"
                placeholder="e.g. persistent headache since this morning"
                value={complaint}
                onChange={(e) => { setComplaint(e.target.value); setError(null); }}
                autoFocus
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right tabular-nums">{complaint.length}/200</p>
            </div>
          </div>
        )}

        {/* Step 2: Symptom selection */}
        {step === "symptoms" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Select your symptoms</h2>
              <p className="text-sm text-muted-foreground mt-1">Tap all that apply.</p>
            </div>
            {/* Category scroll row */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
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
              <p className="text-xs text-primary font-semibold">
                {selectedSymptomIds.size} symptom{selectedSymptomIds.size !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}

        {/* Step 3: Symptom details */}
        {step === "details" && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Tell us more</h2>
              <p className="text-sm text-muted-foreground mt-1">Rate each symptom.</p>
            </div>
            {Array.from(selectedSymptomIds).map((id) => {
              const symptom = SYMPTOMS.find((s) => s.id === id)!;
              const entry   = symptomEntries[id] ?? { severity: "mild", duration: "1_3_days" };
              return (
                <div key={id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-card">
                  <p className="font-semibold text-sm">{symptom.label}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Severity</Label>
                      <Select value={entry.severity} onValueChange={(v) => updateEntry(id, "severity", v)}>
                        <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Duration</Label>
                      <Select value={entry.duration} onValueChange={(v) => updateEntry(id, "duration", v)}>
                        <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
              <h2 className="text-xl font-bold tracking-tight">Review & submit</h2>
              <p className="text-sm text-muted-foreground mt-1">Check your details before submitting.</p>
            </div>
            <div className="rounded-xl border border-border divide-y divide-border/60 bg-card shadow-card overflow-hidden">
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Chief complaint</p>
                <p className="text-sm font-medium">{complaint}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-2">
                  Symptoms ({selectedSymptomIds.size})
                </p>
                <div className="flex flex-col gap-2">
                  {Array.from(selectedSymptomIds).map((id) => {
                    const symptom = SYMPTOMS.find((s) => s.id === id)!;
                    const entry   = symptomEntries[id];
                    return (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <span>{symptom.label}</span>
                        <span className="text-muted-foreground text-xs capitalize">
                          {entry?.severity} · {entry?.duration.replace(/_/g, " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-muted/60 px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is not a substitute for professional medical advice. If you have a medical emergency, call emergency services immediately.
              </p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-4 safe-bottom">
        <div className="max-w-md mx-auto">
          {step !== "review" ? (
            <Button size="xl" onClick={handleNext}>
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button size="xl" onClick={handleSubmit} loading={isPending}>
              <CheckCircle className="h-5 w-5" /> Submit check
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
