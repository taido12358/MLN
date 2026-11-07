"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

const VARIANT_CLASSES: Record<Variant, string> = {
  // Lì-xì red with a thin gold rim + light sweep on hover (globals.css `.btn-shine`).
  primary:
    "btn-shine bg-red-envelope text-gold ring-1 ring-inset ring-gold/60 shadow-glow hover:brightness-110 hover:-translate-y-px active:translate-y-0",
  secondary: "bg-panel text-ink ring-1 ring-inset ring-accent2/50 shadow-card hover:bg-panel2",
  danger: "bg-wrong/10 text-wrong ring-1 ring-inset ring-wrong/40 hover:bg-wrong/20",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-ink/5",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "px-5 py-3 text-sm rounded-2xl",
  sm: "px-3 py-2 text-xs rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

/** Shared button primitive — replaces the ~6 hand-copied gradient/secondary button strings that
 * had drifted apart in radius/padding across pages (join, host login, content admin, ...). */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, disabled, className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "tap-target inline-flex items-center justify-center gap-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...rest}
    >
      {loading && <Spinner size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
});
