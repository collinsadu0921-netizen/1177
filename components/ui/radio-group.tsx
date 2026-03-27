"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

// ── RadioGroup ────────────────────────────────────────────────────────────────
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

// ── RadioGroupItem ─────────────────────────────────────────────────────────────
// Standard dot-style radio (for forms)
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "aspect-square h-5 w-5 rounded-full",
      "border-2 border-input",
      "text-primary",
      "transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-40",
      "data-[state=checked]:border-primary",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// ── RadioGroupCard ─────────────────────────────────────────────────────────────
// Card-style radio — full card is the click target.
// Used for severity/duration selection in the encounter flow.
interface RadioGroupCardProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
  description?: string;
}

const RadioGroupCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupCardProps
>(({ className, label, description, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "group relative flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4",
      "text-left cursor-pointer",
      "shadow-xs",
      "transition-all duration-150",
      "hover:border-primary/40 hover:bg-accent/50",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "data-[state=checked]:border-primary data-[state=checked]:bg-accent data-[state=checked]:shadow-none",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className
    )}
    {...props}
  >
    {/* Custom indicator circle */}
    <span
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
        "border-input transition-colors",
        "group-data-[state=checked]:border-primary"
      )}
    >
      <RadioGroupPrimitive.Indicator>
        <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </span>

    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-foreground leading-tight">
        {label}
      </span>
      {description && (
        <span className="text-xs text-muted-foreground leading-snug">
          {description}
        </span>
      )}
    </div>
  </RadioGroupPrimitive.Item>
));
RadioGroupCard.displayName = "RadioGroupCard";

// ── RadioGroupChips ────────────────────────────────────────────────────────────
// Horizontal chip-style radio row — for compact selections (severity, etc.)
const RadioGroupChips = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("flex flex-row flex-wrap gap-2", className)}
    {...props}
  />
));
RadioGroupChips.displayName = "RadioGroupChips";

interface RadioChipProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
}

const RadioChip = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioChipProps
>(({ className, label, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium",
      "border border-border bg-card",
      "cursor-pointer select-none",
      "transition-all duration-150",
      "hover:border-primary/40 hover:bg-accent/60 hover:text-primary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className
    )}
    {...props}
  >
    {label}
  </RadioGroupPrimitive.Item>
));
RadioChip.displayName = "RadioChip";

export { RadioGroup, RadioGroupItem, RadioGroupCard, RadioGroupChips, RadioChip };
