"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertPatient } from "@/domains/patients/actions";
import { signOut } from "@/domains/auth/actions";
import type { BiologicalSex } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName]     = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex]               = useState<BiologicalSex | "">("");
  const [error, setError]           = useState<string | null>(null);
  const [saved, setSaved]           = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, startSignOut] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("patients")
        .select("full_name, date_of_birth, sex")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          if (data.full_name)    setFullName(data.full_name as string);
          if (data.date_of_birth) setDateOfBirth(data.date_of_birth as string);
          if (data.sex)          setSex(data.sex as BiologicalSex);
        });
    });
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) { setError("Please enter your full name.");   return; }
    if (!dateOfBirth)     { setError("Please enter your date of birth."); return; }
    if (!sex)             { setError("Please select a biological sex."); return; }

    startTransition(async () => {
      const result = await upsertPatient({
        fullName: fullName.trim(),
        dateOfBirth,
        sex: sex as BiologicalSex,
      });
      if (result.error) { setError(result.error); return; }
      setSaved(true);
      setTimeout(() => router.push("/app"), 1200);
    });
  }

  function handleSignOut() {
    startSignOut(async () => {
      await signOut();
      router.push("/login");
    });
  }

  return (
    <div className="page-container py-6 flex flex-col gap-6 animate-page-in">
      <PageHeader title="Your Profile" subtitle="Used to personalise your care" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

        <Button type="submit" size="xl" disabled={isPending || saved} loading={isPending}>
          {saved ? (
            <><CheckCircle className="h-5 w-5" /> Saved!</>
          ) : (
            "Save profile"
          )}
        </Button>
      </form>

      {/* Sign out */}
      <div className="pt-2 border-t border-border/60">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground w-full"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
