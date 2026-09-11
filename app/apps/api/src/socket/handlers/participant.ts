import type { PrismaClient } from "@prisma/client";
import * as Events from "@mln/shared";
import { normalizeOptions } from "@mln/shared";
import { getOrCreateRoomState, type RoomState } from "../roomState.js";
import { computeRoomLeaderboard } from "../leaderboard.js";
import type { AppServer, AppSocket } from "../types.js";

type JoinAck = (response: Events.ParticipantJoinAck | { error: string }) => void;
type ViewerJoinAck = (response: Events.ViewerJoinAck | { error: string }) => void;
type WhereAmIAck = (response: Events.LeaderboardWhereAmIAck | { error: string }) => void;

/** Shared by participant:join and viewer:join — builds the "resume" snapshot described in
 * RoomStateSnapshot's doc comment: whatever the room is currently showing, so a (re)join lands on
 * real content instead of a placeholder. Read-only, no side effects. */
async function buildRoomStateSnapshot(
  prisma: PrismaClient,
  roomCode: string,
  roomId: string,
  roomState: RoomState,
  participantCount: number,
): Promise<Events.RoomStateSnapshot> {
  const snapshot: Events.RoomStateSnapshot = {
    roomCode,
    state: roomState.state,
    currentLessonUnitId: roomState.currentLessonUnitId,
    participantCount,
  };

  if (roomState.currentLessonUnitId) {
    const lu = await prisma.lessonUnit.findUnique({
      where: { id: roomState.currentLessonUnitId },
      select: { title: true },
    });
    snapshot.currentLessonUnitTitle = lu?.title ?? null;
  }

  if (roomState.state === "QUIZ_QUESTION" && roomState.currentQuestionId && roomState.questionOpenedAt && roomState.timeLimitMs) {
    const q = await prisma.quizQuestion.findUnique({ where: { id: roomState.currentQuestionId } });
    if (q) {
      snapshot.currentQuestion = {
        questionId: q.id,
        question: q.question,
        options: normalizeOptions(q.options),
        timeLimitSec: Math.round(roomState.timeLimitMs / 1000),
        openedAt: roomState.questionOpenedAt,
      };
    }
  }

  if ((roomState.state === "DISCUSSION_OPEN" || roomState.state === "DISCUSSION_CLOSED") && roomState.currentDiscussionQuestionId) {
    const dq = await prisma.discussionQuestion.findUnique({ where: { id: roomState.currentDiscussionQuestionId } });
    if (dq) {
      snapshot.discussionQuestion = { discussionQuestionId: dq.id, question: dq.question };
      const posts = await prisma.discussionPost.findMany({
        where: { roomId, discussionQuestionId: dq.id },
        include: { participant: { select: { nickname: true } } },
        orderBy: { createdAt: "asc" },
      });
      snapshot.discussionPosts = posts.map((p) => ({
        postId: p.id,
        participantId: p.participantId,
        nickname: p.participant.nickname,
        content: p.content,
        upvotes: p.upvotes,
      }));
    }
  }

  if (roomState.state === "LEADERBOARD") {
    const board = await computeRoomLeaderboard(prisma, roomId);
    snapshot.leaderboard = board.slice(0, 10);
  }

  return snapshot;
}

