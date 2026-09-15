import { ReactNode } from "react";
import clsx from "clsx";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-white/10 text-white/70",
  accent: "bg-accent2/15 text-accent2",
  success: "bg-correct/15 text-correct",
  warning: "bg-amber-400/15 text-amber-300",
  danger: "bg-wrong/15 text-wrong",
};

/** Small status pill — used for AI/manual source, difficulty, draft/published, and any other
 * short status label. Centralizes the badge styling that `/host/content` needs to actually show
 * `source`/`difficulty` (previously fetched but never rendered anywhere). */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide", TONE_CLASSES[tone])}>
      {children}
    </span>
  );
}
