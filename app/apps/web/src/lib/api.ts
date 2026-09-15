// Empty string (explicitly set at Docker build time) means "same origin as the page" so requests
// go through nginx's /api/ proxy instead of trying to reach the api container directly from the
// browser. `||` would treat "" as falsy and wrongly fall back to localhost:3001, so check
// `undefined` explicitly — undefined (var never set, e.g. plain `npm run dev`) is the only case
// that should use the dev fallback.
const API_URL = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string; hostToken?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.hostToken) headers["x-host-token"] = opts.hostToken;

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    let message = `Lỗi ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    // A 401 on an admin-token request means that JWT expired or is stale (8h lifetime) — drop it so
    // the next page visit's `if (!token) router.replace("/host")` check re-prompts login instead of
    // the page silently failing forever with a stale token still sitting in localStorage.
    if (res.status === 401 && opts.token) {
      try {
        localStorage.removeItem("mln:adminToken");
      } catch {
        /* ignore */
      }
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Subject {
  id: string;
  key: string;
  name: string;
  orderIndex: number;
  lessonUnitCount: number;
}

export interface LessonUnitSummary {
  id: string;
  title: string;
  slug: string;
  orderIndex: number;
  sourceType: "PRESENTATION" | "TEXTBOOK";
  chapterLabel: string | null;
  quizQuestionCount: number;
  draftCount: number;
  publishedCount: number;
}

export interface DiscussionQuestion {
  id: string;
  orderIndex: number;
  question: string;
  suggestedAnswer: string | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceQuote: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "DRAFT" | "PUBLISHED";
  source: "MANUAL" | "AI_GENERATED";
}

export interface LessonUnitDetail {
  id: string;
  subjectId: string;
  title: string;
  slug: string;
  contentMarkdown: string;
  chapterLabel: string | null;
  discussionQuestions: DiscussionQuestion[];
  quizQuestions: QuizQuestion[];
}

export interface RoomPlaylistItem {
  id: string;
  orderIndex: number;
  lessonUnitId: string;
  lessonUnit: { id: string; title: string; subjectId: string; chapterLabel: string | null };
}

export interface RoomDetail {
  id: string;
  code: string;
  state: string;
  currentLessonUnitId: string | null;
  playlistItems: RoomPlaylistItem[];
}

export interface BatchGenerateStatus {
  pending: number;
  runningJobs: number;
  doneCount: number;
  failedCount: number;
  isRunning: boolean;
}

export const api = {
  login: (password: string) => request<{ token: string }>("/api/admin/login", { method: "POST", body: { password } }),

  subjects: () => request<Subject[]>("/api/subjects"),

  lessonUnitsForSubject: (subjectId: string, token: string) =>
    request<LessonUnitSummary[]>(`/api/admin/subjects/${subjectId}/lesson-units`, { token }),

  lessonUnit: (id: string, token: string) => request<LessonUnitDetail>(`/api/admin/lesson-units/${id}`, { token }),

  generateQuiz: (lessonUnitId: string, token: string, count = 5) =>
    request<{ quizQuestionIds: string[]; questions: QuizQuestion[] }>(
      `/api/admin/lesson-units/${lessonUnitId}/generate-quiz`,
      { method: "POST", token, body: { count } },
    ),

  updateQuizQuestion: (id: string, token: string, data: Partial<QuizQuestion>) =>
    request<QuizQuestion>(`/api/admin/quiz-questions/${id}`, { method: "PATCH", token, body: data }),

  publishQuizQuestion: (id: string, token: string) =>
    request<QuizQuestion>(`/api/admin/quiz-questions/${id}/publish`, { method: "POST", token }),

  deleteQuizQuestion: (id: string, token: string) =>
    request<void>(`/api/admin/quiz-questions/${id}`, { method: "DELETE", token }),

  createRoom: (lessonUnitIds: string[], token: string) =>
    request<{ code: string; hostToken: string; roomId: string }>("/api/admin/rooms", {
      method: "POST",
      token,
      body: { lessonUnitIds },
    }),

  roomByCode: (code: string, hostToken: string) => request<RoomDetail>(`/api/admin/rooms/${code}`, { hostToken }),

  batchGenerate: (token: string, count = 5) =>
    request<{ queued: number }>("/api/admin/generate-quiz/batch", { method: "POST", token, body: { count } }),

  batchGenerateStatus: (token: string) => request<BatchGenerateStatus>("/api/admin/generate-quiz/batch/status", { token }),

  // Not JSON, so bypasses the `request<T>` helper above — returns a Blob for the caller to trigger
  // a client-side download from (see host/rooms/[roomCode]/page.tsx's downloadCsv).
  exportRoomCsv: async (code: string, hostToken: string): Promise<Blob> => {
    const res = await fetch(`${API_URL}/api/admin/rooms/${code}/export.csv`, { headers: { "x-host-token": hostToken } });
    if (!res.ok) {
      let message = `Lỗi ${res.status}`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {
        /* ignore */
      }
      throw new ApiError(message, res.status);
    }
    return res.blob();
  },
};
