"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { closeEncounter } from "@/domains/encounters/actions";

interface CloseEncounterFormProps {
  encounterId: string;
}

export function CloseEncounterForm({ encounterId }: CloseEncounterFormProps) {
  const router = useRouter();
  const [notes, setNotes]               = useState("");
  const [error, setError]               = useState<string | null>(null);
  const [closed, setClosed]             = useState(false);
  const [isPending, startTransition]    = useTransition();

  function handleClose() {
    if (!notes.trim()) {
      setError("Please add clinical notes before closing.");
      return;
    }
    setError(null);

    startTransition(async () => {
      // Clinician ID resolved server-side via RLS in production.
      // Passing empty string here; update closeEncounter to use session user.
      const result = await closeEncounter(encounterId, "", notes.trim());
      if (result.error) {
        setError(result.error);
        return;
      }
      setClosed(true);
      setTimeout(() => router.push("/clinician/queue"), 1500);
    });
  }

  if (closed) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="h-7 w-7 text-success" />
        </div>
        <div>
          <p className="font-semibold">Case closed</p>
          <p className="text-sm text-muted-foreground mt-0.5">Returning to queue…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Clinical Notes
          </h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">
              Assessment and follow-up instructions
            </Label>
            <Textarea
              id="notes"
              placeholder="Patient presents with… Recommended course of action…"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError(null);
              }}
              disabled={isPending}
              rows={5}
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        size="xl"
        onClick={handleClose}
        disabled={isPending}
        loading={isPending}
        className="w-full"
      >
        {isPending ? "Closing case…" : (
          <><CheckCircle className="h-5 w-5" /> Close case</>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Closing a case marks the encounter as resolved.
      </p>
    </div>
  );
}
