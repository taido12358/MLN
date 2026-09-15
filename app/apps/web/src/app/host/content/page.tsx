"use client";

import { useEffect, useState } from "react";
import { useAdminToken } from "@/hooks/useAdminToken";
import { api, ApiError, type Subject, type LessonUnitSummary, type LessonUnitDetail, type QuizQuestion, type BatchGenerateStatus } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const BATCH_POLL_MS = 2000;

export default function ContentAdminPage() {
  const token = useAdminToken();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<LessonUnitSummary[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; title: string }[]>([]);
  const [roomResult, setRoomResult] = useState<{ code: string; hostToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchGenerateStatus | null>(null);
  const [batchStarting, setBatchStarting] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.subjects().then(setSubjects).catch(() => setError("Không tải được danh sách môn học."));
  }, [token]);

  // Poll batch-generate progress regardless of who started it — another host session may already
  // have one running (the backend enforces a single-flight batch across the whole process), so this
  // also surfaces that state to a teacher who just opened this page.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function poll() {
      try {
        const status = await api.batchGenerateStatus(token!);
        if (!cancelled) setBatchStatus(status);
      } catch {
        /* transient — next tick retries */
      }
    }
    poll();
    const id = setInterval(poll, BATCH_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  async function startBatchGenerate() {
    if (!token) return;
    setBatchStarting(true);
    setError(null);
    try {
      await api.batchGenerate(token, 5);
      setBatchStatus(await api.batchGenerateStatus(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không khởi động được sinh hàng loạt.");
    } finally {
      setBatchStarting(false);
    }
  }

  async function openSubject(s: Subject) {
    if (!token) return;
    setActiveSubject(s);
    setActiveUnitId(null);
    setUnits([]); // clear immediately — otherwise the previous subject's list briefly renders under the new subject's header while loading, or lingers on fetch failure
    setUnitsLoading(true);
    try {
      setUnits(await api.lessonUnitsForSubject(s.id, token));
    } catch {
      setError("Không tải được chủ đề/chương của môn này.");
    } finally {
      setUnitsLoading(false);
    }
  }

  function toggleCart(u: { id: string; title: string }) {
    setCart((c) => (c.some((x) => x.id === u.id) ? c.filter((x) => x.id !== u.id) : [...c, u]));
  }

  async function createRoom() {
    if (!token || cart.length === 0) return;
    try {
      const res = await api.createRoom(cart.map((c) => c.id), token);
      setRoomResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không tạo được phòng.");
    }
  }

  if (!token) return null;

  const batchTotal = batchStatus ? batchStatus.pending + batchStatus.runningJobs + batchStatus.doneCount + batchStatus.failedCount : 0;
  const batchDonePct = batchStatus && batchTotal > 0 ? ((batchStatus.doneCount + batchStatus.failedCount) / batchTotal) * 100 : 0;
  const batchActive = Boolean(batchStatus?.isRunning);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-6 lg:flex-row">
      <aside className="w-full shrink-0 space-y-2 lg:w-56">
        <h2 className="px-2 text-xs font-bold uppercase tracking-wide text-white/40">Môn học</h2>
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => openSubject(s)}
            className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
              activeSubject?.id === s.id ? "bg-accent text-ink font-bold" : "bg-panel hover:bg-panel2"
            }`}
          >
            {s.name}
            <span className="ml-2 text-xs opacity-60">{s.lessonUnitCount}</span>
          </button>
        ))}

        <Card className="space-y-2 p-3">
          <h3 className="text-xs font-bold uppercase text-white/40">Sinh hàng loạt</h3>
          <p className="text-[11px] text-white/50">Sinh câu hỏi AI cho mọi chủ đề/chương chưa có câu hỏi nào.</p>
          <Button size="sm" variant="secondary" loading={batchStarting} disabled={batchActive} onClick={startBatchGenerate} className="w-full">
            ✨ Sinh câu hỏi cho nội dung chưa có
          </Button>
          {batchStatus && batchTotal > 0 && (
            <div className="space-y-1">
              <ProgressBar percent={batchDonePct} />
              <p className="text-[11px] text-white/50">
                {batchActive ? "Đang chạy… " : "Hoàn tất — "}
                {batchStatus.doneCount} xong · {batchStatus.failedCount} lỗi · {batchStatus.pending + batchStatus.runningJobs} còn lại
              </p>
            </div>
          )}
        </Card>
      </aside>

      <section className="flex-1 space-y-2">
        <h2 className="px-1 text-xs font-bold uppercase tracking-wide text-white/40">
          {activeSubject ? `Chủ đề / chương — ${activeSubject.name}` : "Chọn một môn học bên trái"}
        </h2>
        <div className="max-h-[70vh] space-y-1 overflow-y-auto rounded-xl bg-panel p-2">
          {units.map((u) => (
            <div key={u.id} className="flex items-center gap-1 rounded-lg px-1 py-1 hover:bg-panel2">
              <label
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-white/10"
                title="Thêm vào phòng học"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-accent"
                  checked={cart.some((c) => c.id === u.id)}
                  onChange={() => toggleCart({ id: u.id, title: u.title })}
                />
              </label>
              <button onClick={() => setActiveUnitId(u.id)} className="flex-1 rounded-lg py-1.5 pl-1 text-left text-sm hover:bg-white/5">
                {u.chapterLabel ? <span className="text-white/40">{u.chapterLabel} · </span> : null}
                {u.title}
              </button>
              <span className="shrink-0 pr-1 text-xs text-white/40">
                {u.publishedCount} xuất bản / {u.draftCount} nháp
              </span>
            </div>
          ))}
          {activeSubject && unitsLoading && <p className="p-2 text-sm text-white/40">Đang tải…</p>}
          {activeSubject && !unitsLoading && units.length === 0 && <p className="p-2 text-sm text-white/40">Chưa có nội dung.</p>}
        </div>

        {activeUnitId && token && <LessonUnitPanel id={activeUnitId} token={token} />}
      </section>

      <aside className="w-full shrink-0 space-y-3 lg:w-72">
        <h2 className="px-2 text-xs font-bold uppercase tracking-wide text-white/40">Tạo phòng học ({cart.length} mục)</h2>
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl bg-panel p-2">
          {cart.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-panel2 px-2 py-1 text-xs">
              <span className="truncate">{c.title}</span>
              <button onClick={() => toggleCart(c)} aria-label={`Bỏ ${c.title} khỏi giỏ`} className="text-wrong">
                ✕
              </button>
            </div>
          ))}
          {cart.length === 0 && <p className="p-2 text-xs text-white/40">Tick chọn chủ đề/chương ở giữa để thêm vào phòng.</p>}
        </div>
        <Button onClick={createRoom} disabled={cart.length === 0} className="w-full">
          Tạo phòng học
        </Button>
        {roomResult && (
          <Card className="text-center">
            <p className="text-xs text-white/50">Mã phòng</p>
            <p className="text-2xl font-black tracking-widest text-accent2">{roomResult.code}</p>
            <a
              href={`/host/rooms/${roomResult.code}?hostToken=${roomResult.hostToken}`}
              className="mt-2 block rounded-lg bg-accent px-3 py-2 text-sm font-bold text-ink"
            >
              Vào Host Console →
            </a>
          </Card>
        )}
        {error && <p className="text-xs text-wrong">{error}</p>}
      </aside>
    </main>
  );
}

function LessonUnitPanel({ id, token }: { id: string; token: string }) {
  const [detail, setDetail] = useState<LessonUnitDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [contentOpen, setContentOpen] = useState(false);

  async function load() {
    setLoadError(null);
    try {
      setDetail(await api.lessonUnit(id, token));
    } catch {
      setLoadError("Không tải được nội dung chủ đề này.");
    }
  }

  useEffect(() => {
    setDetail(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function generate() {
    setGenerating(true);
    setGenError(null);
    try {
      await api.generateQuiz(id, token, 5);
      await load();
    } catch (err) {
      setGenError(err instanceof ApiError ? err.message : "Sinh câu hỏi thất bại.");
    } finally {
      setGenerating(false);
    }
  }

  if (loadError) {
    return (
      <Card className="space-y-2 text-center">
        <p className="text-sm text-wrong">{loadError}</p>
        <Button size="sm" variant="secondary" onClick={load}>
          Thử lại
        </Button>
      </Card>
    );
  }

  if (!detail) return <p className="text-sm text-white/40">Đang tải…</p>;

  return (
    <div className="space-y-4 rounded-xl bg-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{detail.title}</h3>
        <Button size="sm" variant="secondary" loading={generating} onClick={generate}>
          {generating ? "Đang sinh câu hỏi bằng AI…" : "✨ Sinh câu hỏi AI"}
        </Button>
      </div>
      {genError && <p className="text-sm text-wrong">{genError}</p>}

      {/* Fetched but never shown before this pass — lets the host cross-check AI-generated
          questions against the actual source text without leaving this screen. */}
      <div>
        <button onClick={() => setContentOpen((v) => !v)} className="text-xs font-bold uppercase text-white/40 hover:text-white/70">
          {contentOpen ? "▾" : "▸"} Nội dung gốc
        </button>
        {contentOpen && (
          <div className="mt-1 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-panel2 p-3 text-xs text-white/70">
            {detail.contentMarkdown}
          </div>
        )}
      </div>

      {detail.discussionQuestions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase text-white/40">Câu hỏi thảo luận</h4>
          <ul className="mt-1 space-y-2 text-sm text-white/70">
            {detail.discussionQuestions.map((q) => (
              <li key={q.id}>
                <p>• {q.question}</p>
                {q.suggestedAnswer && <p className="mt-0.5 pl-3 text-xs italic text-white/40">Gợi ý: {q.suggestedAnswer}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-xs font-bold uppercase text-white/40">Câu hỏi trắc nghiệm ({detail.quizQuestions.length})</h4>
        <div className="mt-2 space-y-2">
          {detail.quizQuestions.map((q) => (
            <QuizQuestionRow key={q.id} q={q} token={token} onChanged={load} />
          ))}
          {detail.quizQuestions.length === 0 && <p className="text-sm text-white/40">Chưa có câu hỏi — bấm &quot;Sinh câu hỏi AI&quot;.</p>}
        </div>
      </div>
    </div>
  );
}

function QuizQuestionRow({ q, token, onChanged }: { q: QuizQuestion; token: string; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(q);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await api.updateQuizQuestion(q.id, token, draft);
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    try {
      await api.publishQuizQuestion(q.id, token);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setConfirmDelete(false);
    setBusy(true);
    try {
      await api.deleteQuizQuestion(q.id, token);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const difficultyLabel = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" }[q.difficulty];

  return (
    <div className="rounded-xl bg-panel2 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={q.status === "PUBLISHED" ? "success" : "neutral"}>{q.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}</Badge>
          <Badge tone={q.source === "AI_GENERATED" ? "accent" : "neutral"}>{q.source === "AI_GENERATED" ? "AI sinh" : "Thủ công"}</Badge>
          <Badge tone="neutral">{difficultyLabel}</Badge>
        </div>
        <div className="flex gap-1 text-xs">
          <button onClick={() => setEditing((e) => !e)} className="rounded bg-white/10 px-2 py-1">
            Sửa
          </button>
          {q.status === "DRAFT" && (
            <button onClick={publish} disabled={busy} className="rounded bg-correct/80 px-2 py-1 font-bold text-ink">
              Publish
            </button>
          )}
          <button onClick={() => setConfirmDelete(true)} disabled={busy} className="rounded bg-wrong/80 px-2 py-1 font-bold">
            Xoá
          </button>
        </div>
      </div>

      {q.status === "PUBLISHED" && editing && (
        <p className="mt-2 rounded-lg bg-amber-400/10 px-2 py-1.5 text-xs text-amber-300">
          ⚠ Câu này đang xuất bản — sửa sẽ ảnh hưởng ngay tới nội dung học viên có thể gặp trong phòng đang mở.
        </p>
      )}

      {!editing ? (
        <>
          <p className="mt-2 text-sm font-semibold">{q.question}</p>
          <ul className="mt-1 space-y-0.5 text-xs text-white/60">
            {q.options.map((o, i) => (
              <li key={i} className={i === q.correctIndex ? "font-bold text-correct" : ""}>
                {i === q.correctIndex ? "✓ " : "· "}
                {o}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs italic text-white/40">{q.explanation}</p>
          {q.sourceQuote && (
            <div className="mt-1">
              <button onClick={() => setQuoteOpen((v) => !v)} className="text-[11px] font-semibold text-accent2 hover:underline">
                {quoteOpen ? "▾ Ẩn trích dẫn nguồn" : "▸ Xem trích dẫn nguồn (fact-check)"}
              </button>
              {quoteOpen && <blockquote className="mt-1 border-l-2 border-accent2/50 pl-2 text-xs italic text-white/50">“{q.sourceQuote}”</blockquote>}
            </div>
          )}
        </>
      ) : (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft.question}
            onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            className="w-full rounded bg-panel px-2 py-1 text-sm"
          />
          {draft.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" checked={draft.correctIndex === i} onChange={() => setDraft({ ...draft, correctIndex: i })} />
              <input
                value={o}
                onChange={(e) => {
                  const options = [...draft.options];
                  options[i] = e.target.value;
                  setDraft({ ...draft, options });
                }}
                className="flex-1 rounded bg-panel px-2 py-1 text-sm"
              />
            </div>
          ))}
          <textarea
            value={draft.explanation}
            onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
            className="w-full rounded bg-panel px-2 py-1 text-xs"
          />
          <button onClick={save} disabled={busy} className="rounded bg-accent px-3 py-1.5 text-xs font-bold text-ink">
            Lưu
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Xoá câu hỏi này?"
        description="Không thể hoàn tác. Câu hỏi sẽ bị xoá vĩnh viễn khỏi ngân hàng câu hỏi."
        confirmLabel="Xoá"
        danger
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
