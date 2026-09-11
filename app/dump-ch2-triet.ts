import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const prisma = new PrismaClient();

async function main() {
  const units = await prisma.lessonUnit.findMany({
    where: { chapterLabel: "Chương 2", subject: { key: "triet-hoc-ml" } },
    orderBy: { orderIndex: "asc" },
  });
  const text = units.map((u) => `\n\n===== ${u.title} =====\n${u.contentMarkdown}`).join("\n");
  fs.writeFileSync("/tmp/ch2-triet.txt", text);
  console.log("units:", units.length, "chars:", text.length);
}

main().finally(() => prisma.$disconnect());
