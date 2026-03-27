"use client";

import { useState, useTransition, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyOtp, sendOtp } from "@/domains/auth/actions";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResend] = useTransition();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const complete = newOtp.every((d) => d !== "");
    if (complete) {
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
        setError("Invalid code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }
      router.push("/home");
    });
  }

  function handleResend() {
    startResend(async () => {
      await sendOtp(phone);
      setResent(true);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResent(false), 5000);
    });
  }

  const maskedPhone = phone
    ? `${phone.slice(0, 3)}•••••${phone.slice(-4)}`
    : "your phone";

  return (
    <div className="flex-1 flex flex-col justify-between page-container py-12">
      {/* Top: Icon + instruction */}
      <div className="flex flex-col items-center text-center gap-4 pt-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Check your messages</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            We sent a 6-digit code to {maskedPhone}
          </p>
        </div>
      </div>

      {/* OTP input row */}
      <div className="flex flex-col items-center gap-6 my-10">
        <div
          className="flex gap-2"
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
              className="w-11 h-14 text-center text-xl font-bold p-0 rounded-xl"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive text-center" role="alert">
            {error}
          </p>
        )}

        <Button
          type="button"
          size="xl"
          disabled={isPending || otp.some((d) => !d)}
          onClick={() => submitOtp(otp.join(""))}
          className="w-full"
        >
          {isPending ? "Verifying…" : "Verify"}
          {!isPending && <ArrowRight className="h-5 w-5" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isResending}
          onClick={handleResend}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          {resent ? "Code resent!" : isResending ? "Resending…" : "Resend code"}
        </Button>
      </div>

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
