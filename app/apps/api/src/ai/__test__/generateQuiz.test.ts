/**
 * Manual mock-based test for the AI quiz generation pipeline. No ANTHROPIC_API_KEY was available in
 * this environment when this was written, so `anthropic.messages.create` is monkey-patched on the
 * cached client singleton instead of hitting the real API. Everything else (Prisma writes, the
 * validate -> retry-once -> fail flow, GenerationJob status transitions) runs for real against the
 * local test Postgres (see .env / mln-seed-test container).
 *
 * Run with: npx tsx src/ai/__test__/generateQuiz.test.ts
 */
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../../.env") });
process.env.ANTHROPIC_API_KEY ||= "test-key-for-mocked-unit-test";

import { PrismaClient } from "@prisma/client";
import { getAnthropicClient } from "../anthropicClient.js";
import { generateQuizForLessonUnit, GenerateQuizError } from "../generateQuiz.js";

const prisma = new PrismaClient();

function fakeToolUseResponse(id: string, input: unknown) {
  return { content: [{ type: "tool_use", name: "emit_quiz_questions", id, input }] };
}

const VALID_ITEMS = {
  items: [
    {
      question: "Theo giáo trình, vật chất quyết định ý thức về mặt nào?",
      options: ["Nguồn gốc và nội dung", "Hình thức thể hiện", "Tốc độ lan truyền", "Ngôn ngữ diễn đạt"],
      correctIndex: 0,
      explanation: "Ý thức là sản phẩm phản ánh của vật chất, nguồn gốc và nội dung do vật chất quy định.",
      sourceQuote: "ý thức là hình ảnh chủ quan của thế giới khách quan",
      difficulty: "medium",
    },
  ],
};

const INVALID_ITEMS_MISSING_OPTION = {
  items: [
    {
      question: "Câu hỏi thiếu 1 phương án (chỉ có 3, cần đúng 4)",
      options: ["A", "B", "C"],
      correctIndex: 0,
      explanation: "Giải thích hợp lệ đủ dài.",
      sourceQuote: "trích dẫn",
      difficulty: "easy",
    },
  ],
};

async function getSampleLessonUnitId(): Promise<string> {
  const unit = await prisma.lessonUnit.findFirst({ where: { sourceType: "PRESENTATION" }, orderBy: { orderIndex: "asc" } });
  assert.ok(unit, "Cần ít nhất 1 LessonUnit PRESENTATION trong DB test (chạy `npm run seed` trước).");
  return unit!.id;
}

async function testRetrySucceedsOnSecondCall() {
  const lessonUnitId = await getSampleLessonUnitId();
  const client = getAnthropicClient();

  let callCount = 0;
  (client.messages as any).create = async () => {
    callCount += 1;
    if (callCount === 1) return fakeToolUseResponse("toolu_1", INVALID_ITEMS_MISSING_OPTION);
    return fakeToolUseResponse("toolu_2", VALID_ITEMS);
  };

  const before = await prisma.quizQuestion.count({ where: { lessonUnitId } });
  const result = await generateQuizForLessonUnit(lessonUnitId, 1);
  const after = await prisma.quizQuestion.count({ where: { lessonUnitId } });

  assert.equal(callCount, 2, "Phải gọi Anthropic đúng 2 lần (lần đầu sai schema, lần 2 đúng).");
  assert.equal(result.createdCount, 1);
  assert.equal(after - before, 1, "Phải tạo đúng 1 QuizQuestion mới.");

  const job = await prisma.generationJob.findUnique({ where: { id: (await prisma.generationJob.findFirst({ where: { lessonUnitId }, orderBy: { updatedAt: "desc" } }))!.id } });
  assert.equal(job?.status, "DONE");

  // cleanup
  await prisma.quizQuestion.deleteMany({ where: { id: { in: result.quizQuestionIds } } });
  console.log("[test] testRetrySucceedsOnSecondCall: PASS");
}

async function testBothCallsInvalidMarksJobFailed() {
  const lessonUnitId = await getSampleLessonUnitId();
  const client = getAnthropicClient();

  let callCount = 0;
  (client.messages as any).create = async () => {
    callCount += 1;
    return fakeToolUseResponse(`toolu_bad_${callCount}`, INVALID_ITEMS_MISSING_OPTION);
  };

  const before = await prisma.quizQuestion.count({ where: { lessonUnitId } });
  await assert.rejects(() => generateQuizForLessonUnit(lessonUnitId, 1), GenerateQuizError);
  const after = await prisma.quizQuestion.count({ where: { lessonUnitId } });

  assert.equal(callCount, 2, "Phải thử đúng 2 lần rồi bỏ cuộc.");
  assert.equal(after, before, "Không được tạo QuizQuestion nào khi cả 2 lần đều sai schema.");

  const job = await prisma.generationJob.findFirst({ where: { lessonUnitId }, orderBy: { updatedAt: "desc" } });
  assert.equal(job?.status, "FAILED");
  assert.ok(job?.error?.includes("schema"), "GenerationJob.error phải mô tả lỗi schema.");

  console.log("[test] testBothCallsInvalidMarksJobFailed: PASS");
}

async function main() {
  await testRetrySucceedsOnSecondCall();
  await testBothCallsInvalidMarksJobFailed();
  console.log("\nTất cả test AI generation (mocked) đều PASS.");
}

main()
  .catch((err) => {
    console.error("[test] FAIL:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
