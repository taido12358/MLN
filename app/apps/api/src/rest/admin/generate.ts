import { Router, type Request, type Response } from "express";
import { prisma } from "../../prismaClient.js";
import { generateQuizForLessonUnit, GenerateQuizError } from "../../ai/generateQuiz.js";
import { enqueueBatchGeneration, getBatchProgress, isBatchRunning } from "../../ai/batchQueue.js";

export const generateRouter = Router();

const MIN_COUNT = 1;
const MAX_COUNT = 10;

function clampCount(raw: unknown): number {
  const n = typeof raw === "number" && Number.isFinite(raw) ? Math.round(raw) : 5;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, n));
}

generateRouter.post("/lesson-units/:id/generate-quiz", async (req: Request, res: Response) => {
  const count = clampCount(req.body?.count);
  try {
    const result = await generateQuizForLessonUnit(req.params.id, count);
    const questions = await prisma.quizQuestion.findMany({ where: { id: { in: result.quizQuestionIds } } });
    res.json({ ...result, questions });
  } catch (err) {
    if (err instanceof GenerateQuizError) return res.status(422).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Lỗi không xác định khi sinh quiz." });
  }
});

generateRouter.post("/generate-quiz/batch", async (req: Request, res: Response) => {
  const count = clampCount(req.body?.count);
  try {
    if (isBatchRunning()) {
      return res.status(409).json({ error: "Đã có một lượt sinh hàng loạt đang chạy, vui lòng chờ hoàn tất." });
    }
    const units = await prisma.lessonUnit.findMany({
      where: { quizQuestions: { none: {} } },
      select: { id: true },
    });
    const ids = units.map((u) => u.id);
    enqueueBatchGeneration(ids, count);
    res.status(202).json({ queued: ids.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi khởi động sinh hàng loạt." });
  }
});

generateRouter.get("/generate-quiz/batch/status", async (_req: Request, res: Response) => {
  try {
    res.json({ ...(await getBatchProgress()), running: isBatchRunning() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy tiến độ." });
  }
});
