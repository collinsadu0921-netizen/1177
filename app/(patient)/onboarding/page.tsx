"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Heart, ArrowRight, ArrowLeft, CheckCircle,
  MapPin, Phone as PhoneIcon, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertPatient } from "@/domains/patients/actions";
import type { BiologicalSex } from "@/lib/types";

type Step = "welcome" | "personal" | "contact" | "done";

const TOTAL_STEPS = 2;

const RELATIONSHIP_OPTIONS = [
  "Spouse / Partner",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>("welcome");

  // Step 1 — personal
  const [fullName, setFullName]         = useState("");
  const [dateOfBirth, setDateOfBirth]   = useState("");
  const [sex, setSex]                   = useState<BiologicalSex | "">("");

  // Step 2 — contact
  const [location, setLocation]               = useState("");
  const [ecName, setEcName]                   = useState("");
  const [ecPhone, setEcPhone]                 = useState("");
  const [ecRelationship, setEcRelationship]   = useState("");

  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  const currentStepNum = step === "personal" ? 1 : step === "contact" ? 2 : 0;
  const progress = (currentStepNum / TOTAL_STEPS) * 100;

  // ── Validation helpers ────────────────────────────────────────────────────

  function validatePersonal(): boolean {
    if (!fullName.trim()) { setError("Please enter your full name."); return false; }
    if (!dateOfBirth)     { setError("Please enter your date of birth."); return false; }
    if (!sex)             { setError("Please select a biological sex."); return false; }
    return true;
  }

  function validateContact(): boolean {
    if (!location.trim()) { setError("Please enter your city or region."); return false; }
    if (!ecName.trim())   { setError("Please enter your emergency contact's name."); return false; }
    const ecDigits = ecPhone.replace(/\D/g, "");
    if (ecDigits.length < 10) { setError("Please enter a valid emergency contact phone number."); return false; }
    if (!ecRelationship)  { setError("Please select the relationship."); return false; }
    return true;
  }

  // ── Step handlers ─────────────────────────────────────────────────────────

  function handlePersonalNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validatePersonal()) return;
    setStep("contact");
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateContact()) return;

    const ecDigits = ecPhone.replace(/\D/g, "");
    const ecE164 = ecDigits.startsWith("1") ? `+${ecDigits}` : `+1${ecDigits}`;

    startTransition(async () => {
      const result = await upsertPatient({
        fullName: fullName.trim(),
        dateOfBirth,
        sex: sex as BiologicalSex,
        location: location.trim(),
        emergencyContact: {
          name: ecName.trim(),
          phone: ecE164,
          relationship: ecRelationship,
        },
      });
      if (result.error) { setError(result.error); return; }
      setStep("done");
      setTimeout(() => router.replace("/app"), 1500);
    });
  }

  // ── Welcome ───────────────────────────────────────────────────────────────

  if (step === "welcome") {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-page-in">
        <div className="flex-1 flex flex-col justify-between page-container py-12">
          <div />

          {/* Hero */}
          <div className="flex flex-col items-center text-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-focus-ring">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold">Welcome to eHealth</h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Set up your health profile in under 2 minutes. Your information
                helps clinicians give you better care.
              </p>
            </div>

            {/* Steps preview */}
            <div className="w-full flex flex-col gap-3 mt-2">
              {[
                { icon: User,       label: "Personal information" },
                { icon: MapPin,     label: "Location & emergency contact" },
                { icon: CheckCircle, label: "Start your first check" },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-left">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            size="xl"
            onClick={() => setStep("personal")}
            className="mt-8"
          >
            Get started
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background animate-page-in">
        <div className="flex flex-col items-center gap-5 text-center page-container">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Taking you to your home screen…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Shared progress header ────────────────────────────────────────────────

  const ProgressHeader = (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 px-5 py-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep(step === "contact" ? "personal" : "welcome");
          }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-xs text-muted-foreground">
          {currentStepNum} / {TOTAL_STEPS}
        </span>
      </div>
      <Progress value={progress} size="xs" />
    </div>
  );

  // ── Step 1 — Personal info ────────────────────────────────────────────────

  if (step === "personal") {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-page-in">
        {ProgressHeader}

        <div className="flex-1 page-container py-8 flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold">About you</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Used to personalise your care — kept private and secure.
            </p>
          </div>

          <form
            id="personal-form"
            onSubmit={handlePersonalNext}
            className="flex flex-col gap-5"
          >
            <InputField
              id="fullName"
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Ada Okonkwo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <InputField
              id="dob"
              label="Date of birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sex">
                Biological sex{" "}
                <span className="text-destructive" aria-hidden>*</span>
              </Label>
              <Select value={sex} onValueChange={(v) => setSex(v as BiologicalSex)}>
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
          </form>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4">
          <Button type="submit" form="personal-form" size="xl" className="w-full">
            Continue
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2 — Location + emergency contact ─────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background animate-page-in">
      {ProgressHeader}

      <div className="flex-1 page-container py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold">Location &amp; emergency contact</h1>
          <p className="text-sm text-muted-foreground mt-1">
            In an emergency, we may need to reach someone on your behalf.
          </p>
        </div>

        <form
          id="contact-form"
          onSubmit={handleContactSubmit}
          className="flex flex-col gap-6"
        >
          {/* Location */}
          <div className="flex flex-col gap-4">
            <InputField
              id="location"
              label="City or region"
              type="text"
              autoComplete="address-level2"
              placeholder="Lagos, NG"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          {/* Emergency contact card */}
          <Card>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Emergency contact</h2>
              </div>

              <InputField
                id="ecName"
                label="Full name"
                type="text"
                autoComplete="off"
                placeholder="James Okonkwo"
                value={ecName}
                onChange={(e) => setEcName(e.target.value)}
                disabled={isPending}
                required
              />

              <InputField
                id="ecPhone"
                label="Phone number"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="(555) 000-0000"
                value={ecPhone}
                onChange={(e) =>
                  setEcPhone(e.target.value.replace(/[^\d\s\-\+\(\)]/g, ""))
                }
                disabled={isPending}
                required
              />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ecRelationship">
                  Relationship{" "}
                  <span className="text-destructive" aria-hidden>*</span>
                </Label>
                <Select
                  value={ecRelationship}
                  onValueChange={setEcRelationship}
                  disabled={isPending}
                >
                  <SelectTrigger id="ecRelationship">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}
        </form>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4">
        <Button
          type="submit"
          form="contact-form"
          size="xl"
          className="w-full"
          disabled={isPending}
          loading={isPending}
        >
          {isPending ? "Saving…" : "Complete setup"}
        </Button>
      </div>
    </div>
  );
}
