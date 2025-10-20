"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-background))]",
          // Checked state
          checked && "bg-[hsl(var(--color-primary))]",
          // Unchecked state - visible border and background
          !checked && "bg-[hsl(var(--color-muted)/0.3)] border-2 border-[hsl(var(--color-border))]",
          // Disabled state
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-all duration-200",
            // Thumb colors
            checked 
              ? "bg-white" 
              : "bg-[hsl(var(--color-foreground)/0.6)] border border-[hsl(var(--color-border))]",
            // Position
            checked ? "translate-x-5" : "translate-x-0.5",
            // Disabled state for thumb
            disabled && "opacity-50"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
