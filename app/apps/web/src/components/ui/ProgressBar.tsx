import clsx from "clsx";

/** 0-100 progress bar. Used for the batch AI-generate progress and the quiz-timer countdown. */
export function ProgressBar({ percent, className, barClassName }: { percent: number; className?: string; barClassName?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-ink/10", className)}>
      <div
        className={clsx("h-full rounded-full bg-gradient-to-r from-accent via-[#ef6c3b] to-gold transition-[width]", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
