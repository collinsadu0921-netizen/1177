"use client";

import { cn } from "@/lib/utils";

interface SymptomChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function SymptomChip({ label, selected, onClick }: SymptomChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {label}
    </button>
  );
}
