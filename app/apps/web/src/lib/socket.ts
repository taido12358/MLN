"use client";

import { io, type Socket } from "socket.io-client";

/**
 * Singleton socket per browser tab. Host pages authenticate via the connection handshake `auth`
 * (verified once in apps/api/src/socket/index.ts's `io.use` middleware), which requires BOTH
 * `roomCode` and `hostToken` — the server looks up the room by `roomCode` and compares its
 * `hostToken` column, so `hostToken` alone is not enough. Student sockets connect with no auth at
 * all; identity is established afterwards via the `participant:join` event.
 */
export interface HostAuth {
  roomCode: string;
  hostToken: string;
}

let socket: Socket | null = null;
let socketAuthKey: string | undefined;

export function getSocket(hostAuth?: HostAuth): Socket {
  const key = hostAuth ? `${hostAuth.roomCode}:${hostAuth.hostToken}` : undefined;
  if (socket && socketAuthKey === key) return socket;

  socket?.disconnect();

  // See api.ts for why this isn't `||`: "" (Docker prod, meaning "same origin via nginx") must not
  // fall back to the dev default. socket.io-client's own same-origin behavior needs `undefined`
  // passed as the uri (not ""), hence the extra `|| undefined` below.
  const envUrl = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : "http://localhost:3001";
  const opts = {
    transports: ["websocket", "polling"],
    auth: hostAuth ? { roomCode: hostAuth.roomCode, hostToken: hostAuth.hostToken } : {},
  };
  // io()'s overloads don't accept `undefined` as an explicit first argument (only a real string, or
  // omitting it entirely), so branch instead of passing `envUrl || undefined` straight through.
  socket = envUrl ? io(envUrl, opts) : io(opts);
  socketAuthKey = key;
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  socketAuthKey = undefined;
}
