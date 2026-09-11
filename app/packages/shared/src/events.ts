/**
 * Socket.io event contract shared between apps/api and apps/web. String constants (not TS enums)
 * so they serialize identically regardless of CJS/ESM interop on either side.
 */

export type RoomStateValue =
  | "LOBBY"
  | "PRESENTING"
  | "QUIZ_QUESTION"
  | "QUIZ_REVIEW"
  | "DISCUSSION_OPEN"
  | "DISCUSSION_CLOSED"
  | "LEADERBOARD"
  | "ENDED";

export interface LeaderboardRow {
  participantId: string;
  nickname: string;
  score: number;
  rank: number;
}

export interface RoomStateSnapshot {
  roomCode: string;
  state: RoomStateValue;
  currentLessonUnitId: string | null;
  participantCount: number;
  /** "Resume" fields — populated so a (re)join lands directly on the room's current content instead
   * of a generic "waiting" placeholder. All optional/absent-when-not-applicable rather than null,
   * so older/simpler consumers can ignore them entirely. QUIZ_REVIEW and ENDED are deliberately NOT
   * reconstructed here (no `lastClosedQuestionId`/final-badges snapshot is kept) — a rejoin during
   * those two brief, non-time-pressured states degrades to that view's own loading placeholder,
   * same as before this field existed. */
  currentLessonUnitTitle?: string | null;
  currentQuestion?: QuizQuestionOpenedPayload | null;
  discussionQuestion?: DiscussionOpenedPayload | null;
  discussionPosts?: DiscussionNewPostPayload[];
  leaderboard?: LeaderboardRow[];
}

// ---------------------------------------------------------------------------
// Client -> Server
// ---------------------------------------------------------------------------

export const PARTICIPANT_JOIN = "participant:join";
export interface ParticipantJoinPayload {
  roomCode: string;
  nickname: string;
  /** Present on reconnect (read from localStorage) so the server restores identity/score instead of creating a new participant. */
  participantId?: string;
}
export interface ParticipantJoinAck {
  participantId: string;
  roomState: RoomStateSnapshot;
}

export const QUIZ_SUBMIT_ANSWER = "quiz:submitAnswer";
export interface QuizSubmitAnswerPayload {
  roomCode: string;
  questionId: string;
  selectedIndex: number;
  clientTimestamp: number;
}
export interface QuizSubmitAnswerAck {
  pointsAwarded: number;
  correct: boolean;
  correctIndex: number;
  streak: number;
}

export const DISCUSSION_SUBMIT_POST = "discussion:submitPost";
export interface DiscussionSubmitPostPayload {
  roomCode: string;
  discussionQuestionId: string;
  content: string;
}

export const DISCUSSION_UPVOTE = "discussion:upvote";
export interface DiscussionUpvotePayload {
  roomCode: string;
  postId: string;
}

// Renamed from an earlier draft's HOST_SELECT_SUBJECT/subjectId: what a host actually picks to
// project/quiz on is a LessonUnit (one of the 10 Presents topics, or one textbook chapter-chunk),
// not one of the 6 coarse Subjects — "subjectId" was inaccurate and never had a consumer yet, so
// fixed here rather than carrying the confusing name into the socket/frontend layers.
export const HOST_SELECT_LESSON_UNIT = "host:selectLessonUnit";
export interface HostSelectLessonUnitPayload {
  roomCode: string;
  lessonUnitId: string;
}

export const HOST_OPEN_QUESTION = "host:openQuestion";
export interface HostOpenQuestionPayload {
  roomCode: string;
  quizQuestionId: string;
  timeLimitSec: number;
}

export const HOST_FORCE_CLOSE_QUESTION = "host:forceCloseQuestion";
export interface HostForceCloseQuestionPayload {
  roomCode: string;
}

export const HOST_OPEN_DISCUSSION = "host:openDiscussion";
export interface HostOpenDiscussionPayload {
  roomCode: string;
  discussionQuestionId: string;
}

export const HOST_CLOSE_DISCUSSION = "host:closeDiscussion";
export interface HostCloseDiscussionPayload {
  roomCode: string;
}

export const HOST_SHOW_LEADERBOARD = "host:showLeaderboard";
export interface HostShowLeaderboardPayload {
  roomCode: string;
}

export const HOST_NEXT_STEP = "host:nextStep";
export interface HostNextStepPayload {
  roomCode: string;
}

export const HOST_END_ROOM = "host:endRoom";
export interface HostEndRoomPayload {
  roomCode: string;
}

// Read-only join for a screen that has no student identity of its own — the standalone projector
// leaderboard page (/leaderboard/[roomCode]). It only calls `socket.join()` server-side: no
// Participant row is created/updated, so opening this page never pollutes the room's real
// participant count or leaderboard, and every other event handler's `!socket.data.participantId`
// guard already rejects a viewer socket cleanly if it ever emits a student-only event.
export const VIEWER_JOIN = "viewer:join";
export interface ViewerJoinPayload {
  roomCode: string;
}
export interface ViewerJoinAck {
  roomState: RoomStateSnapshot;
}

export const LEADERBOARD_WHERE_AM_I = "leaderboard:whereAmI";
export interface LeaderboardWhereAmIPayload {
  roomCode: string;
}
export interface LeaderboardWhereAmIAck {
  rank: number;
  score: number;
  participantCount: number;
}

// ---------------------------------------------------------------------------
// Server -> Client (broadcast within room:<roomCode>)
// ---------------------------------------------------------------------------

export const ROOM_PARTICIPANT_JOINED = "room:participantJoined";
export interface RoomParticipantJoinedPayload {
  participantId: string;
  nickname: string;
  participantCount: number;
}

export const QUIZ_QUESTION_OPENED = "quiz:questionOpened";
export interface QuizQuestionOpenedPayload {
  questionId: string;
  question: string;
  options: string[];
  timeLimitSec: number;
  openedAt: number;
}

export const QUIZ_ANSWER_COUNT = "quiz:answerCount";
export interface QuizAnswerCountPayload {
  questionId: string;
  answeredCount: number;
  totalParticipants: number;
}

export const QUIZ_QUESTION_CLOSED = "quiz:questionClosed";
export interface QuizQuestionClosedPayload {
  questionId: string;
  correctIndex: number;
  explanation: string;
  optionCounts: number[];
  totalAnswered: number;
}

export const DISCUSSION_OPENED = "discussion:opened";
export interface DiscussionOpenedPayload {
  discussionQuestionId: string;
  question: string;
}

export const DISCUSSION_CLOSED = "discussion:closed";
export interface DiscussionClosedPayload {
  discussionQuestionId: string;
}

export const DISCUSSION_NEW_POST = "discussion:newPost";
export interface DiscussionNewPostPayload {
  postId: string;
  participantId: string;
  nickname: string;
  content: string;
  upvotes: number;
}

export const DISCUSSION_POST_UPDATED = "discussion:postUpdated";
export interface DiscussionPostUpdatedPayload {
  postId: string;
  upvotes: number;
}

export const ROOM_LESSON_UNIT_SELECTED = "room:lessonUnitSelected";
export interface RoomLessonUnitSelectedPayload {
  lessonUnitId: string;
  lessonUnitTitle: string;
}

export const LEADERBOARD_UPDATE = "leaderboard:update";
export interface LeaderboardUpdatePayload {
  topN: LeaderboardRow[];
}

export const ROOM_ENDED = "room:ended";
export interface RoomEndedPayload {
  finalLeaderboard: LeaderboardRow[];
  badgesByParticipant: Record<string, string[]>;
}
