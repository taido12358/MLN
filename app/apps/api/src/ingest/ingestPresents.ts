import fs from "node:fs";
import path from "node:path";

export interface ParsedPresentationLessonUnit {
  slug: string;
  title: string;
  orderIndex: number;
  contentMarkdown: string;
}

export interface ParsedDiscussionQuestion {
  /** slug of the owning lesson unit (topic folder name), so callers can look up the right LessonUnit id. */
  lessonUnitSlug: string;
  orderIndex: number;
  question: string;
  suggestedAnswer: string | null;
}

export interface ParsePresentsResult {
  lessonUnits: ParsedPresentationLessonUnit[];
  discussionQuestions: ParsedDiscussionQuestion[];
}

const TOPIC_DIR_RE = /^\d{2}-/;
const TITLE_LINE_RE = /^#\s*Ch[uủ]\s*đ[eề]\s*\d+\s*:\s*(.+)$/i;
const QUESTION_LINE_RE = /^(\d+)\.\s+\*\*(.+)\*\*\s*$/;
const SUGGESTED_ANSWER_LINE_RE = /^\s*\*G[oợ]i\s*[yý]:\*\s*(.*)$/i;

function extractTitle(slidesContent: string, fallbackSlug: string): string {
  const lines = slidesContent.split(/\r?\n/);
  for (const line of lines) {
    const match = TITLE_LINE_RE.exec(line.trim());
    if (match) return match[1].trim();
  }
  return fallbackSlug;
}

function parseDiscussionFile(content: string, lessonUnitSlug: string): ParsedDiscussionQuestion[] {
  const lines = content.split(/\r?\n/);
  const results: ParsedDiscussionQuestion[] = [];

  for (let i = 0; i < lines.length; i++) {
    const qMatch = QUESTION_LINE_RE.exec(lines[i].trim());
    if (!qMatch) continue;

    const orderIndex = Number(qMatch[1]);
    const question = qMatch[2].trim();
    let suggestedAnswer: string | null = null;

    // Look ahead for the "*Gợi ý:*" line, skipping blank lines in between (defensive — samples show
    // it directly on the next line, but we don't want a stray blank line to break parsing).
    for (let j = i + 1; j < lines.length; j++) {
      const trimmed = lines[j].trim();
      if (trimmed === "") continue;
      const aMatch = SUGGESTED_ANSWER_LINE_RE.exec(lines[j]);
      if (aMatch) suggestedAnswer = aMatch[1].trim();
      break;
    }

    results.push({ lessonUnitSlug, orderIndex, question, suggestedAnswer });
  }

  return results;
}

export function parsePresentsDir(baseDir: string): ParsePresentsResult {
  const lessonUnits: ParsedPresentationLessonUnit[] = [];
  const discussionQuestions: ParsedDiscussionQuestion[] = [];

  const entries = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && TOPIC_DIR_RE.test(e.name))
    .map((e) => e.name)
    .sort();

  for (const slug of entries) {
    const dir = path.join(baseDir, slug);
    const slidesPath = path.join(dir, "slides.md");
    const questionsPath = path.join(dir, "cau-hoi-phan-bien.md");

    if (!fs.existsSync(slidesPath)) continue;

    const orderIndex = Number(slug.slice(0, 2));
    const contentMarkdown = fs.readFileSync(slidesPath, "utf-8");
    const title = extractTitle(contentMarkdown, slug);

    lessonUnits.push({ slug, title, orderIndex, contentMarkdown });

    if (fs.existsSync(questionsPath)) {
      const qContent = fs.readFileSync(questionsPath, "utf-8");
      discussionQuestions.push(...parseDiscussionFile(qContent, slug));
    }
  }

  return { lessonUnits, discussionQuestions };
}
