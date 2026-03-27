"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtp } from "@/domains/auth/actions";

/** Format digits as (NNN) NNN-NNNN while typing */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [display, setDisplay]           = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();

  const digits = display.replace(/\D/g, "");
  const isValid = digits.length === 10;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setDisplay(formatPhone(raw));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    const e164 = `+1${digits}`;

    startTransition(async () => {
      const result = await sendOtp(e164);
      if (result.error) {
        setError("Couldn't send a code right now. Please try again.");
        return;
      }
      router.push(`/verify?phone=${encodeURIComponent(e164)}`);
    });
  }

  return (
    <div className="flex-1 flex flex-col justify-between page-container py-12">
      {/* Branding */}
      <div className="flex flex-col items-center text-center gap-4 pt-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Phone className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Enter your phone number. We&apos;ll send a one-time code — no
            password needed.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-10">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone number</Label>

          {/* Country prefix + input side by side */}
          <div className="flex gap-2">
            <div className="flex items-center justify-center h-input w-14 shrink-0 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground select-none">
              🇺🇸 +1
            </div>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(555) 000-0000"
              value={display}
              onChange={handleChange}
              disabled={isPending}
              hasError={!!error}
              className="flex-1"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="xl"
          disabled={isPending || !isValid}
          loading={isPending}
          className="mt-2"
        >
          {isPending ? "Sending code…" : "Continue"}
          {!isPending && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>

      {/* Legal */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        By continuing you agree to our Terms of Service and Privacy Policy.
        Standard messaging rates may apply.
      </p>
    </div>
  );
}
