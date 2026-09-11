/** Defensive normalization for `QuizQuestion.options` (a Prisma `Json` column that is
 * supposed to always hold a 4-element string array). A malformed row — e.g. one inserted
 * by hand with `JSON.stringify(...)` instead of a real array — must never crash the host
 * console or a student's quiz card mid-class; normalize once here and reuse everywhere
 * options are read out of the database. */
export function normalizeOptions(options: unknown): string[] {
  if (Array.isArray(options)) return options.map((o) => String(o));
  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) return parsed.map((o) => String(o));
    } catch {
      /* fall through */
    }
  }
  return [];
}
