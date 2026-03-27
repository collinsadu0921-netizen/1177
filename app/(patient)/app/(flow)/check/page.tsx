"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StepHeader } from "@/components/ui/step-header";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { SYMPTOMS } from "@/domains/symptoms/data";
import { CATEGORIES, CONDITIONS } from "@/domains/symptoms/categories";
import type { CategoryConfig } from "@/domains/symptoms/categories";
import { createEncounter } from "@/domains/encounters/actions";
import { getPatientByUserId } from "@/domains/patients/queries";
import { createClient } from "@/lib/supabase/client";
import type { SymptomEntry, SymptomSeverity, SymptomDuration, IntakeContext } from "@/lib/types";

// ── Step types ────────────────────────────────────────────────────────────────

type Step = "category" | "questions" | "context" | "review";
const STEPS: Step[] = ["category", "questions", "context", "review"];

const STEP_LABELS: Record<Step, string> = {
  category:  "What's wrong?",
  questions: "Your symptoms",
  context:   "A bit more context",
  review:    "Review & submit",
};

// ── Option data ───────────────────────────────────────────────────────────────

const DURATION_OPTIONS: { value: SymptomDuration; label: string; sub: string }[] = [
  { value: "less_than_1_day",  label: "Just started",   sub: "Less than a day"   },
  { value: "1_3_days",         label: "A few days",     sub: "1 – 3 days"        },
  { value: "4_7_days",         label: "About a week",   sub: "4 – 7 days"        },
  { value: "more_than_1_week", label: "Over a week",    sub: "More than 7 days"  },
];

const SEVERITY_OPTIONS: { value: SymptomSeverity; label: string; sub: string }[] = [
  { value: "mild",     label: "Mild",     sub: "Uncomfortable but manageable" },
  { value: "moderate", label: "Moderate", sub: "Affecting daily activities"   },
  { value: "severe",   label: "Severe",   sub: "Hard to function"             },
];

// ── Shared choice chip ────────────────────────────────────────────────────────

function ChoiceChip({
  label,
  selected,
  onClick,
  danger,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium",
        "transition-all duration-100 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? danger
            ? "bg-red-600 border-red-600 text-white shadow-sm"
            : "bg-primary border-primary text-primary-foreground shadow-sm"
          : danger
          ? "bg-card border-red-200 text-red-700 hover:bg-red-50"
          : "bg-card border-border text-foreground hover:border-primary/40 hover:bg-accent/50"
      )}
    >
      {selected && (
        <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
      )}
      {label}
    </button>
  );
}

// ── Severity / duration row (full-width stacked chips) ────────────────────────

