import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

import { PrismaClient } from "@prisma/client";
import { parsePresentsDir } from "../ingest/ingestPresents.js";
import { parseTextbooksDir } from "../ingest/ingestTextbooks.js";

const prisma = new PrismaClient();

const SUBJECTS: { key: string; name: string; orderIndex: number }[] = [
  { key: "presentation", name: "Chủ đề thuyết trình", orderIndex: 0 },
  { key: "triet-hoc-ml", name: "Triết học Mác - Lênin", orderIndex: 1 },
  { key: "kinh-te-chinh-tri-ml", name: "Kinh tế Chính trị Mác - Lênin", orderIndex: 2 },
  { key: "cnxhkh", name: "Chủ nghĩa xã hội khoa học", orderIndex: 3 },
  { key: "lich-su-dang", name: "Lịch sử Đảng Cộng sản Việt Nam", orderIndex: 4 },
  { key: "tu-tuong-hcm", name: "Tư tưởng Hồ Chí Minh", orderIndex: 5 },
];

const BADGES: { code: string; name: string; description: string }[] = [
  { code: "tia-chop", name: "Tia chớp", description: "Trả lời đúng nhanh nhất phòng (tối thiểu 3 câu đúng)." },
  { code: "bat-bai", name: "Bất bại", description: "Trả lời đúng 100% số câu đã tham gia." },
  { code: "chuoi-vang", name: "Chuỗi vàng", description: "Đạt chuỗi trả lời đúng liên tiếp từ 5 câu trở lên." },
  { code: "but-pha", name: "Bứt phá", description: "Cải thiện thứ hạng nhiều nhất từ giữa buổi đến lúc kết thúc." },
  {
    code: "ngoi-but-phan-bien",
    name: "Ngòi bút phản biện",
    description: "Bài viết thảo luận nhận nhiều lượt upvote nhất.",
  },
  {
    code: "loi-nguoc-dong",
    name: "Lội ngược dòng",
    description: "Từ nhóm cuối bảng vươn lên top nửa đầu bảng xếp hạng.",
  },
  { code: "quan-quan", name: "Quán quân", description: "Đứng hạng 1 chung cuộc." },
  { code: "kien-tri", name: "Kiên trì", description: "Trả lời đầy đủ 100% số câu hỏi đã mở trong phòng." },
];

async function seedSubjectsAndBadges(): Promise<Map<string, string>> {
  const subjectIdByKey = new Map<string, string>();

  for (const subject of SUBJECTS) {
    const row = await prisma.subject.upsert({
      where: { key: subject.key },
      update: { name: subject.name, orderIndex: subject.orderIndex },
      create: subject,
    });
    subjectIdByKey.set(subject.key, row.id);
  }

  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: { name: badge.name, description: badge.description },
      create: badge,
    });
  }

  return subjectIdByKey;
}

