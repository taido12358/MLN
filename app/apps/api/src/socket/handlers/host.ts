import type { PrismaClient } from "@prisma/client";
import * as Events from "@mln/shared";
import { computeBadges, normalizeOptions, type ParticipantBadgeInput } from "@mln/shared";
import { getOrCreateRoomState, getRoomState, clearRoomState } from "../roomState.js";
import { computeRoomLeaderboard, computeQuizOnlyRanking } from "../leaderboard.js";
import type { AppServer, AppSocket } from "../types.js";

type SimpleAck = (response: { ok: true } | { error: string }) => void;

const MIN_TIME_LIMIT_SEC = 5;
const MAX_TIME_LIMIT_SEC = 300; // Node's setTimeout silently fires ~immediately past ~24.8 days
// (2^31-1 ms signed-int overflow) — irrelevant at these values, but an unbounded timeLimitSec was
// also just a bad idea for a live classroom regardless of that edge case, so clamp to a sane range.

function requireHost(socket: AppSocket, roomCode: string, ack?: SimpleAck): boolean {
  if (!socket.data.isHost || socket.data.roomCode !== roomCode) {
    ack?.({ error: "Không có quyền điều khiển phòng này." });
    return false;
  }
  return true;
}

/** Shared by the auto-timeout and host:forceCloseQuestion — closes whatever question is currently
 * open in the room, tallies option counts from the Answer rows just written, and broadcasts the
 * reveal. No-ops if the room isn't actually mid-question. The guard-check and the state "claim" are
 * done together, synchronously, with no `await` between them — the auto-timeout firing at the exact
 * moment a host clicks "đóng sớm" (or a retried/duplicated forceCloseQuestion emit) used to be able
 * to both pass the state check before either had mutated `roomState.state`, closing the same
 * question twice and double-broadcasting QUIZ_QUESTION_CLOSED. */
async function closeCurrentQuestion(io: AppServer, prisma: PrismaClient, roomCode: string) {
  const roomState = getRoomState(roomCode);
  if (!roomState || roomState.state !== "QUIZ_QUESTION" || !roomState.currentQuestionId) return;

  if (roomState.closeTimer) {
    clearTimeout(roomState.closeTimer);
    roomState.closeTimer = null;
  }

  const questionId = roomState.currentQuestionId;
  // Claim synchronously, before any `await`, so a concurrent call's guard check above sees
  // state !== "QUIZ_QUESTION" and no-ops instead of racing through to a second broadcast.
  roomState.state = "QUIZ_REVIEW";
  roomState.currentQuestionId = null;
  roomState.questionOpenedAt = null;

  const room = await prisma.room.findUnique({ where: { code: roomCode } });
  if (!room) return;

  const [question, answers] = await Promise.all([
    prisma.quizQuestion.findUnique({ where: { id: questionId } }),
    prisma.answer.findMany({ where: { roomId: room.id, quizQuestionId: questionId } }),
  ]);
  if (!question) return;

  const optionCounts = [0, 0, 0, 0];
  for (const a of answers) {
    if (a.selectedIndex >= 0 && a.selectedIndex < optionCounts.length) optionCounts[a.selectedIndex] += 1;
  }

  await prisma.room.update({ where: { code: roomCode }, data: { state: "QUIZ_REVIEW" } });

  io.to(`room:${roomCode}`).emit(Events.QUIZ_QUESTION_CLOSED, {
    questionId,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    optionCounts,
    totalAnswered: answers.length,
  } satisfies Events.QuizQuestionClosedPayload);
}

