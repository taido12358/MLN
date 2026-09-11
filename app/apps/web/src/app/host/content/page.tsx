"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type Subject, type LessonUnitSummary, type LessonUnitDetail, type QuizQuestion } from "@/lib/api";

export default function ContentAdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<LessonUnitSummary[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [cart, setCart] = useState<{ id: string; title: string }[]>([]);
  const [roomResult, setRoomResult] = useState<{ code: string; hostToken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("mln:adminToken");
    if (!t) return router.replace("/host");
    setToken(t);
    api.subjects().then(setSubjects).catch(() => setError("Không tải được danh sách môn học."));
  }, [router]);

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
              <button onClick={() => toggleCart(c)} className="text-wrong">
                ✕
              </button>
            </div>
          ))}
          {cart.length === 0 && <p className="p-2 text-xs text-white/40">Tick chọn chủ đề/chương ở giữa để thêm vào phòng.</p>}
        </div>
        <button
          onClick={createRoom}
          disabled={cart.length === 0}
          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent2 py-3 font-extrabold text-ink disabled:opacity-40"
        >
          Tạo phòng học
        </button>
        {roomResult && (
          <div className="rounded-xl bg-panel p-3 text-center">
            <p className="text-xs text-white/50">Mã phòng</p>
            <p className="text-2xl font-black tracking-widest text-accent2">{roomResult.code}</p>
            <a
              href={`/host/rooms/${roomResult.code}?hostToken=${roomResult.hostToken}`}
              className="mt-2 block rounded-lg bg-accent px-3 py-2 text-sm font-bold text-ink"
            >
              Vào Host Console →
            </a>
          </div>
        )}
        {error && <p className="text-xs text-wrong">{error}</p>}
      </aside>
    </main>
  );
}

function LessonUnitPanel({ id, token }: { id: string; token: string }) {
  const [detail, setDetail] = useState<LessonUnitDetail | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  async function load() {
    setDetail(await api.lessonUnit(id, token));
  }

  useEffect(() => {
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

  if (!detail) return <p className="text-sm text-white/40">Đang tải…</p>;

  return (
    <div className="space-y-4 rounded-xl bg-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{detail.title}</h3>
        <button
          onClick={generate}
          disabled={generating}
          className="rounded-lg bg-accent2 px-3 py-2 text-sm font-bold text-ink disabled:opacity-50"
        >
          {generating ? "Đang sinh câu hỏi bằng AI…" : "✨ Sinh câu hỏi AI"}
        </button>
      </div>
      {genError && <p className="text-sm text-wrong">{genError}</p>}

      {detail.discussionQuestions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase text-white/40">Câu hỏi thảo luận</h4>
          <ul className="mt-1 space-y-1 text-sm text-white/70">
            {detail.discussionQuestions.map((q) => (
              <li key={q.id}>• {q.question}</li>
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
    setBusy(true);
    try {
      await api.deleteQuizQuestion(q.id, token);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg bg-panel2 p-3">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
            q.status === "PUBLISHED" ? "bg-correct/30 text-correct" : "bg-white/10 text-white/50"
          }`}
        >
          {q.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}
        </span>
        <div className="flex gap-1 text-xs">
          <button onClick={() => setEditing((e) => !e)} className="rounded bg-white/10 px-2 py-1">
            Sửa
          </button>
          {q.status === "DRAFT" && (
            <button onClick={publish} disabled={busy} className="rounded bg-correct/80 px-2 py-1 font-bold text-ink">
              Publish
            </button>
          )}
          <button onClick={remove} disabled={busy} className="rounded bg-wrong/80 px-2 py-1 font-bold">
            Xoá
          </button>
        </div>
      </div>

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
    </div>
  );
}
