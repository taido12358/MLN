import type { PrismaClient } from "@prisma/client";
import * as Events from "@mln/shared";
import { getRoomState } from "../roomState.js";
import type { AppServer, AppSocket } from "../types.js";

type SubmitPostAck = (response: { postId: string } | { error: string }) => void;
type UpvoteAck = (response: { ok: true } | { error: string }) => void;

export function registerDiscussionHandlers(io: AppServer, socket: AppSocket, prisma: PrismaClient) {
  socket.on(Events.DISCUSSION_SUBMIT_POST, async (payload: Events.DiscussionSubmitPostPayload, ack?: SubmitPostAck) => {
    try {
      const participantId = socket.data.participantId;
      const roomId = socket.data.roomId;
      if (!participantId || !roomId || socket.data.roomCode !== payload.roomCode) {
        return ack?.({ error: "Chưa tham gia phòng." });
      }

      const roomState = getRoomState(payload.roomCode);
      if (
        !roomState ||
        roomState.state !== "DISCUSSION_OPEN" ||
        roomState.currentDiscussionQuestionId !== payload.discussionQuestionId
      ) {
        return ack?.({ error: "Phòng không ở trạng thái thảo luận cho câu hỏi này." });
      }

      const content = payload.content?.trim();
      if (!content) return ack?.({ error: "Nội dung không được để trống." });
      if (content.length > 500) return ack?.({ error: "Nội dung tối đa 500 ký tự." });

      const lastPostAt = roomState.lastDiscussionPostAt.get(participantId) ?? 0;
      if (Date.now() - lastPostAt < 2000) {
        return ack?.({ error: "Bạn đăng bài quá nhanh, vui lòng chờ một chút." });
      }

      const participant = await prisma.participant.findUnique({ where: { id: participantId } });
      if (!participant) return ack?.({ error: "Không tìm thấy người tham gia." });

      const post = await prisma.discussionPost.create({
        data: { roomId, discussionQuestionId: payload.discussionQuestionId, participantId, content },
      });
      roomState.lastDiscussionPostAt.set(participantId, Date.now());

      ack?.({ postId: post.id });
      io.to(`room:${payload.roomCode}`).emit(Events.DISCUSSION_NEW_POST, {
        postId: post.id,
        participantId,
        nickname: participant.nickname,
        content: post.content,
        upvotes: 0,
      } satisfies Events.DiscussionNewPostPayload);
    } catch (err) {
      console.error("[socket] discussion:submitPost lỗi:", err);
      ack?.({ error: "Lỗi khi đăng bài." });
    }
  });

  socket.on(Events.DISCUSSION_UPVOTE, async (payload: Events.DiscussionUpvotePayload, ack?: UpvoteAck) => {
    try {
      const participantId = socket.data.participantId;
      const roomId = socket.data.roomId;
      if (!participantId || !roomId || socket.data.roomCode !== payload.roomCode) {
        return ack?.({ error: "Chưa tham gia phòng." });
      }

      const post = await prisma.discussionPost.findUnique({ where: { id: payload.postId } });
      if (!post || post.roomId !== roomId) return ack?.({ error: "Không tìm thấy bài viết." });
      if (post.participantId === participantId) return ack?.({ error: "Không thể tự upvote bài của mình." });

      try {
        await prisma.postUpvote.create({ data: { postId: payload.postId, participantId } });
      } catch {
        return ack?.({ error: "Bạn đã upvote bài này rồi." });
      }

      const updated = await prisma.discussionPost.update({
        where: { id: payload.postId },
        data: { upvotes: { increment: 1 } },
      });

      ack?.({ ok: true });
      io.to(`room:${payload.roomCode}`).emit(Events.DISCUSSION_POST_UPDATED, {
        postId: updated.id,
        upvotes: updated.upvotes,
      } satisfies Events.DiscussionPostUpdatedPayload);
    } catch (err) {
      console.error("[socket] discussion:upvote lỗi:", err);
      ack?.({ error: "Lỗi khi upvote." });
    }
  });
}