export function registerHostHandlers(io: AppServer, socket: AppSocket, prisma: PrismaClient) {
  socket.on(Events.HOST_SELECT_LESSON_UNIT, async (payload: Events.HostSelectLessonUnitPayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      const lessonUnit = await prisma.lessonUnit.findUnique({ where: { id: payload.lessonUnitId } });
      if (!lessonUnit) return ack?.({ error: "Không tìm thấy chủ đề." });

      const roomState = getOrCreateRoomState(payload.roomCode);
      roomState.currentLessonUnitId = lessonUnit.id;
      roomState.state = "PRESENTING";
      roomState.questionSequence = [];
      roomState.currentQuestionId = null;
      roomState.currentDiscussionQuestionId = null;

      await prisma.room.update({
        where: { code: payload.roomCode },
        data: { currentLessonUnitId: lessonUnit.id, state: "PRESENTING" },
      });

      ack?.({ ok: true });
      io.to(`room:${payload.roomCode}`).emit(Events.ROOM_LESSON_UNIT_SELECTED, {
        lessonUnitId: lessonUnit.id,
        lessonUnitTitle: lessonUnit.title,
      } satisfies Events.RoomLessonUnitSelectedPayload);
    } catch (err) {
      console.error("[socket] host:selectLessonUnit lỗi:", err);
      ack?.({ error: "Lỗi khi chọn chủ đề." });
    }
  });

  socket.on(Events.HOST_OPEN_QUESTION, async (payload: Events.HostOpenQuestionPayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      const question = await prisma.quizQuestion.findUnique({ where: { id: payload.quizQuestionId } });
      if (!question) return ack?.({ error: "Không tìm thấy câu hỏi." });

      const roomState = getOrCreateRoomState(payload.roomCode);

      // The draft→published review gate is the whole point of the AI-generation pipeline — an
      // unreviewed draft (possibly wrong/AI-hallucinated) must never be openable to the class.
      if (question.status !== "PUBLISHED") {
        return ack?.({ error: "Câu hỏi này chưa được duyệt (còn ở trạng thái nháp)." });
      }
      if (question.lessonUnitId !== roomState.currentLessonUnitId) {
        return ack?.({ error: "Câu hỏi này không thuộc chủ đề đang chọn của phòng." });
      }

      if (roomState.closeTimer) clearTimeout(roomState.closeTimer);

      const timeLimitSec = Math.min(
        MAX_TIME_LIMIT_SEC,
        Math.max(MIN_TIME_LIMIT_SEC, Number.isFinite(payload.timeLimitSec) ? Math.round(payload.timeLimitSec) : 20),
      );
      roomState.state = "QUIZ_QUESTION";
      roomState.currentQuestionId = question.id;
      roomState.questionOpenedAt = Date.now();
      roomState.timeLimitMs = timeLimitSec * 1000;
      roomState.answeredParticipantIds = new Set();
      roomState.questionSequence.push(question.id);

      await prisma.room.update({ where: { code: payload.roomCode }, data: { state: "QUIZ_QUESTION" } });

      roomState.closeTimer = setTimeout(() => {
        closeCurrentQuestion(io, prisma, payload.roomCode).catch((err) =>
          console.error("[socket] auto-close câu hỏi lỗi:", err),
        );
      }, roomState.timeLimitMs);

      ack?.({ ok: true });
      io.to(`room:${payload.roomCode}`).emit(Events.QUIZ_QUESTION_OPENED, {
        questionId: question.id,
        question: question.question,
        options: normalizeOptions(question.options),
        timeLimitSec,
        openedAt: roomState.questionOpenedAt,
      } satisfies Events.QuizQuestionOpenedPayload);
    } catch (err) {
      console.error("[socket] host:openQuestion lỗi:", err);
      ack?.({ error: "Lỗi khi mở câu hỏi." });
    }
  });

  // Extends the currently-open question's deadline. Answers already submitted before the extension
  // keep the pointsAwarded they were scored with at submit time (calcQuizPoints reads roomState's
  // timeLimitMs at that moment, in quiz.ts) — only the *remaining* countdown, and any answer
  // submitted after this point, sees the new, larger timeLimitMs. That's a deliberate "no
  // retroactive rescoring" choice: an early, fast, correct answer shouldn't lose points just because
  // the teacher decided to give everyone else more time.
  socket.on(Events.HOST_EXTEND_QUESTION_TIME, async (payload: Events.HostExtendQuestionTimePayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      const roomState = getRoomState(payload.roomCode);
      if (!roomState || roomState.state !== "QUIZ_QUESTION" || !roomState.currentQuestionId || roomState.questionOpenedAt === null) {
        return ack?.({ error: "Không có câu hỏi nào đang mở để gia hạn." });
      }

      const extraSec = Math.min(60, Math.max(1, Number.isFinite(payload.extraSec) ? Math.round(payload.extraSec) : 10));
      const currentTimeLimitMs = roomState.timeLimitMs ?? 0;
      const newTimeLimitMs = Math.min(MAX_TIME_LIMIT_SEC * 1000, currentTimeLimitMs + extraSec * 1000);
      roomState.timeLimitMs = newTimeLimitMs;

      if (roomState.closeTimer) clearTimeout(roomState.closeTimer);
      const remainingMs = Math.max(0, roomState.questionOpenedAt + newTimeLimitMs - Date.now());
      const questionId = roomState.currentQuestionId;
      const openedAt = roomState.questionOpenedAt;
      roomState.closeTimer = setTimeout(() => {
        closeCurrentQuestion(io, prisma, payload.roomCode).catch((err) =>
          console.error("[socket] auto-close câu hỏi lỗi:", err),
        );
      }, remainingMs);

      ack?.({ ok: true });
      io.to(`room:${payload.roomCode}`).emit(Events.QUIZ_TIME_EXTENDED, {
        questionId,
        newTimeLimitSec: Math.round(newTimeLimitMs / 1000),
        openedAt,
      } satisfies Events.QuizTimeExtendedPayload);
    } catch (err) {
      console.error("[socket] host:extendQuestionTime lỗi:", err);
      ack?.({ error: "Lỗi khi gia hạn thời gian." });
    }
  });

  // Host-only request/ack (not broadcast) so the "who hasn't answered" list never reaches student
  // sockets. Diffs the room's currently-connected participants against roomState's live
  // answeredParticipantIds set (same data quiz:answerCount's count is derived from).
  socket.on(Events.HOST_GET_UNANSWERED, async (payload: Events.HostGetUnansweredPayload, ack?: (r: Events.HostGetUnansweredAck | { error: string }) => void) => {
    if (!requireHost(socket, payload.roomCode, ack as SimpleAck)) return;
    try {
      const roomState = getRoomState(payload.roomCode);
      if (!roomState || roomState.state !== "QUIZ_QUESTION") {
        return ack?.({ unanswered: [] });
      }
      const participants = await prisma.participant.findMany({
        where: { roomId: socket.data.roomId, connected: true },
        select: { id: true, nickname: true },
      });
      const unanswered = participants
        .filter((p) => !roomState.answeredParticipantIds.has(p.id))
        .map((p) => ({ participantId: p.id, nickname: p.nickname }));
      ack?.({ unanswered });
    } catch (err) {
      console.error("[socket] host:getUnanswered lỗi:", err);
      ack?.({ error: "Lỗi khi lấy danh sách chưa trả lời." });
    }
  });

  socket.on(Events.HOST_FORCE_CLOSE_QUESTION, async (payload: Events.HostForceCloseQuestionPayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      await closeCurrentQuestion(io, prisma, payload.roomCode);
      ack?.({ ok: true });
    } catch (err) {
      console.error("[socket] host:forceCloseQuestion lỗi:", err);
      ack?.({ error: "Lỗi khi đóng câu hỏi." });
    }
  });

  socket.on(Events.HOST_OPEN_DISCUSSION, async (payload: Events.HostOpenDiscussionPayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      const dq = await prisma.discussionQuestion.findUnique({ where: { id: payload.discussionQuestionId } });
      if (!dq) return ack?.({ error: "Không tìm thấy câu hỏi thảo luận." });

      const roomState = getOrCreateRoomState(payload.roomCode);
      if (dq.lessonUnitId !== roomState.currentLessonUnitId) {
        return ack?.({ error: "Câu hỏi thảo luận này không thuộc chủ đề đang chọn của phòng." });
      }
      roomState.state = "DISCUSSION_OPEN";
      roomState.currentDiscussionQuestionId = dq.id;
      await prisma.room.update({ where: { code: payload.roomCode }, data: { state: "DISCUSSION_OPEN" } });

      ack?.({ ok: true });
      io.to(`room:${payload.roomCode}`).emit(Events.DISCUSSION_OPENED, {
        discussionQuestionId: dq.id,
        question: dq.question,
      } satisfies Events.DiscussionOpenedPayload);
    } catch (err) {
      console.error("[socket] host:openDiscussion lỗi:", err);
      ack?.({ error: "Lỗi khi mở thảo luận." });
    }
  });

  socket.on(Events.HOST_CLOSE_DISCUSSION, async (payload: Events.HostCloseDiscussionPayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      const roomState = getOrCreateRoomState(payload.roomCode);
      const discussionQuestionId = roomState.currentDiscussionQuestionId;
      roomState.state = "DISCUSSION_CLOSED";
      roomState.currentDiscussionQuestionId = null;
      await prisma.room.update({ where: { code: payload.roomCode }, data: { state: "DISCUSSION_CLOSED" } });

      ack?.({ ok: true });
      if (discussionQuestionId) {
        io.to(`room:${payload.roomCode}`).emit(Events.DISCUSSION_CLOSED, {
          discussionQuestionId,
        } satisfies Events.DiscussionClosedPayload);
      }
    } catch (err) {
      console.error("[socket] host:closeDiscussion lỗi:", err);
      ack?.({ error: "Lỗi khi đóng thảo luận." });
    }
  });

  socket.on(Events.HOST_SHOW_LEADERBOARD, async (payload: Events.HostShowLeaderboardPayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      const room = await prisma.room.findUnique({ where: { code: payload.roomCode } });
      if (!room) return ack?.({ error: "Không tìm thấy phòng." });

      const roomState = getOrCreateRoomState(payload.roomCode);
      roomState.state = "LEADERBOARD";
      await prisma.room.update({ where: { code: payload.roomCode }, data: { state: "LEADERBOARD" } });

      const board = await computeRoomLeaderboard(prisma, room.id);
      ack?.({ ok: true });
      io.to(`room:${payload.roomCode}`).emit(Events.LEADERBOARD_UPDATE, {
        topN: board.slice(0, 10),
      } satisfies Events.LeaderboardUpdatePayload);
    } catch (err) {
      console.error("[socket] host:showLeaderboard lỗi:", err);
      ack?.({ error: "Lỗi khi hiển thị bảng xếp hạng." });
    }
  });

  socket.on(Events.HOST_NEXT_STEP, async (payload: Events.HostNextStepPayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      const room = await prisma.room.findUnique({ where: { code: payload.roomCode } });
      if (!room) return ack?.({ error: "Không tìm thấy phòng." });

      const playlist = await prisma.roomPlaylistItem.findMany({
        where: { roomId: room.id },
        orderBy: { orderIndex: "asc" },
        include: { lessonUnit: true },
      });
      const currentIdx = playlist.findIndex((item) => item.lessonUnitId === room.currentLessonUnitId);
      const next = playlist[currentIdx + 1];
      if (!next) return ack?.({ error: "Đã hết danh sách chủ đề trong phòng." });

      const roomState = getOrCreateRoomState(payload.roomCode);
      roomState.currentLessonUnitId = next.lessonUnitId;
      roomState.state = "PRESENTING";
      roomState.questionSequence = [];
      roomState.currentQuestionId = null;
      roomState.currentDiscussionQuestionId = null;

      await prisma.room.update({
        where: { code: payload.roomCode },
        data: { currentLessonUnitId: next.lessonUnitId, state: "PRESENTING" },
      });

      ack?.({ ok: true });
      io.to(`room:${payload.roomCode}`).emit(Events.ROOM_LESSON_UNIT_SELECTED, {
        lessonUnitId: next.lessonUnitId,
        lessonUnitTitle: next.lessonUnit.title,
      } satisfies Events.RoomLessonUnitSelectedPayload);
    } catch (err) {
      console.error("[socket] host:nextStep lỗi:", err);
      ack?.({ error: "Lỗi khi chuyển chủ đề." });
    }
  });

  socket.on(Events.HOST_END_ROOM, async (payload: Events.HostEndRoomPayload, ack?: SimpleAck) => {
    if (!requireHost(socket, payload.roomCode, ack)) return;
    try {
      const room = await prisma.room.findUnique({ where: { code: payload.roomCode } });
      if (!room) return ack?.({ error: "Không tìm thấy phòng." });

      const roomState = getOrCreateRoomState(payload.roomCode);
      roomState.state = "ENDED";
      await prisma.room.update({ where: { code: payload.roomCode }, data: { state: "ENDED" } });

      const finalLeaderboard = await computeRoomLeaderboard(prisma, room.id);
      const finalRankByParticipant = new Map(finalLeaderboard.map((r) => [r.participantId, r.rank]));

      const totalQuestionsOpened = roomState.questionSequence.length;
      const halfwayCount = Math.floor(totalQuestionsOpened / 2);
      const halfwayQuestionIds = roomState.questionSequence.slice(0, halfwayCount);
      const rankAtHalfwayByParticipant =
        halfwayQuestionIds.length > 0 ? await computeQuizOnlyRanking(prisma, room.id, halfwayQuestionIds) : new Map();

      const participants = await prisma.participant.findMany({ where: { roomId: room.id } });

      // Batched instead of 2 queries per participant (was a real N+1 — 70 participants meant 140
      // extra round-trips on the one action that runs once per class session, right when everyone's
      // watching the screen for their final score).
      const [allAnswers, upvoteMaxByParticipant] = await Promise.all([
        prisma.answer.findMany({ where: { roomId: room.id }, select: { participantId: true, isCorrect: true, responseTimeMs: true } }),
        prisma.discussionPost.groupBy({ by: ["participantId"], where: { roomId: room.id }, _max: { upvotes: true } }),
      ]);
      const answersByParticipant = new Map<string, typeof allAnswers>();
      for (const a of allAnswers) {
        const list = answersByParticipant.get(a.participantId) ?? [];
        list.push(a);
        answersByParticipant.set(a.participantId, list);
      }
      const bestUpvotesByParticipant = new Map(upvoteMaxByParticipant.map((r) => [r.participantId, r._max.upvotes ?? 0]));

      const badgeInputs: ParticipantBadgeInput[] = participants.map((p) => {
        const answers = answersByParticipant.get(p.id) ?? [];
        const totalAnswered = answers.length;
        const correctAnswers = answers.filter((a) => a.isCorrect);
        const totalCorrect = correctAnswers.length;
        const avgCorrectResponseTimeMs =
          totalCorrect > 0
            ? Math.round(correctAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0) / totalCorrect)
            : null;

        return {
          participantId: p.id,
          totalCorrect,
          totalAnswered,
          avgCorrectResponseTimeMs,
          maxStreak: roomState.maxStreakReached.get(p.id) ?? 0,
          rankAtHalfway: rankAtHalfwayByParticipant.get(p.id) ?? null,
          finalRank: finalRankByParticipant.get(p.id) ?? participants.length,
          discussionUpvotesReceived: bestUpvotesByParticipant.get(p.id) ?? 0,
        };
      });

      const badgesByParticipantMap = computeBadges({ participants: badgeInputs, totalQuestionsOpened });

      const badgeRows = await prisma.badge.findMany();
      const badgeIdByCode = new Map(badgeRows.map((b) => [b.code, b.id]));
      const badgesByParticipant: Record<string, string[]> = {};
      for (const [participantId, codes] of badgesByParticipantMap.entries()) {
        badgesByParticipant[participantId] = codes;
        for (const code of codes) {
          const badgeId = badgeIdByCode.get(code);
          if (!badgeId) continue;
          await prisma.participantBadge
            .create({ data: { participantId, badgeId, roomId: room.id } })
            .catch(() => {
              /* already awarded (unique participantId+badgeId+roomId) — fine on a retried endRoom call */
            });
        }
      }

      ack?.({ ok: true });
      io.to(`room:${payload.roomCode}`).emit(Events.ROOM_ENDED, {
        finalLeaderboard,
        badgesByParticipant,
      } satisfies Events.RoomEndedPayload);

      // The room is done — nothing further reads its in-memory RoomState (a page refresh on
      // /leaderboard or /play re-derives everything from Postgres). Without this, `rooms` in
      // roomState.ts grows by one entry for every class session ever run, for the life of the
      // process — small per-entry, but genuinely unbounded over a semester of daily classes.
      clearRoomState(payload.roomCode);
    } catch (err) {
      console.error("[socket] host:endRoom lỗi:", err);
      ack?.({ error: "Lỗi khi kết thúc phòng." });
    }
  });
}
