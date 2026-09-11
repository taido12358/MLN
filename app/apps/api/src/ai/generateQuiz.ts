import { QuizGenResponseSchema, type QuizItem } from "@mln/shared";
import { prisma } from "../prismaClient.js";
import { getAnthropicClient, getAnthropicModel } from "./anthropicClient.js";
import { QUIZ_GEN_SYSTEM_PROMPT, EMIT_QUIZ_QUESTIONS_TOOL, buildQuizGenUserMessage, buildRetryUserMessage } from "./promptTemplates.js";

export class GenerateQuizError extends Error {}

function extractToolUse(message: Awaited<ReturnType<ReturnType<typeof getAnthropicClient>["messages"]["create"]>>) {
  const block = (message as any).content.find((b: any) => b.type === "tool_use" && b.name === "emit_quiz_questions");
  return block as { type: "tool_use"; id: string; input: unknown } | undefined;
}

function formatZodErrors(errors: { path: (string | number)[]; message: string }[]): string {
  return errors.map((e) => `- ${e.path.join(".") || "(root)"}: ${e.message}`).join("\n");
}

/** Calls Anthropic once (forced tool-use), validates the result, and retries at most once with the
 * validation errors fed back in a proper tool_result turn. Returns validated items or throws
 * GenerateQuizError after the retry also fails. */
async function callAndValidate(userMessage: string, count: number): Promise<QuizItem[]> {
  const anthropic = getAnthropicClient();
  const model = getAnthropicModel();

  const firstResponse = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: QUIZ_GEN_SYSTEM_PROMPT,
    tools: [EMIT_QUIZ_QUESTIONS_TOOL as any],
    tool_choice: { type: "tool", name: "emit_quiz_questions" },
    messages: [{ role: "user", content: userMessage }],
  });

  const firstToolUse = extractToolUse(firstResponse);
  if (!firstToolUse) throw new GenerateQuizError("Anthropic không trả về tool_use nào (không nên xảy ra với tool_choice ép buộc).");

  const firstParsed = QuizGenResponseSchema.safeParse(firstToolUse.input);
  if (firstParsed.success) return firstParsed.data.items;

  const errorText = formatZodErrors(firstParsed.error.issues);

  const secondResponse = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: QUIZ_GEN_SYSTEM_PROMPT,
    tools: [EMIT_QUIZ_QUESTIONS_TOOL as any],
    tool_choice: { type: "tool", name: "emit_quiz_questions" },
    messages: [
      { role: "user", content: userMessage },
      { role: "assistant", content: (firstResponse as any).content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: firstToolUse.id,
            content: buildRetryUserMessage(errorText),
            is_error: true,
          },
        ],
      },
    ],
  });

  const secondToolUse = extractToolUse(secondResponse);
  if (!secondToolUse) throw new GenerateQuizError("Lần gọi lại thứ 2 không trả về tool_use.");

  const secondParsed = QuizGenResponseSchema.safeParse(secondToolUse.input);
  if (!secondParsed.success) {
    throw new GenerateQuizError(`Vẫn sai schema sau khi thử lại 1 lần: ${formatZodErrors(secondParsed.error.issues)}`);
  }
  return secondParsed.data.items;
}

export interface GenerateQuizResult {
  lessonUnitId: string;
  createdCount: number;
  quizQuestionIds: string[];
}

export async function generateQuizForLessonUnit(lessonUnitId: string, count = 5): Promise<GenerateQuizResult> {
  const lessonUnit = await prisma.lessonUnit.findUnique({
    where: { id: lessonUnitId },
    include: { discussionQuestions: { orderBy: { orderIndex: "asc" } } },
  });
  if (!lessonUnit) throw new GenerateQuizError(`Không tìm thấy LessonUnit id=${lessonUnitId}`);

  const job = await prisma.generationJob.create({
    data: { lessonUnitId, status: "RUNNING", attempts: 1 },
  });

  try {
    const userMessage = buildQuizGenUserMessage({
      title: lessonUnit.title,
      chapterLabel: lessonUnit.chapterLabel,
      contentMarkdown: lessonUnit.contentMarkdown,
      discussionQuestions: lessonUnit.discussionQuestions.map((q) => q.question),
      count,
    });

    const items = await callAndValidate(userMessage, count);

    const created = await prisma.$transaction(
      items.map((item) =>
        prisma.quizQuestion.create({
          data: {
            lessonUnitId,
            question: item.question,
            options: item.options,
            correctIndex: item.correctIndex,
            explanation: item.explanation,
            sourceQuote: item.sourceQuote,
            difficulty: item.difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD",
            status: "DRAFT",
            source: "AI_GENERATED",
          },
        }),
      ),
    );

    await prisma.generationJob.update({ where: { id: job.id }, data: { status: "DONE" } });

    return { lessonUnitId, createdCount: created.length, quizQuestionIds: created.map((c) => c.id) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.generationJob.update({ where: { id: job.id }, data: { status: "FAILED", error: message } });
    throw err;
  }
}
