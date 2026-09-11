import type { Server as HTTPServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "../prismaClient.js";
import { registerParticipantHandlers } from "./handlers/participant.js";
import { registerQuizHandlers } from "./handlers/quiz.js";
import { registerDiscussionHandlers } from "./handlers/discussion.js";
import { registerHostHandlers } from "./handlers/host.js";
import type { AppServer } from "./types.js";

/**
 * Host auth happens once, at the handshake, not per-event: the teacher's console connects with
 * `{auth: {roomCode, hostToken}}`. If present it must match Room.hostToken for that roomCode or the
 * connection is rejected outright (connect_error) — no partial/anonymous host sockets. Absent
 * `auth.hostToken` is a normal student connection (bare join with no token, per the plan's mã
 * phòng + biệt danh model for students); handlers below verify roomCode against socket.data set at
 * participant:join time instead.
 */
export function initSocket(httpServer: HTTPServer): AppServer {
  const io: AppServer = new SocketIOServer(httpServer, { cors: { origin: "*" } });

  io.use(async (socket, next) => {
    const auth = socket.handshake.auth as { roomCode?: string; hostToken?: string } | undefined;
    if (!auth?.hostToken) return next();

    try {
      const room = await prisma.room.findUnique({ where: { code: auth.roomCode ?? "" } });
      if (!room || room.hostToken !== auth.hostToken) {
        return next(new Error("hostToken không hợp lệ cho phòng này."));
      }
      socket.data.isHost = true;
      socket.data.roomCode = room.code;
      socket.data.roomId = room.id;
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error("Lỗi xác thực host."));
    }
  });

  io.on("connection", (socket) => {
    if (socket.data.isHost && socket.data.roomCode) {
      socket.join(`room:${socket.data.roomCode}`);
    }

    registerParticipantHandlers(io, socket, prisma);
    registerQuizHandlers(io, socket, prisma);
    registerDiscussionHandlers(io, socket, prisma);
    registerHostHandlers(io, socket, prisma);
  });

  return io;
}
