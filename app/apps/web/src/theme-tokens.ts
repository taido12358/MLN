/**
 * Single source of truth for the app's color palette. `tailwind.config.ts` imports this so every
 * Tailwind class (`bg-ink`, `text-accent`, ...) stays in sync. `global-error.tsx` also imports it
 * directly — that file replaces the root layout so Tailwind/globals.css never loads there, and it
 * used to hardcode its own hex values by hand, which had quietly drifted from this palette.
 */
export const THEME = {
  ink: "#0b0a1f",
  panel: "#151233",
  panel2: "#1c1740",
  accent: "#7c5cff",
  accent2: "#22d3ee",
  correct: "#22c55e",
  wrong: "#ef4444",
  muted: "#9d99b8",
} as const;
