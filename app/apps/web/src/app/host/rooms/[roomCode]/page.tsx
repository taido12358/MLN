"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { getSocket, emitWithAck, type HostAuth } from "@/lib/socket";
import { useRoomStore } from "@/store/useRoomStore";
import { useAdminToken } from "@/hooks/useAdminToken";
import { api, ApiError, type RoomDetail, type LessonUnitDetail, type QuizQuestion } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { CenteredMessage } from "@/components/ui/CenteredMessage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LeaderboardList } from "@/components/LeaderboardList";
import { QuizOptionTile } from "@/components/QuizOptionTile";
import {
  HOST_SELECT_LESSON_UNIT,
  HOST_OPEN_QUESTION,
  HOST_FORCE_CLOSE_QUESTION,
  HOST_EXTEND_QUESTION_TIME,
  HOST_GET_UNANSWERED,
  HOST_DELETE_POST,
  HOST_OPEN_DISCUSSION,
  HOST_CLOSE_DISCUSSION,
  HOST_SHOW_LEADERBOARD,
  HOST_NEXT_STEP,
  HOST_END_ROOM,
  ROOM_LESSON_UNIT_SELECTED,
  type HostGetUnansweredAck,
  type RoomLessonUnitSelectedPayload,
} from "@mln/shared";

const MIN_TIME_LIMIT_SEC = 5;
const MAX_TIME_LIMIT_SEC = 120;
const UNANSWERED_POLL_MS = 3000;

/**
 * Host connects the socket with `{roomCode, hostToken}` in the handshake `auth` (see lib/socket.ts)
 * — verified in apps/api/src/socket/index.ts's `io.use` middleware, which looks the room up by
 * `roomCode` and compares `hostToken`. On success the server joins this socket to `room:<roomCode>`
 * automatically, so no separate "host join" event is needed to receive room broadcasts.
 */
