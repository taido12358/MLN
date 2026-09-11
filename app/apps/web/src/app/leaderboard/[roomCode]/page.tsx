"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { getSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/useRoomStore";
import { badgeInfo } from "@/lib/badges";
import { VIEWER_JOIN, type ViewerJoinAck } from "@mln/shared";

export default function StandaloneLeaderboardPage({ params }: { params: { roomCode: string } }) {
  const roomCode = params.roomCode.toUpperCase();
  const store = useRoomStore();
  const fired = useRef(false);

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
    socket.on("connect", join);
    if (socket.connected) join();

    return () => {
      socket.off("connect", join);
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
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black">
        🏆 Bảng xếp hạng — {roomCode}
      </motion.h1>

      <div className="mt-10 w-full max-w-2xl space-y-3">
        {rows.length === 0 && <p className="text-center text-white/40">Chưa có dữ liệu — chờ giáo viên mở bảng xếp hạng.</p>}
        {rows.map((r, i) => (
          <motion.div
            key={r.participantId}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-xl bg-panel px-6 py-4 text-2xl shadow-lg"
          >
            <span className="w-14 font-black text-accent2">#{r.rank}</span>
            <span className="flex-1 text-left font-bold">{r.nickname}</span>
            <span className="font-black">{r.score}</span>
            {store.ended && (
              <span className="text-xl">
                {(store.ended.badgesByParticipant[r.participantId] || []).map((c) => badgeInfo(c).emoji).join(" ")}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </main>
  );
}
