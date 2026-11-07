/**
 * Single source of truth for the app's color palette. `tailwind.config.ts` imports this so every
 * Tailwind class (`bg-ink`, `text-accent`, ...) stays in sync. `global-error.tsx` also imports it
 * directly — that file replaces the root layout so Tailwind/globals.css never loads there, and it
 * used to hardcode its own hex values by hand, which had quietly drifted from this palette.
 *
 * Theme "Tết" (2026-09-23): light warm palette modelled on a lì-xì tree illustration — peach-cream
 * background, red-envelope primary, gold accents, bamboo green for "correct". The token NAMES are
 * kept from the old dark theme so existing `bg-panel` / `text-accent2` usages keep working; only
 * the semantics of `ink` flipped (it used to be the dark page background, it is now the dark TEXT
 * color — `bg` is the new page background token).
 */
export const THEME = {
  /** dark maroon — body text; also used at low alpha for subtle overlays/borders on the cream bg */
  ink: "#4a1414",
  /** page background — warm peach cream */
  bg: "#fbeedc",
  /** card / panel surface */
  panel: "#fffaf3",
  /** nested surface (inputs, sub-rows) */
  panel2: "#fff1dd",
  /** primary — lì-xì red */
  accent: "#d7261e",
  /** secondary — gold (use for backgrounds/borders; for TEXT prefer `accent` or `gold-deep`) */
  accent2: "#e5a41c",
  /** bright gold highlight for gradients / shine */
  gold: "#f6cf5a",
  /** darker gold with enough contrast for small text on cream */
  "gold-deep": "#a86b06",
  /** bamboo green */
  bamboo: "#3f9d3a",
  correct: "#2f9e44",
  wrong: "#c62828",
  /** secondary text — warm brown */
  muted: "#8a5a3c",
} as const;
