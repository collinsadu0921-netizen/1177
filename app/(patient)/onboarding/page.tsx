"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertPatient } from "@/domains/patients/actions";
import type { BiologicalSex } from "@/lib/types";

type Step = "welcome" | "profile" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [fullName, setFullName]         = useState("");
  const [dateOfBirth, setDateOfBirth]   = useState("");
  const [sex, setSex]                   = useState<BiologicalSex | "">("");
  const [error, setError]               = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();

  const stepNumber = step === "welcome" ? 1 : step === "profile" ? 2 : 3;
  const totalSteps = 2;

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!dateOfBirth)     { setError("Please enter your date of birth."); return; }
    if (!sex)             { setError("Please select a biological sex."); return; }

    startTransition(async () => {
      const result = await upsertPatient({
        fullName: fullName.trim(),
        dateOfBirth,
        sex: sex as BiologicalSex,
      });
      if (result.error) { setError(result.error); return; }
      setStep("done");
      setTimeout(() => router.push("/app"), 1500);
    });
  }

  /* ── Welcome step ── */
  if (step === "welcome") {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-page-in">
        <div className="flex-1 flex flex-col justify-between page-container py-12">
          <div />
          <div className="flex flex-col items-center text-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Welcome to eHealth
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                We&apos;ll guide you through setting up your health profile.
                It only takes a minute.
              </p>
            </div>

            <div className="w-full flex flex-col gap-3 mt-4">
              {["Your personal health profile", "Guided symptom check", "Clinician review"].map(
                (item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-left"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <Button size="xl" onClick={() => setStep("profile")} className="mt-8">
            Get started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  /* ── Done step ── */
  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background animate-page-in">
        <div className="flex flex-col items-center gap-4 text-center page-container">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold">You&apos;re all set!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Taking you to your home screen…
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Profile step ── */
  return (
    <div className="min-h-screen flex flex-col bg-background animate-page-in">
      {/* Progress header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Your profile</span>
          <span className="text-xs text-muted-foreground">
            {stepNumber - 1} / {totalSteps}
          </span>
        </div>
        <Progress value={((stepNumber - 1) / totalSteps) * 100} size="xs" />
      </div>

      <div className="flex-1 page-container py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">
            Tell us about yourself
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            This information is used to personalise your care.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
          <InputField
            id="fullName"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Ada Okonkwo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isPending}
            required
          />

          <InputField
            id="dob"
            label="Date of birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={isPending}
            max={new Date().toISOString().split("T")[0]}
            required
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sex">
              Biological sex{" "}
              <span className="text-destructive" aria-hidden>*</span>
            </Label>
            <Select
              value={sex}
              onValueChange={(v) => setSex(v as BiologicalSex)}
              disabled={isPending}
            >
              <SelectTrigger id="sex">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Used for clinical assessment only.</p>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}

          <Button
            type="submit"
            size="xl"
            disabled={isPending}
            loading={isPending}
            className="mt-2"
          >
            {isPending ? "Saving…" : "Complete setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
