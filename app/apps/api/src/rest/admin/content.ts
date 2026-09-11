import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { normalizeOptions } from "@mln/shared";
import { prisma } from "../../prismaClient.js";
import { asyncHandler } from "../asyncHandler.js";

/** Public router (mounted at /api) — no auth, used by the class-facing app and by ops to sanity
 * check that seeding worked. */
export const publicContentRouter = Router();

publicContentRouter.get(
  "/subjects",
  asyncHandler(async (_req: Request, res: Response) => {
    const subjects = await prisma.subject.findMany({
      orderBy: { orderIndex: "asc" },
      include: { _count: { select: { lessonUnits: true } } },
    });
    res.json(
      subjects.map((s) => ({
        id: s.id,
        key: s.key,
        name: s.name,
        orderIndex: s.orderIndex,
        lessonUnitCount: s._count.lessonUnits,
      })),
    );
  }),
);

/** Admin router (mounted at /api/admin, requireAdmin applied by index.ts). */
export const adminContentRouter = Router();

adminContentRouter.get(
  "/subjects/:id/lesson-units",
  asyncHandler(async (req: Request, res: Response) => {
    const [units, statusCounts] = await Promise.all([
      prisma.lessonUnit.findMany({
        where: { subjectId: req.params.id },
        orderBy: { orderIndex: "asc" },
        include: { _count: { select: { quizQuestions: true } } },
      }),
      // Single groupBy instead of 2 COUNT queries per lesson unit (was N+1 — 425 units meant up to
      // 850 extra round-trips for this one list).
      prisma.quizQuestion.groupBy({
        by: ["lessonUnitId", "status"],
        where: { lessonUnit: { subjectId: req.params.id } },
        _count: { _all: true },
      }),
    ]);

    const draftByUnit = new Map<string, number>();
    const publishedByUnit = new Map<string, number>();
    for (const row of statusCounts) {
      const target = row.status === "DRAFT" ? draftByUnit : row.status === "PUBLISHED" ? publishedByUnit : null;
      target?.set(row.lessonUnitId, row._count._all);
    }

    res.json(
      units.map((u) => ({
        id: u.id,
        title: u.title,
        slug: u.slug,
        orderIndex: u.orderIndex,
        sourceType: u.sourceType,
        chapterLabel: u.chapterLabel,
        quizQuestionCount: u._count.quizQuestions,
        draftCount: draftByUnit.get(u.id) ?? 0,
        publishedCount: publishedByUnit.get(u.id) ?? 0,
      })),
    );
  }),
);

adminContentRouter.get(
  "/lesson-units/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const unit = await prisma.lessonUnit.findUnique({
      where: { id: req.params.id },
      include: {
        discussionQuestions: { orderBy: { orderIndex: "asc" } },
        quizQuestions: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!unit) return res.status(404).json({ error: "Không tìm thấy LessonUnit." });
    res.json({
      ...unit,
      quizQuestions: unit.quizQuestions.map((q) => ({ ...q, options: normalizeOptions(q.options) })),
    });
  }),
);

// Partial update — every field optional, but whichever ARE provided must be well-formed. Without
// this, a typo'd edit in the /host/content UI (or a malformed request) could write a 3-option array,
// an out-of-range correctIndex, or an invalid difficulty straight into QuizQuestion — exactly the
// class of bug normalizeOptions() only papers over defensively when reading it back later.
const PatchQuizQuestionSchema = z
  .object({
    question: z.string().trim().min(10).max(2000),
    options: z.array(z.string().trim().min(1).max(300)).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(10).max(2000),
    sourceQuote: z.string().trim().min(1).max(2000),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  })
  .partial();

/** Prisma "record to update/delete not found" — distinguish this from every other kind of failure
 * (validation, FK constraint) so callers get an accurate error instead of a blanket 404. */
function isRecordNotFoundError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

adminContentRouter.patch(
  "/quiz-questions/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = PatchQuizQuestionSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ error: "Dữ liệu không hợp lệ.", details: parsed.error.flatten() });
    }
    try {
      const updated = await prisma.quizQuestion.update({ where: { id: req.params.id }, data: parsed.data });
      res.json(updated);
    } catch (err) {
      if (isRecordNotFoundError(err)) return res.status(404).json({ error: "Không tìm thấy QuizQuestion." });
      throw err;
    }
  }),
);

adminContentRouter.post(
  "/quiz-questions/:id/publish",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const updated = await prisma.quizQuestion.update({ where: { id: req.params.id }, data: { status: "PUBLISHED" } });
      res.json(updated);
    } catch (err) {
      if (isRecordNotFoundError(err)) return res.status(404).json({ error: "Không tìm thấy QuizQuestion." });
      throw err;
    }
  }),
);

adminContentRouter.delete(
  "/quiz-questions/:id",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await prisma.quizQuestion.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (err) {
      if (isRecordNotFoundError(err)) return res.status(404).json({ error: "Không tìm thấy QuizQuestion." });
      throw err;
    }
  }),
);
