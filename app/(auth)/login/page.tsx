"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { sendOtp, signInWithPassword, getPostAuthRedirect } from "@/domains/auth/actions";
import { cn } from "@/lib/utils";

/** Format digits as (NNN) NNN-NNNN while typing */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type Tab = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab]                    = useState<Tab>("email");
  const [email, setEmail]                = useState("");
  const [password, setPassword]          = useState("");
  const [display, setDisplay]            = useState("");
  const [error, setError]                = useState<string | null>(null);
  const [isPending, startTransition]     = useTransition();

  const digits  = display.replace(/\D/g, "");
  const phoneOk = digits.length === 10;
  const emailOk = email.includes("@") && password.length >= 6;

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(formatPhone(e.target.value.replace(/\D/g, "")));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tab === "email") {
      if (!emailOk) {
        setError("Enter a valid email and password (min 6 chars).");
        return;
      }
      startTransition(async () => {
        const result = await signInWithPassword({ email: email.trim(), password });
        if (result.error) {
          setError("Invalid email or password.");
          return;
        }
        const redirect = await getPostAuthRedirect();
        router.push(redirect);
      });
    } else {
      if (!phoneOk) {
        setError("Please enter a valid 10-digit phone number.");
        return;
      }
      startTransition(async () => {
        const result = await sendOtp(`+1${digits}`);
        if (result.error) {
          setError("Couldn't send a code right now. Please try again.");
          return;
        }
        router.push(`/verify?phone=${encodeURIComponent(`+1${digits}`)}`);
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between page-container py-12">

      {/* Branding */}
      <div className="flex flex-col items-center text-center gap-4 pt-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          {tab === "email"
            ? <Mail className="h-7 w-7 text-primary" />
            : <Phone className="h-7 w-7 text-primary" />
          }
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            {tab === "email"
              ? "Use your email and password to sign in."
              : "Enter your phone number. We'll send a one-time code."}
          </p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-xl border border-border bg-muted/40 p-1 gap-1 my-8">
        {(["email", "phone"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "email" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            {t === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {tab === "email" ? (
          <>
            <InputField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              disabled={isPending}
              hasError={!!error}
            />
            <InputField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              disabled={isPending}
              hasError={!!error}
            />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone number</Label>
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
                onChange={handlePhoneChange}
                disabled={isPending}
                hasError={!!error}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}

        <Button
          type="submit"
          size="xl"
          disabled={isPending || (tab === "email" ? !emailOk : !phoneOk)}
          loading={isPending}
          className="mt-2"
        >
          {isPending
            ? tab === "email" ? "Signing in…" : "Sending code…"
            : tab === "email" ? "Sign in" : "Continue"}
          {!isPending && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>

      {/* Legal */}
      <p className="text-center text-xs text-muted-foreground pb-4 mt-8">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
