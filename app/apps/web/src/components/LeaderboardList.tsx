"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { LeaderboardRow } from "@mln/shared";
import { badgeInfo } from "@/lib/badges";

/** Ranked list of participants + scores — replaces 5 near-identical copies of this row markup
 * (student play view's live leaderboard and end-of-session screen, the standalone projector
 * `/leaderboard/[roomCode]` page, and host console's live + ended projector preview), which had
 * drifted apart on radius/size/animation despite rendering the same data. `size="lg"` matches the
 * two projector-facing contexts (meant to be read from across a room); `size="sm"` matches the
 * in-hand student screen. */
export function LeaderboardList({
  rows,
  highlightParticipantId,
  badgesByParticipant,
  size = "sm",
  staggered,
}: {
  rows: LeaderboardRow[];
  highlightParticipantId?: string | null;
  badgesByParticipant?: Record<string, string[]>;
  size?: "sm" | "lg";
  staggered?: boolean;
}) {
  return (
    <div className={clsx("space-y-2", size === "lg" && "space-y-3")}>
      {rows.map((row, i) => (
        <motion.div
          key={row.participantId}
          layout
          initial={staggered ? { opacity: 0, x: -20 } : undefined}
          animate={staggered ? { opacity: 1, x: 0 } : undefined}
          transition={staggered ? { delay: i * 0.05 } : undefined}
          className={clsx(
            "flex items-center gap-3 rounded-xl",
            size === "lg" ? "gap-4 px-5 py-3 text-2xl shadow-lg" : "p-3",
            row.participantId === highlightParticipantId ? "bg-accent/30 ring-2 ring-accent" : "bg-panel"
          )}
        >
          <span className={clsx("text-center font-black text-accent2", size === "lg" ? "w-12" : "w-8 text-lg")}>#{row.rank}</span>
          <span className="flex-1 text-left font-semibold">{row.nickname}</span>
          <span className="font-bold">{row.score}</span>
          {badgesByParticipant && (
            <span className={size === "lg" ? "text-xl" : "text-sm"}>
              {(badgesByParticipant[row.participantId] || []).map((c) => badgeInfo(c).emoji).join(" ")}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
