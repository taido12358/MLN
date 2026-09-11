"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import { PARTICIPANT_JOIN, type ParticipantJoinAck } from "@mln/shared";

export default function JoinPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const code = roomCode.trim().toUpperCase();
    const name = nickname.trim();
    if (code.length < 4) return setError("Mã phòng không hợp lệ.");
    if (name.length < 1) return setError("Vui lòng nhập biệt danh.");

    setLoading(true);
    const socket = getSocket();

    const stored = readStoredIdentity(code);

    socket.timeout(6000).emit(
      PARTICIPANT_JOIN,
      { roomCode: code, nickname: name, participantId: stored?.participantId },
      (err: Error | null, ack: ParticipantJoinAck) => {
        setLoading(false);
        if (err || !ack?.participantId) {
          setError("Không thể tham gia — kiểm tra lại mã phòng hoặc kết nối mạng.");
          return;
        }
        localStorage.setItem(
          `mln:identity:${code}`,
          JSON.stringify({ participantId: ack.participantId, nickname: name }),
        );
        router.push(`/play/${code}`);
      },
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 180 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-accent2 text-4xl shadow-glow"
        >
          🎓
        </motion.div>
        <h1 className="text-2xl font-extrabold leading-tight">
          Lớp học <span className="text-accent2">Lý luận chính trị</span>
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Tham gia buổi học tương tác — trả lời trắc nghiệm, thảo luận, leo hạng cùng cả lớp.
        </p>

        <form onSubmit={handleJoin} className="mt-8 space-y-4 text-left">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
              Mã phòng
            </label>
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="VD: 8K2QRZ"
              className="w-full rounded-2xl border border-white/10 bg-panel px-4 py-4 text-center text-2xl font-black tracking-[0.3em] outline-none ring-accent focus:ring-2"
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/50">
              Biệt danh của bạn
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 24))}
              placeholder="VD: Minh Anh"
              className="w-full rounded-2xl border border-white/10 bg-panel px-4 py-4 text-lg font-semibold outline-none ring-accent focus:ring-2"
              autoComplete="off"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-wrong">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="tap-target w-full rounded-2xl bg-gradient-to-r from-accent to-accent2 py-4 text-lg font-extrabold text-ink shadow-glow transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Đang kết nối…" : "Tham gia lớp học"}
          </button>
        </form>

        <a href="/host" className="mt-8 inline-block text-sm text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
          Giáo viên đăng nhập →
        </a>
      </motion.div>
    </main>
  );
}

function readStoredIdentity(roomCode: string): { participantId: string; nickname: string } | null {
  try {
    const raw = localStorage.getItem(`mln:identity:${roomCode}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
