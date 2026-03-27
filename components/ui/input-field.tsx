import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps extends InputProps {
  /** `htmlFor` on the label and `id` on the input */
  id: string;
  label: string;
  /** Validation error message */
  error?: string | null;
  /** Helper text shown below the input */
  hint?: string;
  /** Required marker */
  required?: boolean;
}

/**
 * InputField — a self-contained form field with label, input, and error/hint.
 * Use this instead of composing Label + Input + error text manually.
 */
export function InputField({
  id,
  label,
  error,
  hint,
  required,
  className,
  ...inputProps
}: InputFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium text-foreground",
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>

      <Input
        id={id}
        hasError={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        {...inputProps}
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm text-destructive flex items-center gap-1.5"
        >
          <svg
            width="14" height="14" viewBox="0 0 14 14"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7" cy="10" r="0.75" fill="currentColor"/>
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
