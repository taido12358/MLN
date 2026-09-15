"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { getSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/useRoomStore";
import { LeaderboardList } from "@/components/LeaderboardList";
import { VIEWER_JOIN, type ViewerJoinAck } from "@mln/shared";

export default function StandaloneLeaderboardPage({ params }: { params: { roomCode: string } }) {
  const roomCode = params.roomCode.toUpperCase();
  const store = useRoomStore();
  const fired = useRef(false);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const socket = getSocket();
    const detach = store.attach(socket);

    // Read-only join: just tells the server to socket.join() this room so broadcasts (leaderboard
    // updates, room:ended) actually reach this tab. Without emitting anything at all, a fresh
    // connection is never added to `room:<code>` server-side and this screen would sit on "chờ
    // giáo viên mở bảng xếp hạng" forever even after the host opens it. Re-emitted on every
    // `connect` (including socket.io's automatic reconnect) for the same reason PARTICIPANT_JOIN is
    // in play/[roomCode]/page.tsx.
    function join() {
      socket.timeout(8000).emit(VIEWER_JOIN, { roomCode }, (err: Error | null, ack: ViewerJoinAck) => {
        if (!err && ack?.roomState) store.syncFromJoin(ack.roomState);
      });
    }
    function onConnect() {
      setConnected(true);
      join();
    }
    function onDisconnect() {
      setConnected(false);
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setConnected(socket.connected);
    if (socket.connected) join();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  useEffect(() => {
    if (store.ended && !fired.current) {
      fired.current = true;
      confetti({ particleCount: 220, spread: 130, origin: { y: 0.4 } });
    }
  }, [store.ended]);

  const rows = store.leaderboard;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      {/* This screen runs unattended on a projector — a dropped connection would otherwise freeze
          silently with no one around to notice, so make it impossible to miss. */}
      {!connected && (
        <div className="fixed inset-x-0 top-0 flex items-center justify-center gap-2 bg-wrong px-4 py-2 text-sm font-bold text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          Mất kết nối — đang thử kết nối lại…
        </div>
      )}

      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <span className="block text-lg font-bold text-white/60">🏆 Bảng xếp hạng</span>
        <span className="mt-1 block text-5xl font-black tracking-widest text-accent2">{roomCode}</span>
      </motion.h1>

      <div className="mt-10 w-full max-w-2xl">
        {rows.length === 0 && <p className="text-center text-white/40">Chưa có dữ liệu — chờ giáo viên mở bảng xếp hạng.</p>}
        <LeaderboardList rows={rows} size="lg" staggered badgesByParticipant={store.ended?.badgesByParticipant} />
      </div>
    </main>
  );
}
