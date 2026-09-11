/**
 * Pure scoring/gamification functions. No Prisma/IO here so they stay trivially unit-testable —
 * callers (API layer) are responsible for aggregating raw Answer/DiscussionPost rows into the
 * shapes these functions expect.
 */

const BASE_POINTS = 1000;
const DECAY_FACTOR = 0.5;
const MIN_POINTS_IF_CORRECT = 500;
const MAX_POINTS_IF_CORRECT = 1000;
const STREAK_BONUS_PER_STEP = 50;
const MAX_STREAK_BONUS_STEPS = 5;
const UPVOTE_BONUS_PER_VOTE = 20;
const MAX_UPVOTE_BONUS_VOTES = 10;

/** Kahoot-style time-decayed scoring: faster correct answers score closer to 1000, slower closer to 500. Wrong answers score 0 (never negative — this is a political-theory class, not a penalty game). */
export function calcQuizPoints(isCorrect: boolean, timeTakenMs: number, timeLimitMs: number): number {
  if (!isCorrect) return 0;
  const ratio = timeLimitMs > 0 ? timeTakenMs / timeLimitMs : 0;
  const raw = BASE_POINTS * (1 - DECAY_FACTOR * ratio);
  return Math.min(MAX_POINTS_IF_CORRECT, Math.max(MIN_POINTS_IF_CORRECT, Math.round(raw)));
}

/** consecutiveCorrect counts the current streak INCLUDING the answer just given. First correct answer in a streak (consecutiveCorrect=1) earns no bonus; bonus starts at the 2nd consecutive correct answer. */
export function calcStreakBonus(consecutiveCorrect: number): number {
  if (consecutiveCorrect <= 1) return 0;
  return Math.min(consecutiveCorrect - 1, MAX_STREAK_BONUS_STEPS) * STREAK_BONUS_PER_STEP;
}

export function calcUpvoteBonus(upvotes: number): number {
  return Math.min(upvotes, MAX_UPVOTE_BONUS_VOTES) * UPVOTE_BONUS_PER_VOTE;
}

export interface ParticipantBadgeInput {
  participantId: string;
  totalCorrect: number;
  totalAnswered: number;
  /** null when the participant has 0 correct answers (no average to compute). */
  avgCorrectResponseTimeMs: number | null;
  maxStreak: number;
  /** 1-based rank at the halfway point of the room's quiz questions; null if not computable (e.g. room ended before halfway). */
  rankAtHalfway: number | null;
  /** 1-based final rank. */
  finalRank: number;
  /** Upvotes received on this participant's single best discussion post in the room (0 if no posts). */
  discussionUpvotesReceived: number;
}

export interface ComputeBadgesInput {
  participants: ParticipantBadgeInput[];
  /** Total quiz questions opened in the room (denominator for "Kiên trì"). */
  totalQuestionsOpened: number;
}

export const BADGE_CODES = {
  TIA_CHOP: "tia-chop",
  BAT_BAI: "bat-bai",
  CHUOI_VANG: "chuoi-vang",
  BUT_PHA: "but-pha",
  NGOI_BUT_PHAN_BIEN: "ngoi-but-phan-bien",
  LOI_NGUOC_DONG: "loi-nguoc-dong",
  QUAN_QUAN: "quan-quan",
  KIEN_TRI: "kien-tri",
} as const;

/**
 * Computes which badges each participant earned in a single room. Badges that compare participants
 * against each other (Tia chớp, Bứt phá, Ngòi bút phản biện, Lội ngược dòng) are skipped entirely when
 * there are fewer than 2 participants — a "fastest" or "most improved" among one person is meaningless.
 * Ties are allowed to win: if two participants are equally fastest/most-improved/most-upvoted, both get the badge.
 */
export function computeBadges(input: ComputeBadgesInput): Map<string, string[]> {
  const { participants, totalQuestionsOpened } = input;
  const result = new Map<string, string[]>();
  const award = (participantId: string, code: string) => {
    const list = result.get(participantId) ?? [];
    list.push(code);
    result.set(participantId, list);
  };

  const canCompare = participants.length >= 2;

  // Tia chớp — fastest average correct-answer time, among those with >= 3 correct answers.
  if (canCompare) {
    const candidates = participants.filter((p) => p.totalCorrect >= 3 && p.avgCorrectResponseTimeMs !== null);
    if (candidates.length > 0) {
      const minTime = Math.min(...candidates.map((p) => p.avgCorrectResponseTimeMs as number));
      for (const p of candidates) {
        if (p.avgCorrectResponseTimeMs === minTime) award(p.participantId, BADGE_CODES.TIA_CHOP);
      }
    }
  }

  // Bất bại — perfect score (answered at least one question, got all of them right).
  for (const p of participants) {
    if (p.totalAnswered > 0 && p.totalCorrect === p.totalAnswered) {
      award(p.participantId, BADGE_CODES.BAT_BAI);
    }
  }

  // Chuỗi vàng — reached a streak of >= 5 at some point.
  for (const p of participants) {
    if (p.maxStreak >= 5) award(p.participantId, BADGE_CODES.CHUOI_VANG);
  }

  // Bứt phá — biggest positive rank improvement from halfway to final (rank numbers going down = improving).
  if (canCompare) {
    const candidates = participants
      .filter((p) => p.rankAtHalfway !== null)
      .map((p) => ({ p, delta: (p.rankAtHalfway as number) - p.finalRank }))
      .filter((x) => x.delta > 0);
    if (candidates.length > 0) {
      const maxDelta = Math.max(...candidates.map((x) => x.delta));
      for (const x of candidates) {
        if (x.delta === maxDelta) award(x.p.participantId, BADGE_CODES.BUT_PHA);
      }
    }
  }

  // Ngòi bút phản biện — most-upvoted discussion post in the room.
  if (canCompare) {
    const candidates = participants.filter((p) => p.discussionUpvotesReceived > 0);
    if (candidates.length > 0) {
      const maxUpvotes = Math.max(...candidates.map((p) => p.discussionUpvotesReceived));
      for (const p of candidates) {
        if (p.discussionUpvotesReceived === maxUpvotes) award(p.participantId, BADGE_CODES.NGOI_BUT_PHAN_BIEN);
      }
    }
  }

  // Lội ngược dòng — was in the bottom 20% at halfway, finished in the top 50%.
  // Needs a meaningful crowd to have a "bottom 20%" at all; skip below 5 participants.
  if (participants.length >= 5) {
    const n = participants.length;
    const bottom20Threshold = Math.ceil(0.8 * n); // rank >= this is "bottom 20%"
    const top50Threshold = Math.ceil(0.5 * n); // rank <= this is "top 50%"
    for (const p of participants) {
      if (p.rankAtHalfway !== null && p.rankAtHalfway >= bottom20Threshold && p.finalRank <= top50Threshold) {
        award(p.participantId, BADGE_CODES.LOI_NGUOC_DONG);
      }
    }
  }

  // Quán quân — final rank #1 (ties at rank 1 both get it, if caller's ranking allows ties).
  for (const p of participants) {
    if (p.finalRank === 1) award(p.participantId, BADGE_CODES.QUAN_QUAN);
  }

  // Kiên trì — answered every quiz question that was opened in the room.
  if (totalQuestionsOpened > 0) {
    for (const p of participants) {
      if (p.totalAnswered === totalQuestionsOpened) award(p.participantId, BADGE_CODES.KIEN_TRI);
    }
  }

  return result;
}
