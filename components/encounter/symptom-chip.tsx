"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SymptomChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * SymptomChip — tap-to-toggle symptom selector.
 *
 * Unselected: white card with soft border.
 * Selected: solid primary blue with check icon — instantly clear selection state.
 * Touch target is large (min 44px height) per mobile UX guidelines.
 */
export function SymptomChip({ label, selected, onClick, disabled }: SymptomChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base — full tap target
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2",
        "text-sm font-medium leading-tight",
        "border transition-all duration-150",
        "cursor-pointer select-none",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Touch press feedback
        "active:scale-95",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40",
        // Unselected
        !selected && [
          "bg-card border-border text-foreground",
          "shadow-xs",
          "hover:border-primary/40 hover:bg-accent/60 hover:text-primary",
        ],
        // Selected
        selected && [
          "bg-primary border-primary text-primary-foreground",
          "shadow-sm",
        ]
      )}
    >
      {selected && (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden strokeWidth={2.5} />
      )}
      {label}
    </button>
  );
}
