export const QUIZ_GEN_SYSTEM_PROMPT = `Bạn là chuyên gia biên soạn câu hỏi trắc nghiệm Lý luận chính trị cho giáo viên đại học Việt Nam. Chỉ dựa trên đúng đoạn văn bản được cung cấp, không thêm số liệu/sự kiện ngoài văn bản, giữ đúng thuật ngữ và quan điểm chính thống của giáo trình, không được diễn giải lệch. Mỗi câu hỏi có 4 phương án, đúng 1 đáp án, kèm giải thích trích lại ý gốc và gắn mức độ khó. Không hỏi về số trang/số chương (đó chỉ là ranh giới chia nhỏ kỹ thuật, không phải nội dung).`;

/** Mirrors packages/shared/src/quiz-schema.ts (QuizGenResponseSchema) — Anthropic tool-use needs a
 * plain JSON Schema, not a zod schema object, so this is kept in sync by hand. Any change to the
 * zod schema must be reflected here too. */
export const EMIT_QUIZ_QUESTIONS_TOOL = {
  name: "emit_quiz_questions",
  description: "Trả về danh sách câu hỏi trắc nghiệm đã biên soạn từ đoạn văn bản được cung cấp.",
  input_schema: {
    type: "object" as const,
    properties: {
      items: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          properties: {
            question: { type: "string", minLength: 10 },
            options: {
              type: "array",
              items: { type: "string", minLength: 1 },
              minItems: 4,
              maxItems: 4,
            },
            correctIndex: { type: "integer", minimum: 0, maximum: 3 },
            explanation: { type: "string", minLength: 10 },
            sourceQuote: { type: "string", minLength: 5 },
            difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          },
          required: ["question", "options", "correctIndex", "explanation", "sourceQuote", "difficulty"],
        },
      },
    },
    required: ["items"],
  },
};

export interface BuildUserMessageInput {
  title: string;
  chapterLabel?: string | null;
  contentMarkdown: string;
  discussionQuestions?: string[];
  count: number;
}

export function buildQuizGenUserMessage(input: BuildUserMessageInput): string {
  const { title, chapterLabel, contentMarkdown, discussionQuestions, count } = input;
  const parts: string[] = [];
  parts.push(`Chủ đề/đơn vị bài học: ${title}`);
  if (chapterLabel) parts.push(`Thuộc: ${chapterLabel}`);
  if (discussionQuestions && discussionQuestions.length > 0) {
    parts.push(
      `Một số câu hỏi thảo luận đã có sẵn cho chủ đề này (chỉ để tham khảo văn phong/độ khó, không cần lặp lại nguyên văn):\n` +
        discussionQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
    );
  }
  parts.push(`Hãy soạn đúng ${count} câu hỏi trắc nghiệm dựa trên đoạn văn bản sau:\n\n${contentMarkdown}`);
  return parts.join("\n\n");
}

export function buildRetryUserMessage(validationErrors: string): string {
  return `Phản hồi trước không đúng định dạng yêu cầu. Lỗi cụ thể:\n${validationErrors}\n\nHãy gọi lại đúng tool "emit_quiz_questions" với dữ liệu hợp lệ, sửa đúng các lỗi trên.`;
}
