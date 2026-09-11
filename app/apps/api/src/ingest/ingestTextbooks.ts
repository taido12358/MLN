import fs from "node:fs";
import path from "node:path";

export interface ParsedTextbookLessonUnit {
  subjectKey: string;
  slug: string;
  title: string;
  orderIndex: number;
  contentMarkdown: string;
  chapterLabel: string | null;
}

export interface ParseTextbooksResult {
  lessonUnits: ParsedTextbookLessonUnit[];
  /** subjectKey -> number of chapter segments actually detected (excluding the unlabeled preamble, if any). For diagnostics only. */
  chapterCountBySubject: Record<string, number>;
}

const FILE_TO_SUBJECT: Record<string, { subjectKey: string; subjectName: string }> = {
  "Giao_trinh_Triet_hoc_ML.md": { subjectKey: "triet-hoc-ml", subjectName: "Triết học Mác - Lênin" },
  "Giao_trinh_Kinh_te_Chinh_tri_Mac_Lenin.md": {
    subjectKey: "kinh-te-chinh-tri-ml",
    subjectName: "Kinh tế Chính trị Mác - Lênin",
  },
  "Giao_trinh_CNXHKH.md": { subjectKey: "cnxhkh", subjectName: "Chủ nghĩa xã hội khoa học" },
  "Giao_trinh_Lich_su_Dang_CSVN.md": { subjectKey: "lich-su-dang", subjectName: "Lịch sử Đảng Cộng sản Việt Nam" },
  "Giao_trinh_Tu_tuong_Ho_Chi_Minh.md": { subjectKey: "tu-tuong-hcm", subjectName: "Tư tưởng Hồ Chí Minh" },
};

// Chapter headings are the only structurally reliable markers across this corpus — the `##`/`###`
// markdown headings present in 3/5 files are just PDF page-break markers ("## Trang N"), not section
// boundaries, and must NOT be used for chunking.
const CHAPTER_LINE_RE = /^Ch[uư][oơ]ng\s+(nh[aậ]p\s*m[oô]n|m[oở]\s*đ[aầ]u|[0-9]+|[IVXLCDM]+)\s*$/i;
// Every source file ends (or, in one case, begins) with a "MỤC LỤC" table-of-contents dump that repeats
// chapter-heading-looking lines. When it trails the real content (the common case) we simply cut it off
// before chapter-detection so it can't be mistaken for extra chapters.
const TOC_LINE_RE = /^M[UỤ]C\s*L[UỤ]C\s*$/i;

const MIN_WINDOW_WORDS = 1200;
const MAX_WINDOW_WORDS = 1800;
const MIN_KEPT_WORDS = 30; // drop windows below this — leftover noise from stray heading-like matches (e.g. garbled OCR table-of-contents fragments), not real content.

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Groups paragraphs into ~1200-1800 word windows without ever splitting a paragraph. An oversized single
 * paragraph (> MAX_WINDOW_WORDS on its own) is kept whole as its own window rather than truncated. */
function buildWordWindows(paragraphs: string[]): string[][] {
  const windows: string[][] = [];
  let current: string[] = [];
  let currentWords = 0;

  const flush = () => {
    if (current.length > 0) {
      windows.push(current);
      current = [];
      currentWords = 0;
    }
  };

  for (const para of paragraphs) {
    const paraWords = countWords(para);
    if (paraWords > MAX_WINDOW_WORDS) {
      flush();
      windows.push([para]);
      continue;
    }
    current.push(para);
    currentWords += paraWords;
    if (currentWords >= MIN_WINDOW_WORDS) flush();
  }
  flush();

  return windows;
}

interface ChapterSegment {
  chapterLabel: string | null;
  lines: string[];
}

// A real chapter heading is thousands of lines away from the next one (this corpus averages
// ~1000-3700 lines/chapter). A "Mục lục"/table-of-contents dump lists chapter-heading-looking
// lines within a few lines of each other. We saw this concretely in Giao_trinh_Tu_tuong_Ho_Chi_Minh.md:
// its ToC sits at the START of the file (lines 72-112) rather than the end, so the trailing-ToC cut
// below never removes it, and 3 of its entries ("Chương IV/V/VI") happen to match CHAPTER_LINE_RE just
// like the real headings later in the file — without this filter, the huge stretch of real body text
// between the bogus ToC "Chương VI" and the next real boundary got silently mislabeled as chapter VI
// and then overwritten (same slug) when the real chapter VI segment was upserted, losing chapters I-III
// entirely. Any boundary within CLUSTER_GAP_LINES of another boundary is part of such a cluster and is
// dropped (treated as if that line never matched) — the content around it falls back into the
// unlabeled preamble/whatever real segment surrounds it, instead of being trusted as a chapter start.
const CLUSTER_GAP_LINES = 150;

