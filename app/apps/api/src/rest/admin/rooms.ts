import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { prisma } from "../../prismaClient.js";
import { asyncHandler } from "../asyncHandler.js";

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
