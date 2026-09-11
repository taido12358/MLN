import { parsePresentsDir } from "../ingestPresents.js";
import { parseTextbooksDir } from "../ingestTextbooks.js";

const PRESENTS_DIR = "C:\\Users\\ADMIN\\Downloads\\MLN\\Presents";
const TEXTBOOKS_DIR = "C:\\Users\\ADMIN\\Downloads\\MLN\\giao-trinh-llct\\md";

const presents = parsePresentsDir(PRESENTS_DIR);
console.log("\n=== Presents ===");
console.log("LessonUnit count:", presents.lessonUnits.length, "(expected 10)");
console.log("DiscussionQuestion count:", presents.discussionQuestions.length, "(expected 70)");
console.log(
  "Sample titles:",
  presents.lessonUnits.slice(0, 3).map((u) => `${u.orderIndex}. ${u.title}`),
);

console.log("\n=== Textbooks ===");
const textbooks = parseTextbooksDir(TEXTBOOKS_DIR);
console.log("\nChapter counts by subject:", textbooks.chapterCountBySubject);
console.log("Total textbook LessonUnit count:", textbooks.lessonUnits.length);

const sample = textbooks.lessonUnits[Math.floor(textbooks.lessonUnits.length / 2)];
console.log("\n--- Sample mid-corpus LessonUnit ---");
console.log("title:", sample.title);
console.log("chapterLabel:", sample.chapterLabel);
console.log("contentMarkdown (first 300 chars):\n", sample.contentMarkdown.slice(0, 300));

console.log("\n=== TOTAL LessonUnit (Presents + Textbooks) ===", presents.lessonUnits.length + textbooks.lessonUnits.length);
