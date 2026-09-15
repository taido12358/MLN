import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { prisma } from "../../prismaClient.js";
import { asyncHandler } from "../asyncHandler.js";
import { computeRoomLeaderboard } from "../../socket/leaderboard.js";

/** Requires the admin JWT (mounted behind requireAdmin) — only a logged-in teacher creates rooms. */
export const adminRoomsRouter = Router();

/** No admin JWT here on purpose: the host console only holds the room's own hostToken, checked
 * inside the handler below, not a teacher login session. Must be mounted WITHOUT requireAdmin. */
export const hostTokenRoomsRouter = Router();

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid ambiguity when read off a projector
const MAX_PLAYLIST_LENGTH = 50; // generous for a single class session; guards against a malformed/huge request

function randomCode(length = 6): string {
  return Array.from({ length }, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join("");
}

async function generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Không thể sinh mã phòng duy nhất sau 10 lần thử.");
}

adminRoomsRouter.post(
  "/rooms",
  asyncHandler(async (req: Request, res: Response) => {
    const lessonUnitIds: unknown = req.body?.lessonUnitIds;
    if (!Array.isArray(lessonUnitIds) || lessonUnitIds.some((x) => typeof x !== "string")) {
      return res.status(400).json({ error: "lessonUnitIds phải là mảng string." });
    }
    if (lessonUnitIds.length === 0) {
      return res.status(400).json({ error: "lessonUnitIds không được rỗng." });
    }
    if (lessonUnitIds.length > MAX_PLAYLIST_LENGTH) {
      return res.status(400).json({ error: `lessonUnitIds không được quá ${MAX_PLAYLIST_LENGTH} phần tử.` });
    }

    // Verify every id actually exists BEFORE creating anything — otherwise the nested
    // playlistItems.create below throws a raw FK constraint violation (P2003) for a single bad id,
    // which used to escape uncaught here.
    const uniqueIds = [...new Set(lessonUnitIds)];
    const found = await prisma.lessonUnit.findMany({ where: { id: { in: uniqueIds } }, select: { id: true } });
    if (found.length !== uniqueIds.length) {
      const foundIds = new Set(found.map((u) => u.id));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      return res.status(400).json({ error: "Một số lessonUnitIds không tồn tại.", missing });
    }

    const code = await generateUniqueRoomCode();
    const hostToken = crypto.randomBytes(24).toString("hex");

    const room = await prisma.room.create({
      data: {
        code,
        hostToken,
        state: "LOBBY",
        currentLessonUnitId: lessonUnitIds[0],
        playlistItems: {
          create: lessonUnitIds.map((lessonUnitId, orderIndex) => ({ lessonUnitId, orderIndex })),
        },
      },
    });

    res.status(201).json({ code: room.code, hostToken: room.hostToken, roomId: room.id });
  }),
);

/** Host-facing detail lookup, authenticated by the room's own hostToken (NOT the admin JWT) —
 * a teacher running the live console only needs the token for the one room they are hosting. */
hostTokenRoomsRouter.get(
  "/rooms/:code",
  asyncHandler(async (req: Request, res: Response) => {
    const hostToken = req.headers["x-host-token"];
    const room = await prisma.room.findUnique({
      where: { code: req.params.code },
      include: {
        participants: true,
        currentLessonUnit: true,
        playlistItems: { orderBy: { orderIndex: "asc" }, include: { lessonUnit: true } },
      },
    });
    if (!room) return res.status(404).json({ error: "Không tìm thấy phòng." });
    if (typeof hostToken !== "string" || hostToken !== room.hostToken) {
      return res.status(403).json({ error: "hostToken không hợp lệ cho phòng này." });
    }

    res.json(room);
  }),
);

function csvField(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRow(fields: unknown[]): string {
  return fields.map(csvField).join(",") + "\r\n";
}

/** CSV export of a room's results — deliberately reads straight from Postgres (never the in-memory
 * roomState), so it works identically whether the room is still live or has already been ended
 * (host:endRoom clears roomState.ts's in-memory entry, but every Answer/DiscussionPost/
 * ParticipantBadge row it's built from stays in Postgres indefinitely). Same host-token auth as
 * GET /rooms/:code above. No CSV library dependency — the data is small (≤70 participants/session,
 * per the original architecture's sizing), so a hand-rolled RFC 4180-ish writer is enough. */
hostTokenRoomsRouter.get(
  "/rooms/:code/export.csv",
  asyncHandler(async (req: Request, res: Response) => {
    const hostToken = req.headers["x-host-token"];
    const room = await prisma.room.findUnique({ where: { code: req.params.code } });
    if (!room) return res.status(404).json({ error: "Không tìm thấy phòng." });
    if (typeof hostToken !== "string" || hostToken !== room.hostToken) {
      return res.status(403).json({ error: "hostToken không hợp lệ cho phòng này." });
    }

    const [leaderboard, badgeRows, answers, posts] = await Promise.all([
      computeRoomLeaderboard(prisma, room.id),
      prisma.participantBadge.findMany({ where: { roomId: room.id }, include: { badge: true } }),
      prisma.answer.findMany({
        where: { roomId: room.id },
        include: { participant: true, quizQuestion: true },
        orderBy: { answeredAt: "asc" },
      }),
      prisma.discussionPost.findMany({
        where: { roomId: room.id },
        include: { participant: true, discussionQuestion: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const badgeNamesByParticipant = new Map<string, string[]>();
    for (const b of badgeRows) {
      const list = badgeNamesByParticipant.get(b.participantId) ?? [];
      list.push(b.badge.name);
      badgeNamesByParticipant.set(b.participantId, list);
    }

    let csv = "﻿"; // BOM so Excel opens the Vietnamese diacritics as UTF-8 instead of guessing ANSI
    csv += csvRow(["Bảng điểm"]);
    csv += csvRow(["Hạng", "Biệt danh", "Điểm", "Huy hiệu"]);
    for (const row of leaderboard) {
      csv += csvRow([row.rank, row.nickname, row.score, (badgeNamesByParticipant.get(row.participantId) ?? []).join(" | ")]);
    }

    csv += "\r\n" + csvRow(["Câu trả lời chi tiết"]);
    csv += csvRow(["Biệt danh", "Câu hỏi", "Đáp án đã chọn", "Đúng/Sai", "Thời gian (ms)", "Điểm", "Điểm chuỗi"]);
    for (const a of answers) {
      csv += csvRow([
        a.participant.nickname,
        a.quizQuestion.question,
        a.selectedIndex,
        a.isCorrect ? "Đúng" : "Sai",
        a.responseTimeMs,
        a.pointsAwarded,
        a.streakBonus,
      ]);
    }

    csv += "\r\n" + csvRow(["Bài thảo luận"]);
    csv += csvRow(["Biệt danh", "Câu hỏi thảo luận", "Nội dung", "Lượt upvote"]);
    for (const p of posts) {
      csv += csvRow([p.participant.nickname, p.discussionQuestion.question, p.content, p.upvotes]);
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="ket-qua-${room.code}.csv"`);
    res.send(csv);
  }),
);
