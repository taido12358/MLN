import confetti from "canvas-confetti";

/** Tết-coloured confetti: lì-xì red, gold, cream and bamboo green instead of the library's default
 * rainbow. One place to change the palette for all 4 celebration call sites (correct answer,
 * session end on the student screen, projector leaderboard, host console). */
const TET_COLORS = ["#d7261e", "#f6cf5a", "#e5a41c", "#fff2b0", "#3f9d3a"];

export function tetConfetti(options: confetti.Options = {}) {
  return confetti({ colors: TET_COLORS, ...options });
}
