"use client";

import { useState, useTransition, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyOtp, sendOtp, getPostAuthRedirect } from "@/domains/auth/actions";

const RESEND_COOLDOWN = 30; // seconds

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResend] = useTransition();
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cooldown timer on mount (OTP was just sent from /login)
  useEffect(() => {
    startCooldown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "")) {
      submitOtp(newOtp.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      const digits = pasted.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
      submitOtp(pasted);
    }
  }

  function submitOtp(code: string) {
    startTransition(async () => {
      const result = await verifyOtp(phone, code);
      if (result.error) {
        setError("That code isn't right. Check your messages and try again.");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
        return;
      }
      // Profile-check: new patient → onboarding, returning → home
      const redirect = await getPostAuthRedirect();
      router.replace(redirect);
    });
  }

  function handleResend() {
    startResend(async () => {
      const result = await sendOtp(phone);
      if (!result.error) {
        setOtp(["", "", "", "", "", ""]);
        setError(null);
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
        startCooldown();
      }
    });
  }

  const maskedPhone = phone
    ? `${phone.slice(0, 3)}•••••${phone.slice(-4)}`
    : "your phone";

  const allFilled = otp.every((d) => d !== "");

  return (
    <div className="flex-1 flex flex-col justify-between page-container py-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 pt-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Check your messages</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{maskedPhone}</span>
          </p>
        </div>
      </div>

      {/* OTP inputs + actions */}
      <div className="flex flex-col items-center gap-6 my-10">
        {/* 6-box OTP */}
        <div
          className="flex gap-2.5"
          onPaste={handlePaste}
          role="group"
          aria-label="One-time password"
        >
          {otp.map((digit, i) => (
            <Input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isPending}
              aria-label={`Digit ${i + 1}`}
              className={[
                "w-11 h-14 text-center text-xl font-bold p-0 rounded-xl transition-all",
                error ? "border-destructive focus-visible:ring-destructive" : "",
                digit ? "border-primary/40 bg-primary/5" : "",
              ].join(" ")}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive text-center max-w-xs" role="alert">
            {error}
          </p>
        )}

        {/* Verify CTA */}
        <Button
          type="button"
          size="xl"
          disabled={isPending || !allFilled}
          loading={isPending}
          onClick={() => submitOtp(otp.join(""))}
          className="w-full"
        >
          {isPending ? "Verifying…" : "Verify code"}
          {!isPending && <ArrowRight className="h-5 w-5" />}
        </Button>

        {/* Resend */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isResending || cooldown > 0}
          onClick={handleResend}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {isResending
            ? "Sending…"
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend code"}
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        Wrong number?{" "}
        <a href="/login" className="text-primary underline underline-offset-2">
          Go back
        </a>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
