"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { getSocket, type HostAuth } from "@/lib/socket";
import { useRoomStore } from "@/store/useRoomStore";
import { badgeInfo } from "@/lib/badges";
import { api, type RoomDetail, type LessonUnitDetail, type QuizQuestion } from "@/lib/api";
import {
  HOST_SELECT_LESSON_UNIT,
  HOST_OPEN_QUESTION,
  HOST_FORCE_CLOSE_QUESTION,
  HOST_OPEN_DISCUSSION,
  HOST_CLOSE_DISCUSSION,
  HOST_SHOW_LEADERBOARD,
  HOST_NEXT_STEP,
  HOST_END_ROOM,
} from "@mln/shared";

/**
 * Host connects the socket with `{roomCode, hostToken}` in the handshake `auth` (see lib/socket.ts)
 * — verified in apps/api/src/socket/index.ts's `io.use` middleware, which looks the room up by
 * `roomCode` and compares `hostToken`. On success the server joins this socket to `room:<roomCode>`
 * automatically, so no separate "host join" event is needed to receive room broadcasts.
 */
export default function HostRoomPage({ params }: { params: { roomCode: string } }) {
  const roomCode = params.roomCode.toUpperCase();
  const router = useRouter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [hostAuth, setHostAuth] = useState<HostAuth | null>(null);
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [activeUnit, setActiveUnit] = useState<LessonUnitDetail | null>(null);
  const [timeLimitSec, setTimeLimitSec] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const store = useRoomStore();

  useEffect(() => {
    const at = localStorage.getItem("mln:adminToken");
    if (!at) return router.replace("/host");
    setAdminToken(at);

    let ht = new URLSearchParams(window.location.search).get("hostToken");
    if (ht) sessionStorage.setItem(`mln:hostToken:${roomCode}`, ht);
    else ht = sessionStorage.getItem(`mln:hostToken:${roomCode}`);
    if (!ht) {
      setError("Thiếu hostToken cho phòng này — hãy vào từ trang Quản lý nội dung.");
      return;
    }
    const auth: HostAuth = { roomCode, hostToken: ht };
    setHostAuth(auth);

    api
      .roomByCode(roomCode, ht)
      .then(setRoom)
      .catch(() => setError("Không tìm thấy phòng hoặc hostToken sai."));

    const socket = getSocket(auth);
    const detach = store.attach(socket);
    return () => detach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  useEffect(() => {
    if (store.ended) confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ended]);

  async function loadUnit(lessonUnitId: string) {
    if (!adminToken) return;
    const detail = await api.lessonUnit(lessonUnitId, adminToken);
    setActiveUnit(detail);
  }

  function startLessonUnit(lessonUnitId: string) {
    getSocket(hostAuth || undefined).emit(HOST_SELECT_LESSON_UNIT, { roomCode, lessonUnitId });
  }

  function openQuestion(q: QuizQuestion) {
    getSocket(hostAuth || undefined).emit(HOST_OPEN_QUESTION, { roomCode, quizQuestionId: q.id, timeLimitSec });
  }

  function forceClose() {
    getSocket(hostAuth || undefined).emit(HOST_FORCE_CLOSE_QUESTION, { roomCode });
  }

  function openDiscussion(discussionQuestionId: string) {
    getSocket(hostAuth || undefined).emit(HOST_OPEN_DISCUSSION, { roomCode, discussionQuestionId });
  }

  function closeDiscussion() {
    getSocket(hostAuth || undefined).emit(HOST_CLOSE_DISCUSSION, { roomCode });
  }

  function showLeaderboard() {
    getSocket(hostAuth || undefined).emit(HOST_SHOW_LEADERBOARD, { roomCode });
  }

  function nextStep() {
    getSocket(hostAuth || undefined).emit(HOST_NEXT_STEP, { roomCode });
  }

  function endRoom() {
    if (!confirm("Kết thúc phòng học? Không thể mở lại.")) return;
    getSocket(hostAuth || undefined).emit(HOST_END_ROOM, { roomCode });
  }

  if (error) return <CenteredError message={error} />;
  if (!room) return <p className="p-8 text-center text-white/50">Đang tải phòng…</p>;

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="flex flex-1 items-center justify-center bg-black/20 p-8">
        <ProjectorView />
      </section>

      <aside className="w-full space-y-4 overflow-y-auto border-t border-white/10 bg-panel p-4 lg:w-96 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold">
            Phòng <span className="text-accent2">{roomCode}</span>
          </h1>
          <span className="text-xs text-white/40">{store.participantCount} người</span>
        </div>

        <div>
          <h2 className="mb-1 text-xs font-bold uppercase text-white/40">Danh sách chủ đề</h2>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-panel2 p-1">
            {room.playlistItems.map((item) => (
              <button
                key={item.id}
                onClick={() => loadUnit(item.lessonUnitId)}
                className={`block w-full rounded px-2 py-1.5 text-left text-sm ${
                  activeUnit?.id === item.lessonUnitId ? "bg-accent text-ink font-bold" : "hover:bg-white/5"
                }`}
              >
                {item.lessonUnit.chapterLabel ? `${item.lessonUnit.chapterLabel} · ` : ""}
                {item.lessonUnit.title}
              </button>
            ))}
          </div>
          <button onClick={nextStep} className="mt-2 w-full rounded-lg bg-white/10 py-2 text-sm font-bold">
            ⏭ Chủ đề tiếp theo
          </button>
        </div>

        {activeUnit && (
          <div className="space-y-3 rounded-lg bg-panel2 p-3">
            <button onClick={() => startLessonUnit(activeUnit.id)} className="w-full rounded-lg bg-accent py-2 text-sm font-bold text-ink">
              ▶ Bắt đầu chủ đề này
            </button>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-white/40">Câu hỏi trắc nghiệm (đã xuất bản)</h3>
                <input
                  type="number"
                  value={timeLimitSec}
                  onChange={(e) => setTimeLimitSec(Number(e.target.value) || 20)}
                  className="w-14 rounded bg-panel px-1 py-0.5 text-center text-xs"
                  min={5}
                  max={120}
                />
              </div>
              <div className="mt-1 max-h-40 space-y-1 overflow-y-auto">
                {activeUnit.quizQuestions
                  .filter((q) => q.status === "PUBLISHED")
                  .map((q) => (
                    <button key={q.id} onClick={() => openQuestion(q)} className="block w-full truncate rounded bg-panel px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-ink">
                      {q.question}
                    </button>
                  ))}
                {activeUnit.quizQuestions.filter((q) => q.status === "PUBLISHED").length === 0 && (
                  <p className="text-xs text-white/40">Chưa có câu hỏi đã xuất bản cho chủ đề này.</p>
                )}
              </div>
              <button onClick={forceClose} className="mt-1 w-full rounded bg-wrong/70 py-1.5 text-xs font-bold">
                Đóng câu hỏi sớm
              </button>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase text-white/40">Thảo luận</h3>
              <div className="mt-1 max-h-32 space-y-1 overflow-y-auto">
                {activeUnit.discussionQuestions.map((dq) => (
                  <button key={dq.id} onClick={() => openDiscussion(dq.id)} className="block w-full truncate rounded bg-panel px-2 py-1.5 text-left text-xs hover:bg-accent2 hover:text-ink">
                    {dq.question}
                  </button>
                ))}
              </div>
              <button onClick={closeDiscussion} className="mt-1 w-full rounded bg-white/10 py-1.5 text-xs font-bold">
                Đóng thảo luận
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={showLeaderboard} className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-bold">
            🏆 Bảng xếp hạng
          </button>
          <button onClick={endRoom} className="flex-1 rounded-lg bg-wrong/80 py-2 text-sm font-bold">
            ⏹ Kết thúc
          </button>
        </div>
      </aside>
    </main>
  );
}

function ProjectorView() {
  const s = useRoomStore();

  if (s.ended) {
    return (
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-black">🎊 Kết thúc buổi học</h1>
        <div className="mt-8 space-y-3">
          {s.leaderboard.slice(0, 10).map((r) => (
            <div key={r.participantId} className="flex items-center gap-4 rounded-xl bg-panel px-5 py-3 text-2xl">
              <span className="w-12 font-black text-accent2">#{r.rank}</span>
              <span className="flex-1 text-left font-bold">{r.nickname}</span>
              <span className="font-black">{r.score}</span>
              <span>{(s.ended!.badgesByParticipant[r.participantId] || []).map((c) => badgeInfo(c).emoji).join(" ")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (s.roomState === "LEADERBOARD") {
    return (
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-black">🏆 Bảng xếp hạng</h1>
        <div className="mt-8 space-y-3">
          {s.leaderboard.map((r) => (
            <div key={r.participantId} className="flex items-center gap-4 rounded-xl bg-panel px-5 py-3 text-2xl">
              <span className="w-12 font-black text-accent2">#{r.rank}</span>
              <span className="flex-1 text-left font-bold">{r.nickname}</span>
              <span className="font-black">{r.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (s.roomState === "QUIZ_QUESTION" && s.currentQuestion) {
    return (
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-black leading-snug">{s.currentQuestion.question}</h1>
        <p className="mt-4 text-xl text-white/60">
          {s.answerCount ? `${s.answerCount.answeredCount}/${s.answerCount.totalParticipants} đã trả lời` : "Đang chờ trả lời…"}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {s.currentQuestion.options.map((o, i) => (
            <div key={i} className={`rounded-2xl p-6 text-xl font-bold ${["bg-kahoot-a", "bg-kahoot-b", "bg-kahoot-c", "bg-kahoot-d"][i]}`}>
              {o}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (s.roomState === "QUIZ_REVIEW" && s.questionClosed) {
    const max = Math.max(1, ...s.questionClosed.optionCounts);
    return (
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-black">Kết quả</h1>
        <p className="mt-2 text-lg text-white/60">{s.questionClosed.explanation}</p>
        <div className="mt-6 space-y-3">
          {s.questionClosed.optionCounts.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${i === s.questionClosed!.correctIndex ? "bg-correct" : "bg-white/30"}`} style={{ width: `${(c / max) * 100}%` }} />
              </div>
              <span className="w-8 text-xl font-bold">{c}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (s.roomState === "DISCUSSION_OPEN" && s.discussionQuestion) {
    return (
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-black">{s.discussionQuestion.question}</h1>
        <div className="mt-8 space-y-2">
          {s.posts
            .slice()
            .sort((a, b) => b.upvotes - a.upvotes)
            .slice(0, 8)
            .map((p) => (
              <div key={p.postId} className="rounded-xl bg-panel px-5 py-3 text-left text-lg">
                <span className="font-bold text-accent2">{p.nickname}: </span>
                {p.content} <span className="text-white/40">▲{p.upvotes}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-2xl text-white/40">Màn hình lớp sẽ hiện tại đây khi bắt đầu chủ đề.</p>
      <p className="mt-2 text-white/30">{s.participantCount} người đã tham gia</p>
    </div>
  );
}

function CenteredError({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="text-wrong">{message}</p>
    </main>
  );
}
