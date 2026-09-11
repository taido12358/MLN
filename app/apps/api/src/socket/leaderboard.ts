import type { PrismaClient } from "@prisma/client";
import { calcUpvoteBonus, type LeaderboardRow } from "@mln/shared";

/**
 * Total score = SUM(Answer.pointsAwarded + Answer.streakBonus) across the room, plus
 * calcUpvoteBonus() applied ONCE to the participant's total upvotes received across every
 * DiscussionPost they made in the room (not per-post) — a single 0-10-vote cap per room, not
 * per post, so one popular post can't be split into many to farm the bonus repeatedly.
 * Nothing is cached: always recomputed from raw Answer/DiscussionPost rows per the plan's "keep
 * every component transparent, don't store a hardened total" requirement.
 */
export async function computeRoomLeaderboard(prisma: PrismaClient, roomId: string): Promise<LeaderboardRow[]> {
  const [participants, answerSums, postSums] = await Promise.all([
    prisma.participant.findMany({ where: { roomId }, select: { id: true, nickname: true } }),
    prisma.answer.groupBy({
      by: ["participantId"],
      where: { roomId },
      _sum: { pointsAwarded: true, streakBonus: true },
    }),
    prisma.discussionPost.groupBy({
      by: ["participantId"],
      where: { roomId },
      _sum: { upvotes: true },
    }),
  ]);

  const quizScoreByParticipant = new Map<string, number>();
  for (const row of answerSums) {
    quizScoreByParticipant.set(row.participantId, (row._sum.pointsAwarded ?? 0) + (row._sum.streakBonus ?? 0));
  }
  const upvotesByParticipant = new Map<string, number>();
  for (const row of postSums) {
    upvotesByParticipant.set(row.participantId, row._sum.upvotes ?? 0);
  }

  const scored = participants.map((p) => {
    const quizScore = quizScoreByParticipant.get(p.id) ?? 0;
    const upvoteBonus = calcUpvoteBonus(upvotesByParticipant.get(p.id) ?? 0);
    return { participantId: p.id, nickname: p.nickname, score: quizScore + upvoteBonus };
  });

  scored.sort((a, b) => b.score - a.score);

  // Standard competition ranking: ties share a rank, the next distinct score skips ahead
  // (e.g. scores [100,100,80] -> ranks [1,1,3]) so "Quán quân"/"hạng 1" ties are both #1.
  const rows: LeaderboardRow[] = [];
  let lastScore: number | null = null;
  let lastRank = 0;
  scored.forEach((s, idx) => {
    const rank = s.score === lastScore ? lastRank : idx + 1;
    lastScore = s.score;
    lastRank = rank;
    rows.push({ participantId: s.participantId, nickname: s.nickname, score: s.score, rank });
  });
  return rows;
}

/**
 * Ranking restricted to quiz scoring only (no discussion upvote bonus) across a specific subset of
 * QuizQuestion ids — used to reconstruct "rank at halfway" retrospectively at host:endRoom, scoped to
 * the first half of the room's questionSequence, since no live snapshot is kept (see roomState.ts).
 */
export async function computeQuizOnlyRanking(
  prisma: PrismaClient,
  roomId: string,
  quizQuestionIds: string[],
): Promise<Map<string, number>> {
  const [participants, answerSums] = await Promise.all([
    prisma.participant.findMany({ where: { roomId }, select: { id: true } }),
    prisma.answer.groupBy({
      by: ["participantId"],
      where: { roomId, quizQuestionId: { in: quizQuestionIds } },
      _sum: { pointsAwarded: true, streakBonus: true },
    }),
  ]);

  const scoreByParticipant = new Map<string, number>();
  for (const row of answerSums) {
    scoreByParticipant.set(row.participantId, (row._sum.pointsAwarded ?? 0) + (row._sum.streakBonus ?? 0));
  }

  const scored = participants.map((p) => ({ participantId: p.id, score: scoreByParticipant.get(p.id) ?? 0 }));
  scored.sort((a, b) => b.score - a.score);

  const rankByParticipant = new Map<string, number>();
  let lastScore: number | null = null;
  let lastRank = 0;
  scored.forEach((s, idx) => {
    const rank = s.score === lastScore ? lastRank : idx + 1;
    lastScore = s.score;
    lastRank = rank;
    rankByParticipant.set(s.participantId, rank);
  });
  return rankByParticipant;
}