export function registerParticipantHandlers(io: AppServer, socket: AppSocket, prisma: PrismaClient) {
  socket.on(Events.PARTICIPANT_JOIN, async (payload: Events.ParticipantJoinPayload, ack?: JoinAck) => {
    try {
      const nickname = payload.nickname?.trim();
      if (!payload.roomCode || !nickname) {
        return ack?.({ error: "Thiếu mã phòng hoặc biệt danh." });
      }
      if (nickname.length > 30) {
        return ack?.({ error: "Biệt danh tối đa 30 ký tự." });
      }

      const room = await prisma.room.findUnique({ where: { code: payload.roomCode } });
      if (!room) return ack?.({ error: "Không tìm thấy phòng." });

      // Reconnect: restore the existing participant by id (from the client's localStorage) so score/
      // streak carry over. Deliberately do NOT overwrite nickname here even if the client sends a
      // different one — it's part of a @@unique([roomId, nickname]) pair and blindly renaming could
      // collide with someone else already using that name.
      let participant = payload.participantId
        ? await prisma.participant.findUnique({ where: { id: payload.participantId } })
        : null;
      if (participant && participant.roomId !== room.id) participant = null;

      if (participant) {
        participant = await prisma.participant.update({ where: { id: participant.id }, data: { connected: true } });
      } else {
        try {
          participant = await prisma.participant.upsert({
            where: { roomId_nickname: { roomId: room.id, nickname } },
            update: { connected: true },
            create: { roomId: room.id, nickname },
          });
        } catch {
          return ack?.({ error: "Biệt danh này đã có người dùng trong phòng." });
        }
      }

      socket.data.participantId = participant.id;
      socket.data.roomCode = payload.roomCode;
      socket.data.roomId = room.id;
      await socket.join(`room:${payload.roomCode}`);

      const roomState = getOrCreateRoomState(payload.roomCode);
      const participantCount = await prisma.participant.count({ where: { roomId: room.id, connected: true } });
      const snapshot = await buildRoomStateSnapshot(prisma, payload.roomCode, room.id, roomState, participantCount);

      ack?.({ participantId: participant.id, roomState: snapshot });

      io.to(`room:${payload.roomCode}`).emit(Events.ROOM_PARTICIPANT_JOINED, {
        participantId: participant.id,
        nickname: participant.nickname,
        participantCount,
      } satisfies Events.RoomParticipantJoinedPayload);
    } catch (err) {
      console.error("[socket] participant:join lỗi:", err);
      ack?.({ error: "Lỗi khi tham gia phòng." });
    }
  });

  // Read-only join for the standalone projector leaderboard page — see VIEWER_JOIN's doc comment
  // in events.ts. No Participant is created/touched, and the socket is never added to
  // socket.data.participantId, so every student-only handler's own guard already refuses anything
  // a viewer socket might (mistakenly or maliciously) emit.
  socket.on(Events.VIEWER_JOIN, async (payload: Events.ViewerJoinPayload, ack?: ViewerJoinAck) => {
    try {
      if (!payload.roomCode) return ack?.({ error: "Thiếu mã phòng." });
      const room = await prisma.room.findUnique({ where: { code: payload.roomCode } });
      if (!room) return ack?.({ error: "Không tìm thấy phòng." });

      socket.data.roomCode = payload.roomCode;
      socket.data.roomId = room.id;
      await socket.join(`room:${payload.roomCode}`);

      const roomState = getOrCreateRoomState(payload.roomCode);
      const participantCount = await prisma.participant.count({ where: { roomId: room.id, connected: true } });
      const snapshot = await buildRoomStateSnapshot(prisma, payload.roomCode, room.id, roomState, participantCount);
      ack?.({ roomState: snapshot });
    } catch (err) {
      console.error("[socket] viewer:join lỗi:", err);
      ack?.({ error: "Lỗi khi tham gia xem." });
    }
  });

  // Request/ack only — deliberately NOT broadcast, so one participant's exact rank/score isn't
  // pushed to all 70 sockets whenever anyone asks (host:showLeaderboard's topN broadcast already
  // covers the "everyone sees the top of the board" case).
  socket.on(Events.LEADERBOARD_WHERE_AM_I, async (payload: Events.LeaderboardWhereAmIPayload, ack?: WhereAmIAck) => {
    try {
      const participantId = socket.data.participantId;
      const roomId = socket.data.roomId;
      if (!participantId || !roomId || socket.data.roomCode !== payload.roomCode) {
        return ack?.({ error: "Chưa tham gia phòng." });
      }
      const board = await computeRoomLeaderboard(prisma, roomId);
      const mine = board.find((r) => r.participantId === participantId);
      if (!mine) return ack?.({ error: "Không tìm thấy thứ hạng của bạn." });
      ack?.({ rank: mine.rank, score: mine.score, participantCount: board.length });
    } catch (err) {
      console.error("[socket] leaderboard:whereAmI lỗi:", err);
      ack?.({ error: "Lỗi khi tra cứu thứ hạng." });
    }
  });

  socket.on("disconnect", async () => {
    const participantId = socket.data.participantId;
    if (!participantId) return;
    await prisma.participant.update({ where: { id: participantId }, data: { connected: false } }).catch(() => {});
  });
}
