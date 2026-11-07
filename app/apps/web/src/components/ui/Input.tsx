"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  trailing?: ReactNode;
}

/** Shared text input primitive — replaces the hand-copied `rounded-xl/2xl border border-white/10
 * bg-panel(2) px-4 py-* ring-accent` strings that disagreed on radius/background across pages. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, trailing, className, id, ...rest },
  ref
) {
  const inputEl = (
    <input
      ref={ref}
      id={id}
      className={clsx(
        "w-full rounded-2xl border border-accent2/40 bg-panel px-4 py-3 text-base text-ink shadow-[inset_0_1px_2px_rgba(120,40,10,0.08)] placeholder:text-muted/50 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-50",
        trailing && "pr-11",
        className
      )}
      {...rest}
    />
  );

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      {trailing ? (
        <div className="relative">
          {inputEl}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div>
        </div>
      ) : (
        inputEl
      )}
    </div>
  );
});
