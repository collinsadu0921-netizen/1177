"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertPatient } from "@/domains/patients/actions";
import type { BiologicalSex } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<BiologicalSex | "">("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }
    if (!sex) {
      setError("Please select a biological sex.");
      return;
    }

    startTransition(async () => {
      const result = await upsertPatient({
        fullName: fullName.trim(),
        dateOfBirth,
        sex: sex as BiologicalSex,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSaved(true);
      setTimeout(() => router.push("/home"), 1000);
    });
  }

  return (
    <div className="page-container py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Your Profile</h1>
          <p className="text-xs text-muted-foreground">
            Used to personalise your care
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Ada Okonkwo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={isPending}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="sex">Biological sex</Label>
          <Select
            value={sex}
            onValueChange={(val) => setSex(val as BiologicalSex)}
            disabled={isPending}
          >
            <SelectTrigger id="sex">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used for clinical assessment only.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="xl"
          disabled={isPending || saved}
          className="mt-2"
        >
          {saved ? (
            <>
              <CheckCircle className="h-5 w-5" /> Saved!
            </>
          ) : isPending ? (
            "Saving…"
          ) : (
            "Save profile"
          )}
        </Button>
      </form>
    </div>
  );
}