function ScaleChip({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3.5 rounded-xl border text-left",
        "transition-all duration-100 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "bg-primary border-primary text-primary-foreground shadow-sm"
          : "bg-card border-border text-foreground hover:border-primary/30 hover:bg-accent/30"
      )}
    >
      <div>
        <p className="text-sm font-semibold leading-snug">{label}</p>
        <p className={cn("text-xs mt-0.5", selected ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {sub}
        </p>
      </div>
      {selected && (
        <Check className="h-4 w-4 shrink-0 ml-3" strokeWidth={2.5} aria-hidden />
      )}
    </button>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </p>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CheckPage() {
  const router = useRouter();

  // Step navigation
  const [step, setStep] = useState<Step>("category");
  const stepIndex = STEPS.indexOf(step);

  // Step 1 — category
  const [category, setCategory] = useState<CategoryConfig | null>(null);

  // Step 2 — guided questions
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<Set<string>>(new Set());
  const [duration, setDuration]       = useState<SymptomDuration | null>(null);
  const [severity, setSeverity]       = useState<SymptomSeverity | null>(null);
  const [dangerSignIds, setDangerSignIds] = useState<Set<string>>(new Set());

  // Step 3 — context
  const [takesMedication, setTakesMedication] = useState<boolean | null>(null);
  const [medicationText, setMedicationText]   = useState("");
  const [conditionIds, setConditionIds]       = useState<Set<string>>(new Set());

  // Submission
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  // ── Helpers ──────────────────────────────────────────────────────────────

  function toggleSet<T extends string>(set: Set<T>, id: T): Set<T> {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  }

  function handleBack() {
    setError(null);
    if (stepIndex === 0) router.push("/app");
    else setStep(STEPS[stepIndex - 1]);
  }

  function handleNext() {
    setError(null);

    if (step === "category") {
      if (!category) { setError("Please select a category."); return; }
      setStep("questions");
    } else if (step === "questions") {
      if (selectedSymptomIds.size === 0) { setError("Please select at least one symptom."); return; }
      if (!duration) { setError("Please select how long you've had this."); return; }
      if (!severity) { setError("Please rate the severity."); return; }
      setStep("context");
    } else if (step === "context") {
      if (takesMedication === null) { setError("Please answer the medication question."); return; }
      if (takesMedication && !medicationText.trim()) {
        setError("Please describe your current medication."); return;
      }
      setStep("review");
    }
  }

  function handleSubmit() {
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: patient } = await getPatientByUserId(user.id);
      if (!patient) { router.push("/app/profile"); return; }

      // Build symptom entries (same severity + duration applied to all)
      const entries: SymptomEntry[] = Array.from(selectedSymptomIds).map((id) => {
        const sym = SYMPTOMS.find((s) => s.id === id)!;
        return {
          symptomId: id,
          label:     sym.label,
          severity:  severity!,
          duration:  duration!,
        };
      });

      // Auto-generate chief complaint from selected symptoms
      const symptomLabels = entries.map((e) => e.label);
      const chiefComplaint = symptomLabels.length <= 2
        ? symptomLabels.join(" and ")
        : `${symptomLabels.slice(0, 2).join(", ")} and ${symptomLabels.length - 2} more`;

      const intakeContext: IntakeContext = {
        categoryId:      category!.id,
        dangerSigns:     Array.from(dangerSignIds),
        takesMedication: takesMedication ?? false,
        medication:      takesMedication ? medicationText.trim() : null,
        conditions:      Array.from(conditionIds),
      };

      const result = await createEncounter(patient.id, chiefComplaint, entries, intakeContext);
      if (result.error) { setError(result.error); return; }
      router.push(`/app/check/${result.data!.id}`);
    });
  }

  // ── Condition selection helpers ───────────────────────────────────────────

  function toggleCondition(id: string) {
    if (id === "none") {
      // "None" clears everything else
      setConditionIds(conditionIds.has("none") ? new Set() : new Set(["none"]));
    } else {
      setConditionIds((prev) => {
        const next = toggleSet(prev, id);
        next.delete("none"); // deselect "none" when another is chosen
        return next;
      });
    }
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const categorySymptoms = category
    ? SYMPTOMS.filter((s) => category.symptomIds.includes(s.id))
    : [];

  // ── STEP 1: Category selection ────────────────────────────────────────────

  if (step === "category") {
    return (
      <>
        <StepHeader
          current={1}
          total={STEPS.length}
          stepLabel={STEP_LABELS.category}
          onBack={handleBack}
        />

        <div className="page-container py-6 flex flex-col gap-5 flex-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight">What&apos;s your main concern?</h2>
            <p className="text-sm text-muted-foreground mt-1">Pick the option that fits best.</p>
          </div>

          {/* 2-column card grid */}
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat); setError(null); }}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-2xl border p-4",
                  "text-left transition-all duration-100 active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  category?.id === cat.id
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                    : "border-border bg-card shadow-card hover:border-primary/30 hover:bg-accent/30"
                )}
              >
                <span className="text-2xl leading-none" aria-hidden>{cat.emoji}</span>
                <div>
                  <p className="text-sm font-semibold leading-snug">{cat.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {cat.description}
                  </p>
                </div>
                {category?.id === cat.id && (
                  <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" strokeWidth={2.5} aria-hidden />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* "Something else" full-width */}
          {CATEGORIES[6] && (
            <button
              type="button"
              onClick={() => { setCategory(CATEGORIES[6]); setError(null); }}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl border p-4",
                "text-left transition-all duration-100 active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                category?.id === CATEGORIES[6].id
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                  : "border-border bg-card shadow-card hover:border-primary/30"
              )}
            >
              <span className="text-2xl" aria-hidden>{CATEGORIES[6].emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{CATEGORIES[6].label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{CATEGORIES[6].description}</p>
              </div>
              {category?.id === CATEGORIES[6].id && (
                <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} aria-hidden />
              )}
            </button>
          )}

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-4 safe-bottom">
          <div className="max-w-md mx-auto">
            <Button size="xl" onClick={handleNext} disabled={!category} className="w-full">
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ── STEP 2: Guided questions ──────────────────────────────────────────────

  if (step === "questions") {
    return (
      <>
        <StepHeader
          current={2}
          total={STEPS.length}
          stepLabel={`${category!.emoji} ${category!.label}`}
          onBack={handleBack}
        />

        <div className="page-container py-6 flex flex-col gap-6 flex-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Tell us more</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Answer a few quick questions about your symptoms.
            </p>
          </div>

          {/* Symptom chips */}
          <div className="flex flex-col gap-3">
            <SectionLabel>Which symptoms do you have? (select all that apply)</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {categorySymptoms.map((sym) => (
                <ChoiceChip
                  key={sym.id}
                  label={sym.label}
                  selected={selectedSymptomIds.has(sym.id)}
                  onClick={() => {
                    setSelectedSymptomIds((prev) => toggleSet(prev, sym.id));
                    setError(null);
                  }}
                />
              ))}
            </div>
            {selectedSymptomIds.size > 0 && (
              <p className="text-xs text-primary font-semibold">
                {selectedSymptomIds.size} selected
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-3">
            <SectionLabel>How long have you had this?</SectionLabel>
            <div className="flex flex-col gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <ScaleChip
                  key={opt.value}
                  label={opt.label}
                  sub={opt.sub}
                  selected={duration === opt.value}
                  onClick={() => { setDuration(opt.value); setError(null); }}
                />
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="flex flex-col gap-3">
            <SectionLabel>How severe is it?</SectionLabel>
            <div className="flex flex-col gap-2">
              {SEVERITY_OPTIONS.map((opt) => (
                <ScaleChip
                  key={opt.value}
                  label={opt.label}
                  sub={opt.sub}
                  selected={severity === opt.value}
                  onClick={() => { setSeverity(opt.value); setError(null); }}
                />
              ))}
            </div>
          </div>

          {/* Danger signs */}
          {category!.dangerSigns.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <SectionLabel>Any of these warning signs?</SectionLabel>
              </div>
              <div className="flex flex-wrap gap-2">
                {category!.dangerSigns.map((ds) => (
                  <ChoiceChip
                    key={ds.id}
                    label={ds.label}
                    selected={dangerSignIds.has(ds.id)}
                    danger={ds.escalation === "emergency"}
                    onClick={() => setDangerSignIds((prev) => toggleSet(prev, ds.id))}
                  />
                ))}
              </div>
              {dangerSignIds.size > 0 && (
                <Card className="border-amber-200 bg-amber-50/80 shadow-none">
                  <CardContent className="p-3">
                    <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      If you are in immediate danger, call emergency services now. Do not wait.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-4 safe-bottom">
          <div className="max-w-md mx-auto">
            <Button
              size="xl"
              onClick={handleNext}
              disabled={selectedSymptomIds.size === 0 || !duration || !severity}
              className="w-full"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ── STEP 3: Context ───────────────────────────────────────────────────────

  if (step === "context") {
    return (
      <>
        <StepHeader
          current={3}
          total={STEPS.length}
          stepLabel={STEP_LABELS.context}
          onBack={handleBack}
        />

        <div className="page-container py-6 flex flex-col gap-6 flex-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight">A bit more context</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This helps the clinician give better guidance.
            </p>
          </div>

          {/* Medication */}
          <div className="flex flex-col gap-3">
            <SectionLabel>Are you currently taking any medication?</SectionLabel>
            <div className="flex gap-2">
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => { setTakesMedication(val); setError(null); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl border text-sm font-semibold transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
                    takesMedication === val
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-foreground hover:border-primary/40"
                  )}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>

            {takesMedication && (
              <Textarea
                rows={2}
                placeholder="e.g. Paracetamol 500mg, Metformin 850mg…"
                value={medicationText}
                onChange={(e) => { setMedicationText(e.target.value); setError(null); }}
              />
            )}
          </div>

          {/* Conditions */}
          <div className="flex flex-col gap-3">
            <SectionLabel>Any known health conditions?</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((cond) => (
                <ChoiceChip
                  key={cond.id}
                  label={cond.label}
                  selected={conditionIds.has(cond.id)}
                  onClick={() => toggleCondition(cond.id)}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-4 safe-bottom">
          <div className="max-w-md mx-auto">
            <Button size="xl" onClick={handleNext} className="w-full">
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </>
    );
  }

  // ── STEP 4: Review ────────────────────────────────────────────────────────

  const selectedSymptomLabels = Array.from(selectedSymptomIds).map(
    (id) => SYMPTOMS.find((s) => s.id === id)?.label ?? id
  );
  const selectedDanger = Array.from(dangerSignIds).map(
    (id) => category?.dangerSigns.find((d) => d.id === id)?.label ?? id
  );
  const selectedConditionLabels = Array.from(conditionIds).map(
    (id) => CONDITIONS.find((c) => c.id === id)?.label ?? id
  );
  const durationLabel = DURATION_OPTIONS.find((o) => o.value === duration)?.label ?? "";
  const severityLabel = SEVERITY_OPTIONS.find((o) => o.value === severity)?.label ?? "";

  return (
    <>
      <StepHeader
        current={4}
        total={STEPS.length}
        stepLabel={STEP_LABELS.review}
        onBack={handleBack}
      />

      <div className="page-container py-6 flex flex-col gap-5 flex-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Review &amp; submit</h2>
          <p className="text-sm text-muted-foreground mt-1">Check your details before submitting.</p>
        </div>

        {/* Summary card */}
        <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-card divide-y divide-border/60">

          <div className="px-4 py-3.5">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
              Category
            </p>
            <p className="text-sm font-medium">{category!.emoji} {category!.label}</p>
          </div>

          <div className="px-4 py-3.5">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
              Symptoms ({selectedSymptomIds.size})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSymptomLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="px-4 py-3.5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Duration</p>
              <p className="text-sm font-medium">{durationLabel}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Severity</p>
              <p className="text-sm font-medium">{severityLabel}</p>
            </div>
          </div>

          {selectedDanger.length > 0 && (
            <div className="px-4 py-3.5 bg-amber-50/60">
              <p className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Warning signs
              </p>
              <div className="flex flex-col gap-1">
                {selectedDanger.map((label) => (
                  <p key={label} className="text-xs text-amber-900 font-medium">{label}</p>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-3.5">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Medication</p>
            <p className="text-sm">
              {takesMedication ? medicationText || "Yes (not specified)" : "None"}
            </p>
          </div>

          {selectedConditionLabels.length > 0 && (
            <div className="px-4 py-3.5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Conditions</p>
              <p className="text-sm">{selectedConditionLabels.join(", ")}</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This is not a substitute for professional medical advice. If you believe
            you are in immediate danger, call emergency services now.
          </p>
        </div>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-4 safe-bottom">
        <div className="max-w-md mx-auto">
          <Button size="xl" onClick={handleSubmit} loading={isPending} className="w-full">
            <CheckCircle className="h-5 w-5" />
            {isPending ? "Submitting…" : "Submit check"}
          </Button>
        </div>
      </div>
    </>
  );
}
