import type { PrismaClient } from "@prisma/client";
import * as Events from "@mln/shared";
import { calcQuizPoints, calcStreakBonus } from "@mln/shared";
import { getRoomState } from "../roomState.js";
import type { AppServer, AppSocket } from "../types.js";

type SubmitAnswerAck = (response: Events.QuizSubmitAnswerAck | { error: string }) => void;

export function registerQuizHandlers(io: AppServer, socket: AppSocket, prisma: PrismaClient) {
  socket.on(Events.QUIZ_SUBMIT_ANSWER, async (payload: Events.QuizSubmitAnswerPayload, ack?: SubmitAnswerAck) => {
    try {
      const participantId = socket.data.participantId;
      const roomId = socket.data.roomId;
      if (!participantId || !roomId || socket.data.roomCode !== payload.roomCode) {
        return ack?.({ error: "Chưa tham gia phòng." });
      }

      const roomState = getRoomState(payload.roomCode);
      if (!roomState || roomState.state !== "QUIZ_QUESTION" || roomState.currentQuestionId !== payload.questionId) {
        return ack?.({ error: "Câu hỏi này không còn mở." });
      }
      if (roomState.answeredParticipantIds.has(participantId)) {
        return ack?.({ error: "Bạn đã trả lời câu này rồi." });
      }
      if (
        typeof payload.selectedIndex !== "number" ||
        payload.selectedIndex < 0 ||
        payload.selectedIndex > 3
      ) {
        return ack?.({ error: "selectedIndex không hợp lệ." });
      }

      const question = await prisma.quizQuestion.findUnique({ where: { id: payload.questionId } });
      if (!question) return ack?.({ error: "Không tìm thấy câu hỏi." });

      // Server-side timing only — a client-forged clientTimestamp must never affect scoring.
      const timeTakenMs = Math.max(0, Date.now() - (roomState.questionOpenedAt ?? Date.now()));
      const timeLimitMs = roomState.timeLimitMs ?? 1;
      const isCorrect = payload.selectedIndex === question.correctIndex;
      const pointsAwarded = calcQuizPoints(isCorrect, timeTakenMs, timeLimitMs);

      const prevStreak = roomState.participantStreak.get(participantId) ?? 0;
      const newStreak = isCorrect ? prevStreak + 1 : 0;
      roomState.participantStreak.set(participantId, newStreak);
      const prevMaxStreak = roomState.maxStreakReached.get(participantId) ?? 0;
      if (newStreak > prevMaxStreak) roomState.maxStreakReached.set(participantId, newStreak);
      const streakBonus = isCorrect ? calcStreakBonus(newStreak) : 0;

      // Mark answered BEFORE the awaited create() so two near-simultaneous submits from the same
      // participant can't both pass the answeredParticipantIds check above; the DB unique constraint
      // on (participantId, quizQuestionId) is the final backstop if this still races.
      roomState.answeredParticipantIds.add(participantId);

      try {
        await prisma.answer.create({
          data: {
            participantId,
            quizQuestionId: payload.questionId,
            roomId,
            selectedIndex: payload.selectedIndex,
            isCorrect,
            responseTimeMs: timeTakenMs,
            pointsAwarded,
            streakBonus,
          },
        });
      } catch {
        return ack?.({ error: "Bạn đã trả lời câu này rồi." });
      }

      ack?.({ pointsAwarded, correct: isCorrect, correctIndex: question.correctIndex, streak: newStreak });

      const totalParticipants = await prisma.participant.count({ where: { roomId, connected: true } });
      io.to(`room:${payload.roomCode}`).emit(Events.QUIZ_ANSWER_COUNT, {
        questionId: payload.questionId,
        answeredCount: roomState.answeredParticipantIds.size,
        totalParticipants,
      } satisfies Events.QuizAnswerCountPayload);
    } catch (err) {
      console.error("[socket] quiz:submitAnswer lỗi:", err);
      ack?.({ error: "Lỗi khi ghi nhận câu trả lời." });
    }
  });
}
