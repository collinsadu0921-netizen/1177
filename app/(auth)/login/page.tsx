"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtp } from "@/domains/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow digits, spaces, hyphens, parentheses, plus
    const val = e.target.value.replace(/[^\d\s\-\+\(\)]/g, "");
    setPhone(val);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    const e164 = digits.startsWith("1") ? `+${digits}` : `+1${digits}`;

    startTransition(async () => {
      const result = await sendOtp(e164);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/verify?phone=${encodeURIComponent(e164)}`);
    });
  }

  return (
    <div className="flex-1 flex flex-col justify-between page-container py-12">
      {/* Top: Branding */}
      <div className="flex flex-col items-center text-center gap-4 pt-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Phone className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Enter your phone number to get started. We&apos;ll send you a
            one-time code.
          </p>
        </div>
      </div>

      {/* Middle: Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-10">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 000-0000"
            value={phone}
            onChange={handlePhoneChange}
            disabled={isPending}
            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="xl"
          disabled={isPending || phone.replace(/\D/g, "").length < 10}
          className="mt-2"
        >
          {isPending ? "Sending code…" : "Continue"}
          {!isPending && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>

      {/* Bottom: Legal */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        By continuing, you agree to our Terms of Service and Privacy Policy.
        Standard messaging rates may apply.
      </p>
    </div>
  );
}
