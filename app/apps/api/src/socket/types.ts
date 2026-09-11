import type { Server, Socket } from "socket.io";

/** Per-connection state stashed on socket.data. Populated by participant:join for students, and by
 * the io.use() handshake middleware (checking Room.hostToken) for the teacher's host console. */
export interface SocketData {
  participantId?: string;
  roomCode?: string;
  roomId?: string;
  isHost?: boolean;
}

// Event names are emitted as the string constants from @mln/shared (events.ts) with payloads typed
// manually at each call site via `satisfies Events.XyzPayload` — not through socket.io's own
// ListenEvents/EmitEvents generic maps, so those are left as `any` here rather than fought into a
// literal-keyed interface that would fail to match dynamic const-based event names anyway.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppSocket = Socket<any, any, any, SocketData>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppServer = Server<any, any, any, SocketData>;
