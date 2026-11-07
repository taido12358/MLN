"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { LeaderboardRow } from "@mln/shared";
import { badgeInfo } from "@/lib/badges";

const MEDALS = ["🥇", "🥈", "🥉"];

/** Ranked list of participants + scores — replaces 5 near-identical copies of this row markup
 * (student play view's live leaderboard and end-of-session screen, the standalone projector
 * `/leaderboard/[roomCode]` page, and host console's live + ended projector preview), which had
 * drifted apart on radius/size/animation despite rendering the same data. `size="lg"` matches the
 * two projector-facing contexts (meant to be read from across a room); `size="sm"` matches the
 * in-hand student screen.
 *
 * Tết styling: rank 1 gets a gold "lì-xì" card, ranks 2–3 a lighter gold tint; the viewer's own
 * row (`highlightParticipantId`) gets a red rim so it stays findable regardless of rank. */
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
      {rows.map((row, i) => {
        const isMe = row.participantId === highlightParticipantId;
        const top1 = row.rank === 1;
        const top3 = row.rank <= 3;
        return (
          <motion.div
            key={row.participantId}
            layout
            initial={staggered ? { opacity: 0, x: -20 } : undefined}
            animate={staggered ? { opacity: 1, x: 0 } : undefined}
            transition={staggered ? { delay: i * 0.05 } : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-xl border shadow-card",
              size === "lg" ? "gap-4 px-5 py-3 text-2xl" : "p-3",
              top1
                ? "border-gold bg-gradient-to-r from-[#fff3c4] via-gold to-[#f0b429] text-ink"
                : top3
                  ? "border-accent2/50 bg-gradient-to-r from-panel to-[#fdebc0]"
                  : "border-accent2/25 bg-panel",
              isMe && "ring-2 ring-accent"
            )}
          >
            <span className={clsx("text-center font-black", size === "lg" ? "w-12" : "w-8 text-lg", top3 ? "text-ink" : "text-accent")}>
              {top3 ? MEDALS[row.rank - 1] : `#${row.rank}`}
            </span>
            <span className="flex-1 text-left font-semibold">{row.nickname}</span>
            <span className={clsx("font-bold", !top1 && "text-accent")}>{row.score}</span>
            {badgesByParticipant && (
              <span className={size === "lg" ? "text-xl" : "text-sm"}>
                {(badgesByParticipant[row.participantId] || []).map((c) => badgeInfo(c).emoji).join(" ")}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
