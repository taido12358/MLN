import type { RoomStateValue } from "@mln/shared";

/**
 * In-memory per-room live state, keyed by room code. Deliberately NOT persisted/cached in Redis:
 * a single API process serves the whole class (see plan — Redis was cut from v1), so a plain Map
 * is both simpler and sufficient. Everything that must survive an API restart (scores, posts,
 * badges) is written straight to Postgres by the handlers; only "which question is currently open"
 * lives here and is lost on crash (acceptable — the teacher just reopens it).
 */
export interface RoomState {
  state: RoomStateValue;
  currentLessonUnitId: string | null;
  /** IDs of every QuizQuestion opened so far in this room, in the order they were opened. Used as
   * the denominator for the "Kiên trì" badge and to scope "halfway" rank snapshots. */
  questionSequence: string[];
  currentQuestionId: string | null;
  questionOpenedAt: number | null;
  timeLimitMs: number | null;
  closeTimer: NodeJS.Timeout | null;
  /** participantId set that has already answered currentQuestionId. Reset on every host:openQuestion. */
  answeredParticipantIds: Set<string>;
  /** Current live streak per participant (consecutive correct answers). Reset to 0 on a wrong/timeout answer. */
  participantStreak: Map<string, number>;
  /** High-water mark of participantStreak, ever reached in this room — feeds the "Chuỗi vàng" badge. */
  maxStreakReached: Map<string, number>;
  currentDiscussionQuestionId: string | null;
  /** Last time (Date.now()) each participant successfully posted a discussion message, in this
   * room. Backs a simple per-participant cooldown so a stuck client or an impatient double-click
   * can't flood the room's discussion wall — this is spam-proofing, not anti-cheat (anti-cheat is
   * explicitly out of MVP scope per the plan). */
  lastDiscussionPostAt: Map<string, number>;
}

// Note: "rank at halfway" for the Bứt phá / Lội ngược dòng badges is NOT tracked live here — it is
// reconstructed at host:endRoom time from persisted Answer rows, scoped to the first half of
// questionSequence (see leaderboard.ts computeQuizOnlyRanking). No total question count is known in
// advance (the host opens questions one at a time), so a live snapshot would need its own "is this
// the halfway point yet" heuristic; computing it after the fact from questionSequence's final length
// is simpler and needs no extra state here.

const rooms = new Map<string, RoomState>();

export function getOrCreateRoomState(roomCode: string): RoomState {
  let state = rooms.get(roomCode);
  if (!state) {
    state = {
      state: "LOBBY",
      currentLessonUnitId: null,
      questionSequence: [],
      currentQuestionId: null,
      questionOpenedAt: null,
      timeLimitMs: null,
      closeTimer: null,
      answeredParticipantIds: new Set(),
      participantStreak: new Map(),
      maxStreakReached: new Map(),
      currentDiscussionQuestionId: null,
      lastDiscussionPostAt: new Map(),
    };
    rooms.set(roomCode, state);
  }
  return state;
}

export function getRoomState(roomCode: string): RoomState | undefined {
  return rooms.get(roomCode);
}

export function clearRoomState(roomCode: string): void {
  const state = rooms.get(roomCode);
  if (state?.closeTimer) clearTimeout(state.closeTimer);
  rooms.delete(roomCode);
}
