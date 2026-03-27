"use client";

import { useState, useTransition } from "react";
import { Stethoscope, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { signInWithPassword } from "@/domains/auth/actions";

export default function ClinicianLoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password)     { setError("Please enter your password."); return; }

    startTransition(async () => {
      const result = await signInWithPassword({ email: email.trim(), password });
      if (result?.error) setError(result.error);
      // On success, middleware redirects to /clinician/queue
    });
  }

  return (
    <div className="flex-1 flex flex-col justify-between page-container py-12">
      {/* Branding */}
      <div className="flex flex-col items-center text-center gap-4 pt-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Stethoscope className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clinician portal</h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            Sign in with your clinic credentials to access the review queue.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 my-10">
        <InputField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@clinic.example"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
        />

        <InputField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          required
        />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="xl"
          disabled={isPending}
          loading={isPending}
          className="mt-2"
        >
          {isPending ? "Signing in…" : "Sign in"}
          {!isPending && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>

      {/* Security notice */}
      <p className="text-center text-xs text-muted-foreground pb-4 flex items-center justify-center gap-1.5">
        <Lock className="h-3.5 w-3.5" />
        Access restricted to authorised clinical staff only
      </p>
    </div>
  );
}
