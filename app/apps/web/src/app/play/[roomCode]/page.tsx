"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { tetConfetti } from "@/lib/confetti";
import { getSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/useRoomStore";
import { badgeInfo } from "@/lib/badges";
import { readStoredIdentity, writeStoredIdentity } from "@/lib/storage";
import { CenteredMessage } from "@/components/ui/CenteredMessage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Input } from "@/components/ui/Input";
import { LeaderboardList } from "@/components/LeaderboardList";
import { QuizOptionTile } from "@/components/QuizOptionTile";
import { OPTION_SHAPES } from "@/lib/quizOptions";
import {
  PARTICIPANT_JOIN,
  QUIZ_SUBMIT_ANSWER,
  DISCUSSION_SUBMIT_POST,
  DISCUSSION_UPVOTE,
  LEADERBOARD_WHERE_AM_I,
  type ParticipantJoinAck,
  type QuizSubmitAnswerAck,
  type LeaderboardWhereAmIAck,
} from "@mln/shared";

const DISCUSSION_MAX_LENGTH = 500; // matches the server-side cap in apps/api/src/socket/handlers/discussion.ts

export default function PlayPage({ params }: { params: { roomCode: string } }) {
  const roomCode = params.roomCode.toUpperCase();
  const router = useRouter();
  const store = useRoomStore();
  const [ready, setReady] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredIdentity(roomCode);
    if (!stored) {
      router.replace("/");
      return;
    }
    // Destructured into separate consts (rather than referencing `stored` directly below) so
    // TypeScript's null-narrowing above actually applies inside the `join` closure defined further
    // down — it doesn't carry the narrowing through a captured object reference.
    const { participantId: storedParticipantId, nickname: storedNickname } = stored;
    const socket = getSocket();
    const detach = store.attach(socket);

    // Re-announced on every `connect` — including socket.io's automatic reconnect after a WiFi
    // blip, not just the first mount. Without this, a reconnected socket is a brand-new Socket.io
    // instance server-side that never re-joined `room:<code>`, so the student would silently stop
    // receiving any broadcast (stuck on whatever screen they were on when the connection dropped)
    // even though their client shows "connected" again.
    function join() {
      socket.timeout(8000).emit(
        PARTICIPANT_JOIN,
        { roomCode, nickname: storedNickname, participantId: storedParticipantId },
        (err: Error | null, ack: ParticipantJoinAck) => {
          if (err || !ack?.participantId) {
            setJoinError("Không thể kết nối tới phòng. Phòng có thể đã đóng.");
            return;
          }
          store.setIdentity(roomCode, ack.participantId, storedNickname);
          store.syncFromJoin(ack.roomState);
          writeStoredIdentity(roomCode, { participantId: ack.participantId, nickname: storedNickname });
          setJoinError(null);
          setReady(true);
        },
      );
    }

    socket.on("connect", join);
    if (socket.connected) join();

    return () => {
      socket.off("connect", join);
      detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  if (joinError) {
    return (
      <CenteredMessage emoji="😕" title="Không vào được phòng" subtitle={joinError}>
        <a href="/" className="tap-target flex items-center rounded-2xl btn-shine bg-red-envelope ring-1 ring-inset ring-gold/60 shadow-glow px-5 py-3 font-bold text-gold">
          Quay lại
        </a>
      </CenteredMessage>
    );
  }

  if (!ready) {
    return <CenteredMessage pulse emoji="🔌" title="Đang kết nối…" subtitle="Đang vào phòng, chờ chút nhé." />;
  }

  return <RoomView roomCode={roomCode} />;
}

function RoomView({ roomCode }: { roomCode: string }) {
  const state = useRoomStore();

  switch (state.roomState) {
    case "QUIZ_QUESTION":
      return <QuizQuestionView roomCode={roomCode} />;
    case "QUIZ_REVIEW":
      return <QuizReviewView />;
    case "DISCUSSION_OPEN":
      return <DiscussionView roomCode={roomCode} open />;
    case "DISCUSSION_CLOSED":
      return <DiscussionView roomCode={roomCode} open={false} />;
    case "LEADERBOARD":
      return <LeaderboardView roomCode={roomCode} />;
    case "ENDED":
      return <EndedView />;
    case "PRESENTING":
      return (
        <CenteredMessage pulse emoji="📖" title="Giáo viên đang trình bày" subtitle={state.currentLessonUnitTitle ?? "Đang chuẩn bị nội dung…"}>
          <PeopleBadge count={state.participantCount} />
        </CenteredMessage>
      );
    default:
      return (
        <CenteredMessage pulse emoji="🕒" title="Đang chờ bắt đầu" subtitle="Giáo viên sẽ mở đầu buổi học ngay.">
          <PeopleBadge count={state.participantCount} />
        </CenteredMessage>
      );
  }
}

function PeopleBadge({ count }: { count: number }) {
  if (!count) return null;
  return <p className="mt-4 text-sm text-muted">{count} người đang tham gia</p>;
}

function QuizQuestionView({ roomCode }: { roomCode: string }) {
  const { currentQuestion, answerCount, addMyAnswerResult, myLastAnswer } = useRoomStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const submittedRef = useRef(false);

  useEffect(() => {
    setSelected(null);
    submittedRef.current = false;
  }, [currentQuestion?.questionId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  if (!currentQuestion) return <CenteredMessage emoji="⏳" title="Đang tải câu hỏi…" />;

  const elapsed = now - currentQuestion.openedAt;
  const totalMs = currentQuestion.timeLimitSec * 1000;
  const remainingMs = Math.max(0, totalMs - elapsed);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const pct = Math.max(0, Math.min(1, remainingMs / totalMs));
  const timeUp = remainingMs <= 0;

  function submit(index: number) {
    if (submittedRef.current || timeUp) return;
    submittedRef.current = true;
    setSelected(index);
    const socket = getSocket();
    socket.timeout(6000).emit(
      QUIZ_SUBMIT_ANSWER,
      { roomCode, questionId: currentQuestion!.questionId, selectedIndex: index, clientTimestamp: Date.now() },
      (err: Error | null, ack: QuizSubmitAnswerAck) => {
        if (!err && ack) addMyAnswerResult(ack);
      },
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{answerCount ? `${answerCount.answeredCount}/${answerCount.totalParticipants} đã trả lời` : " "}</span>
        <span className={`font-bold ${remainingSec <= 5 ? "text-wrong" : "text-ink"}`}>{remainingSec}s</span>
      </div>
      <ProgressBar percent={pct * 100} className="mt-2" barClassName="transition-[width] duration-100 ease-linear" />

      <motion.h1
        key={currentQuestion.questionId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex-1 text-balance text-center text-xl font-extrabold leading-snug"
      >
        {currentQuestion.question}
      </motion.h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {currentQuestion.options.map((opt, i) => (
          <QuizOptionTile
            key={i}
            index={i}
            label={opt}
            interactive
            selected={selected === i}
            disabled={submittedRef.current || timeUp}
            onClick={() => submit(i)}
          />
        ))}
      </div>

      {selected !== null && !myLastAnswer && (
        <p className="mt-4 text-center text-sm text-muted">Đã gửi đáp án — chờ giáo viên đóng câu hỏi…</p>
      )}
    </main>
  );
}

function QuizReviewView() {
  const { questionClosed, myLastAnswer } = useRoomStore();
  const fired = useRef(false);

  useEffect(() => {
    if (myLastAnswer?.correct && !fired.current) {
      fired.current = true;
      tetConfetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  }, [myLastAnswer]);

  if (!questionClosed) return <CenteredMessage emoji="⏳" title="Đang chấm điểm…" />;

  const maxCount = Math.max(1, ...questionClosed.optionCounts);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-6 text-center">
      {myLastAnswer ? (
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
          <div className="text-6xl">{myLastAnswer.correct ? "🎉" : "😅"}</div>
          <h1 className={`mt-3 text-2xl font-extrabold ${myLastAnswer.correct ? "text-correct" : "text-wrong"}`}>
            {myLastAnswer.correct ? "Chính xác!" : "Chưa đúng"}
          </h1>
          <p className="mt-1 text-muted">
            +{myLastAnswer.pointsAwarded} điểm{myLastAnswer.streak > 1 ? ` · chuỗi ${myLastAnswer.streak}` : ""}
          </p>
        </motion.div>
      ) : (
        <h1 className="text-xl font-bold text-muted">Bạn chưa trả lời kịp câu này</h1>
      )}

      <p className="mt-6 text-sm font-semibold text-muted">{questionClosed.explanation}</p>

      <div className="mt-6 w-full space-y-2">
        {questionClosed.optionCounts.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 text-sm">{OPTION_SHAPES[i]}</span>
            <div className="h-6 flex-1 overflow-hidden rounded-full bg-ink/10">
              <div
                className={`h-full ${i === questionClosed.correctIndex ? "bg-correct" : "bg-ink/20"}`}
                style={{ width: `${(c / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right text-sm">{c}</span>
          </div>
        ))}
      </div>
    </main>
  );
}

function DiscussionView({ roomCode, open }: { roomCode: string; open: boolean }) {
  const { discussionQuestion, posts, participantId } = useRoomStore();
  const [text, setText] = useState("");
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  function post() {
    const content = text.trim();
    if (!content || !discussionQuestion) return;
    getSocket().emit(DISCUSSION_SUBMIT_POST, { roomCode, discussionQuestionId: discussionQuestion.discussionQuestionId, content });
    setText("");
  }

  function upvote(postId: string) {
    if (upvoted.has(postId)) return;
    setUpvoted((s) => new Set(s).add(postId));
    getSocket().emit(DISCUSSION_UPVOTE, { roomCode, postId });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
      <h1 className="text-lg font-extrabold leading-snug">{discussionQuestion?.question ?? "Thảo luận"}</h1>
      {!open && <p className="mt-1 text-sm text-muted">Thảo luận đã đóng — chờ giáo viên tiếp tục.</p>}

      {open && (
        <div className="mt-4 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, DISCUSSION_MAX_LENGTH))}
            onKeyDown={(e) => e.key === "Enter" && post()}
            placeholder="Chia sẻ ý kiến của bạn…"
            maxLength={DISCUSSION_MAX_LENGTH}
            className="py-3"
          />
          <button onClick={post} className="tap-target shrink-0 btn-shine rounded-2xl bg-red-envelope px-4 py-3 font-bold text-gold ring-1 ring-inset ring-gold/60 shadow-glow">
            Gửi
          </button>
        </div>
      )}

      <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
        <AnimatePresence initial={false}>
          {posts
            .slice()
            .sort((a, b) => b.upvotes - a.upvotes)
            .map((p) => (
              <motion.div
                key={p.postId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-3 rounded-xl border border-accent2/30 bg-panel p-3 shadow-card"
              >
                <div>
                  <p className="text-xs font-semibold text-accent">{p.nickname}</p>
                  <p className="text-sm">{p.content}</p>
                </div>
                <button
                  onClick={() => upvote(p.postId)}
                  disabled={p.participantId === participantId || upvoted.has(p.postId)}
                  aria-label={`Upvote bài của ${p.nickname}, hiện có ${p.upvotes} lượt`}
                  className="tap-target flex shrink-0 flex-col items-center rounded-lg bg-ink/5 px-3 py-1 text-sm font-bold disabled:opacity-40"
                >
                  ▲<span>{p.upvotes}</span>
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        {posts.length === 0 && <p className="text-center text-sm text-muted/80">Chưa có ý kiến nào — hãy là người đầu tiên!</p>}
      </div>
    </main>
  );
}

function LeaderboardView({ roomCode }: { roomCode: string }) {
  const { leaderboard, participantId } = useRoomStore();
  const [mine, setMine] = useState<LeaderboardWhereAmIAck | null>(null);
  const inTop = leaderboard.some((r) => r.participantId === participantId);

  useEffect(() => {
    if (inTop) return;
    getSocket().timeout(6000).emit(LEADERBOARD_WHERE_AM_I, { roomCode }, (err: Error | null, ack: LeaderboardWhereAmIAck) => {
      if (!err) setMine(ack);
    });
  }, [inTop, roomCode]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      <h1 className="text-center text-2xl font-extrabold">🏆 Bảng xếp hạng</h1>
      <div className="mt-6">
        <LeaderboardList rows={leaderboard} highlightParticipantId={participantId} />
      </div>
      {!inTop && mine && (
        <div className="mt-4 rounded-xl border border-dashed border-accent2/40 p-3 text-center">
          <p className="text-sm text-muted">Vị trí của bạn</p>
          <p className="font-bold">#{mine.rank} · {mine.score} điểm</p>
        </div>
      )}
    </main>
  );
}

function EndedView() {
  const { ended, participantId, leaderboard } = useRoomStore();
  const fired = useRef(false);
  const myBadges = (ended && participantId && ended.badgesByParticipant[participantId]) || [];

  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      tetConfetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
    }
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center px-4 py-10 text-center">
      <h1 className="text-2xl font-extrabold">🎊 Buổi học kết thúc!</h1>

      {myBadges.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {myBadges.map((code) => {
            const b = badgeInfo(code);
            return (
              <motion.div
                key={code}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring" }}
                className="rounded-2xl border border-gold bg-panel p-4 shadow-card"
              >
                <div className="text-3xl">{b.emoji}</div>
                <p className="mt-1 text-sm font-bold">{b.name}</p>
                <p className="text-xs text-muted">{b.desc}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 w-full">
        <LeaderboardList rows={leaderboard.slice(0, 10)} highlightParticipantId={participantId} />
      </div>

      <a href="/" className="mt-8 rounded-xl bg-ink/10 px-5 py-3 font-bold">
        Về trang chủ
      </a>
    </main>
  );
}