function dropTocClusterBoundaries(boundaries: { index: number; label: string }[]): { index: number; label: string }[] {
  return boundaries.filter((b, i) => {
    const prevGap = i > 0 ? b.index - boundaries[i - 1].index : Infinity;
    const nextGap = i < boundaries.length - 1 ? boundaries[i + 1].index - b.index : Infinity;
    return prevGap >= CLUSTER_GAP_LINES && nextGap >= CLUSTER_GAP_LINES;
  });
}

function splitIntoChapterSegments(lines: string[]): ChapterSegment[] {
  const rawBoundaries: { index: number; label: string }[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (CHAPTER_LINE_RE.test(trimmed)) rawBoundaries.push({ index: i, label: trimmed });
  });
  const boundaries = dropTocClusterBoundaries(rawBoundaries);

  const segments: ChapterSegment[] = [];

  const firstBoundary = boundaries[0]?.index ?? lines.length;
  if (firstBoundary > 0) {
    segments.push({ chapterLabel: null, lines: lines.slice(0, firstBoundary) });
  }

  for (let b = 0; b < boundaries.length; b++) {
    const start = boundaries[b].index;
    const end = b + 1 < boundaries.length ? boundaries[b + 1].index : lines.length;
    segments.push({ chapterLabel: boundaries[b].label, lines: lines.slice(start, end) });
  }

  return segments;
}

export function parseTextbooksDir(baseDir: string): ParseTextbooksResult {
  const lessonUnits: ParsedTextbookLessonUnit[] = [];
  const chapterCountBySubject: Record<string, number> = {};
  let globalOrderIndex = 0;

  const files = fs
    .readdirSync(baseDir)
    .filter((f) => f.endsWith(".md") && FILE_TO_SUBJECT[f])
    .sort();

  for (const file of files) {
    const { subjectKey, subjectName } = FILE_TO_SUBJECT[file];
    const raw = fs.readFileSync(path.join(baseDir, file), "utf-8").replace(/\f/g, "");
    const allLines = raw.split(/\r?\n/);

    let tocIdx = -1;
    for (let i = 0; i < allLines.length; i++) {
      if (TOC_LINE_RE.test(allLines[i].trim())) {
        tocIdx = i;
        break;
      }
    }
    // Only trust the ToC marker as a cut point when it trails the real content (back half of the file).
    // A ToC near the very start (seen in one file) is a leading table of contents we can't cleanly excise
    // without losing real content, so we leave it in — the unlabeled-preamble handling below absorbs it,
    // and the MIN_KEPT_WORDS filter drops the handful of leftover junk fragments it produces.
    const effectiveLines = tocIdx >= 0 && tocIdx > allLines.length * 0.5 ? allLines.slice(0, tocIdx) : allLines;

    const segments = splitIntoChapterSegments(effectiveLines);
    const realChapterCount = segments.filter((s) => s.chapterLabel !== null).length;
    chapterCountBySubject[subjectKey] = realChapterCount;

    for (const segment of segments) {
      const paragraphs = splitParagraphs(segment.lines.join("\n"));
      if (paragraphs.length === 0) continue;
      const windows = buildWordWindows(paragraphs);

      const kept = windows.filter((w) => countWords(w.join("\n\n")) >= MIN_KEPT_WORDS);

      kept.forEach((windowParas, m) => {
        const bodyText = windowParas.join("\n\n");
        const chapterLabel = segment.chapterLabel;
        let contentMarkdown = bodyText;
        if (m > 0) {
          const overlapPara = kept[m - 1][kept[m - 1].length - 1];
          contentMarkdown =
            `[NGỮ CẢNH NỐI TIẾP — không sinh câu hỏi cho phần này]\n${overlapPara}\n[HẾT NGỮ CẢNH NỐI TIẾP]\n\n` +
            bodyText;
        }

        globalOrderIndex += 1;
        const chapterSlugPart = chapterLabel
          ? chapterLabel
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
          : "mo-dau";

        lessonUnits.push({
          subjectKey,
          slug: `${subjectKey}-${chapterSlugPart}-phan-${m + 1}`,
          title: `${subjectName} — ${chapterLabel ?? "Mở đầu"} — Phần ${m + 1}/${kept.length}`,
          orderIndex: globalOrderIndex,
          contentMarkdown,
          chapterLabel,
        });
      });
    }

    console.log(
      `[ingestTextbooks] ${file}: ${realChapterCount} chương thật, ${lessonUnits.filter((u) => u.subjectKey === subjectKey).length} lesson unit(s)` +
        (tocIdx >= 0 ? `, MỤC LỤC ở dòng ${tocIdx + 1}${tocIdx > allLines.length * 0.5 ? " (đã cắt bỏ, trailing ToC)" : " (giữ nguyên, leading ToC)"}` : ""),
    );
  }

  return { lessonUnits, chapterCountBySubject };
}
