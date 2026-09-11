import { z } from "zod";

export const QuizItemSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(10),
  sourceQuote: z.string().min(5),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const QuizGenResponseSchema = z.object({
  items: z.array(QuizItemSchema).min(1),
});

export type QuizItem = z.infer<typeof QuizItemSchema>;
export type QuizGenResponse = z.infer<typeof QuizGenResponseSchema>;
