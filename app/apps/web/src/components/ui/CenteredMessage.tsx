"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

/** Full-screen "emoji + title + subtitle (+ actions)" state screen — replaces the 3 independent
 * copies of this pattern (`play` page's local `CenteredMessage`, host console's `CenteredError`,
 * and the inline markup in `error.tsx`/`not-found.tsx`). `pulse` keeps the play page's original
 * "waiting" pulse-ring treatment for idle/connecting states; omit it for error-ish states. */
export function CenteredMessage({
  emoji,
  title,
  subtitle,
  pulse,
  children,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  pulse?: boolean;
  children?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div
          className={clsx(
            "inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold bg-panel text-5xl shadow-card",
            pulse && "pulse-ring animate-float-y"
          )}
        >
          {emoji}
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{subtitle}</p>}
        {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </motion.div>
    </main>
  );
}