export default function HostRoomPage({ params }: { params: { roomCode: string } }) {
  const roomCode = params.roomCode.toUpperCase();
  const adminToken = useAdminToken();
  const [hostAuth, setHostAuth] = useState<HostAuth | null>(null);
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [activeUnit, setActiveUnit] = useState<LessonUnitDetail | null>(null);
  const [timeLimitSec, setTimeLimitSec] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [unanswered, setUnanswered] = useState<{ participantId: string; nickname: string }[]>([]);
  const [confirmEndRoom, setConfirmEndRoom] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const store = useRoomStore();

  useEffect(() => {
    if (!adminToken) return;

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
  }, [roomCode, adminToken]);

  useEffect(() => {
    if (store.ended) confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ended]);

  async function loadUnit(lessonUnitId: string) {
    if (!adminToken) return;
    const detail = await api.lessonUnit(lessonUnitId, adminToken);
    setActiveUnit(detail);
  }

  // Keeps the "đang trình chiếu" picker in sync with whatever lesson unit the room is actually on —
  // whether changed from this tab (startLessonUnit below), via host:nextStep, or from a second host
  // tab. Previously `activeUnit` only updated when this tab's own click set it, so those other paths
  // could silently leave the question/discussion pickers showing a stale unit's content.
  useEffect(() => {
    if (!hostAuth) return;
    const socket = getSocket(hostAuth);
    function onSelected(p: RoomLessonUnitSelectedPayload) {
      loadUnit(p.lessonUnitId).catch(() => setActionError("Không tải được chủ đề vừa chọn."));
    }
    socket.on(ROOM_LESSON_UNIT_SELECTED, onSelected);
    return () => {
      socket.off(ROOM_LESSON_UNIT_SELECTED, onSelected);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostAuth, adminToken]);

  // Panel "Chưa trả lời" — polls while a question is open so the host can nudge stragglers by name.
  useEffect(() => {
    if (!hostAuth || store.roomState !== "QUIZ_QUESTION") {
      setUnanswered([]);
      return;
    }
    let cancelled = false;
    async function poll() {
      try {
        const ack = await emitWithAck<{ roomCode: string }, HostGetUnansweredAck>(getSocket(hostAuth!), HOST_GET_UNANSWERED, { roomCode });
        if (!cancelled) setUnanswered(ack.unanswered);
      } catch {
        /* transient — next tick retries */
      }
    }
    poll();
    const id = setInterval(poll, UNANSWERED_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hostAuth, store.roomState, roomCode]);

  async function runHostAction<T>(event: string, payload: T) {
    if (!hostAuth) return;
    setActionError(null);
    try {
      await emitWithAck(getSocket(hostAuth), event, payload);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Lệnh không thực hiện được.");
    }
  }

  function startLessonUnit(lessonUnitId: string) {
    runHostAction(HOST_SELECT_LESSON_UNIT, { roomCode, lessonUnitId });
  }

  function openQuestion(q: QuizQuestion) {
    runHostAction(HOST_OPEN_QUESTION, { roomCode, quizQuestionId: q.id, timeLimitSec });
  }

  function forceClose() {
    runHostAction(HOST_FORCE_CLOSE_QUESTION, { roomCode });
  }

  function extendTime() {
    runHostAction(HOST_EXTEND_QUESTION_TIME, { roomCode, extraSec: 10 });
  }

  function openDiscussion(discussionQuestionId: string) {
    runHostAction(HOST_OPEN_DISCUSSION, { roomCode, discussionQuestionId });
  }

  function closeDiscussion() {
    runHostAction(HOST_CLOSE_DISCUSSION, { roomCode });
  }

  function showLeaderboard() {
    runHostAction(HOST_SHOW_LEADERBOARD, { roomCode });
  }

  function nextStep() {
    runHostAction(HOST_NEXT_STEP, { roomCode });
  }

  function endRoom() {
    setConfirmEndRoom(false);
    runHostAction(HOST_END_ROOM, { roomCode });
  }

  function confirmDeletePost() {
    if (deletePostId) runHostAction(HOST_DELETE_POST, { roomCode, postId: deletePostId });
    setDeletePostId(null);
  }

  async function downloadCsv() {
    if (!hostAuth) return;
    setActionError(null);
    try {
      const blob = await api.exportRoomCsv(roomCode, hostAuth.hostToken);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ket-qua-${roomCode}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Không tải được CSV.");
    }
  }

  if (error) return <CenteredMessage emoji="😕" title="Không vào được phòng" subtitle={error} />;
  if (!room) return <p className="p-8 text-center text-white/50">Đang tải phòng…</p>;

  const activeDiscussionQuestion = activeUnit?.discussionQuestions.find(
    (dq) => dq.id === store.discussionQuestion?.discussionQuestionId,
  );

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="flex flex-1 items-center justify-center bg-black/20 p-8">
        <ProjectorView onRequestDeletePost={setDeletePostId} />
      </section>

      <aside className="w-full space-y-4 overflow-y-auto border-t border-white/10 bg-panel p-4 lg:w-96 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold">
            Phòng <span className="text-accent2">{roomCode}</span>
          </h1>
          <span className="text-xs text-white/40">{store.participantCount} người</span>
        </div>

        {actionError && <p className="rounded-lg bg-wrong/15 px-3 py-2 text-xs text-wrong">{actionError}</p>}

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
                  onChange={(e) =>
                    setTimeLimitSec(
                      Math.min(MAX_TIME_LIMIT_SEC, Math.max(MIN_TIME_LIMIT_SEC, Number(e.target.value) || MIN_TIME_LIMIT_SEC)),
                    )
                  }
                  className="w-14 rounded bg-panel px-1 py-0.5 text-center text-xs"
                  min={MIN_TIME_LIMIT_SEC}
                  max={MAX_TIME_LIMIT_SEC}
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
              <div className="mt-1 flex gap-1">
                <button onClick={forceClose} className="flex-1 rounded bg-wrong/70 py-1.5 text-xs font-bold">
                  Đóng câu hỏi sớm
                </button>
                {store.roomState === "QUIZ_QUESTION" && (
                  <button onClick={extendTime} className="flex-1 rounded bg-accent2/80 py-1.5 text-xs font-bold text-ink">
                    +10 giây
                  </button>
                )}
              </div>
              {unanswered.length > 0 && (
                <div className="mt-1 rounded bg-panel px-2 py-1.5 text-xs text-white/60">
                  <span className="font-bold text-white/40">Chưa trả lời ({unanswered.length}): </span>
                  {unanswered.map((p) => p.nickname).join(", ")}
                </div>
              )}
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
              {activeDiscussionQuestion?.suggestedAnswer && (
                <p className="mt-1 rounded bg-panel px-2 py-1.5 text-xs italic text-white/50">
                  💡 Gợi ý dẫn dắt: {activeDiscussionQuestion.suggestedAnswer}
                </p>
              )}
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
          <button onClick={() => setConfirmEndRoom(true)} className="flex-1 rounded-lg bg-wrong/80 py-2 text-sm font-bold">
            ⏹ Kết thúc
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={downloadCsv} className="w-full">
          ⬇ Tải CSV kết quả
        </Button>
      </aside>

      <ConfirmDialog
        open={confirmEndRoom}
        title="Kết thúc phòng học?"
        description="Không thể mở lại phòng sau khi kết thúc."
        confirmLabel="Kết thúc"
        danger
        onConfirm={endRoom}
        onCancel={() => setConfirmEndRoom(false)}
      />
      <ConfirmDialog
        open={deletePostId !== null}
        title="Xoá bài thảo luận này?"
        description="Bài viết sẽ biến mất ngay khỏi màn hình mọi học viên. Không thể hoàn tác."
        confirmLabel="Xoá"
        danger
        onConfirm={confirmDeletePost}
        onCancel={() => setDeletePostId(null)}
      />
    </main>
  );
}

function ProjectorView({ onRequestDeletePost }: { onRequestDeletePost: (postId: string) => void }) {
  const s = useRoomStore();

  if (s.ended) {
    return (
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-black">🎊 Kết thúc buổi học</h1>
        <div className="mt-8">
          <LeaderboardList rows={s.leaderboard.slice(0, 10)} size="lg" badgesByParticipant={s.ended.badgesByParticipant} />
        </div>
      </div>
    );
  }

  if (s.roomState === "LEADERBOARD") {
    return (
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-black">🏆 Bảng xếp hạng</h1>
        <div className="mt-8">
          <LeaderboardList rows={s.leaderboard} size="lg" />
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
            <QuizOptionTile key={i} index={i} label={o} size="lg" />
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
              <div key={p.postId} className="flex items-center gap-3 rounded-xl bg-panel px-5 py-3 text-left text-lg">
                <div className="flex-1">
                  <span className="font-bold text-accent2">{p.nickname}: </span>
                  {p.content} <span className="text-white/40">▲{p.upvotes}</span>
                </div>
                <button
                  onClick={() => onRequestDeletePost(p.postId)}
                  aria-label={`Xoá bài của ${p.nickname}`}
                  className="tap-target shrink-0 rounded-lg bg-wrong/20 px-2 py-1 text-sm text-wrong hover:bg-wrong/30"
                >
                  ✕
                </button>
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