async function seedContent(subjectIdByKey: Map<string, string>) {
  const presentsDir = process.env.PRESENTS_DIR ?? "/data/presents";
  const textbooksDir = process.env.TEXTBOOKS_DIR ?? "/data/giao-trinh";

  const presentationSubjectId = subjectIdByKey.get("presentation");
  if (!presentationSubjectId) throw new Error('Subject "presentation" chưa được seed.');

  console.log(`[seed] Đọc Presents từ: ${presentsDir}`);
  const presents = parsePresentsDir(presentsDir);

  const lessonUnitIdBySlug = new Map<string, string>();

  for (const unit of presents.lessonUnits) {
    const row = await prisma.lessonUnit.upsert({
      where: { slug: unit.slug },
      update: {
        title: unit.title,
        orderIndex: unit.orderIndex,
        contentMarkdown: unit.contentMarkdown,
        subjectId: presentationSubjectId,
        sourceType: "PRESENTATION",
      },
      create: {
        slug: unit.slug,
        title: unit.title,
        orderIndex: unit.orderIndex,
        contentMarkdown: unit.contentMarkdown,
        subjectId: presentationSubjectId,
        sourceType: "PRESENTATION",
      },
    });
    lessonUnitIdBySlug.set(unit.slug, row.id);
  }

  for (const dq of presents.discussionQuestions) {
    const lessonUnitId = lessonUnitIdBySlug.get(dq.lessonUnitSlug);
    if (!lessonUnitId) {
      console.warn(`[seed] Bỏ qua DiscussionQuestion vì không tìm thấy LessonUnit slug=${dq.lessonUnitSlug}`);
      continue;
    }
    const existing = await prisma.discussionQuestion.findFirst({
      where: { lessonUnitId, orderIndex: dq.orderIndex },
    });
    if (existing) {
      await prisma.discussionQuestion.update({
        where: { id: existing.id },
        data: { question: dq.question, suggestedAnswer: dq.suggestedAnswer },
      });
    } else {
      await prisma.discussionQuestion.create({
        data: {
          lessonUnitId,
          orderIndex: dq.orderIndex,
          question: dq.question,
          suggestedAnswer: dq.suggestedAnswer,
        },
      });
    }
  }

  console.log(`[seed] Presents: ${presents.lessonUnits.length} LessonUnit, ${presents.discussionQuestions.length} DiscussionQuestion.`);

  console.log(`[seed] Đọc giáo trình từ: ${textbooksDir}`);
  const textbooks = parseTextbooksDir(textbooksDir);

  let textbookCount = 0;
  for (const unit of textbooks.lessonUnits) {
    const subjectId = subjectIdByKey.get(unit.subjectKey);
    if (!subjectId) {
      console.warn(`[seed] Bỏ qua LessonUnit vì subjectKey lạ: ${unit.subjectKey}`);
      continue;
    }
    await prisma.lessonUnit.upsert({
      where: { slug: unit.slug },
      update: {
        title: unit.title,
        orderIndex: unit.orderIndex,
        contentMarkdown: unit.contentMarkdown,
        chapterLabel: unit.chapterLabel,
        subjectId,
        sourceType: "TEXTBOOK",
      },
      create: {
        slug: unit.slug,
        title: unit.title,
        orderIndex: unit.orderIndex,
        contentMarkdown: unit.contentMarkdown,
        chapterLabel: unit.chapterLabel,
        subjectId,
        sourceType: "TEXTBOOK",
      },
    });
    textbookCount += 1;
  }

  console.log(`[seed] Textbooks: ${textbookCount} LessonUnit (chapterCountBySubject=${JSON.stringify(textbooks.chapterCountBySubject)}).`);

  const freshSlugs = new Set<string>([
    ...presents.lessonUnits.map((u) => u.slug),
    ...textbooks.lessonUnits.map((u) => u.slug),
  ]);
  return freshSlugs;
}

/**
 * Ingest logic is expected to evolve (chunking/regex fixes), which changes the slugs it produces
 * across runs. Upsert-by-slug never removes rows for slugs a *previous* run created but the
 * *current* run no longer does — left unchecked those become stale orphans (this happened for
 * real: an earlier ingestTextbooks bug produced 13 leftover "tu-tuong-hcm-chuong-vi-phan-16..28"
 * rows from a mislabeled chapter split that no longer exists once the bug was fixed). Delete any
 * LessonUnit not in the current parse output, cascading through its dependents first.
 */
async function pruneStaleLessonUnits(freshSlugs: Set<string>) {
  const all = await prisma.lessonUnit.findMany({ select: { id: true, slug: true } });
  const staleIds = all.filter((u) => !freshSlugs.has(u.slug)).map((u) => u.id);
  if (staleIds.length === 0) return 0;

  await prisma.quizQuestion.deleteMany({ where: { lessonUnitId: { in: staleIds } } });
  await prisma.generationJob.deleteMany({ where: { lessonUnitId: { in: staleIds } } });
  await prisma.discussionQuestion.deleteMany({ where: { lessonUnitId: { in: staleIds } } });
  // A stale LessonUnit can still be referenced by some room's playlist (this is exactly the FK
  // violation that would otherwise crash this script — schema.prisma now cascades this at the DB
  // level too, but deleting it explicitly here keeps this function correct even if `prisma db push`
  // hasn't been re-run against a given database yet).
  await prisma.roomPlaylistItem.deleteMany({ where: { lessonUnitId: { in: staleIds } } });
  await prisma.room.updateMany({ where: { currentLessonUnitId: { in: staleIds } }, data: { currentLessonUnitId: null } });
  await prisma.lessonUnit.deleteMany({ where: { id: { in: staleIds } } });
  return staleIds.length;
}

async function main() {
  const subjectIdByKey = await seedSubjectsAndBadges();
  const freshSlugs = await seedContent(subjectIdByKey);
  const prunedCount = await pruneStaleLessonUnits(freshSlugs);
  if (prunedCount > 0) console.log(`[seed] Đã xoá ${prunedCount} LessonUnit lỗi thời (slug không còn được sinh ra bởi ingest hiện tại).`);

  const counts = {
    subjects: await prisma.subject.count(),
    badges: await prisma.badge.count(),
    lessonUnits: await prisma.lessonUnit.count(),
    discussionQuestions: await prisma.discussionQuestion.count(),
  };
  console.log("[seed] Tổng kết:", counts);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
