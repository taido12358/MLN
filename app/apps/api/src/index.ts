import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import http from "node:http";
import express from "express";
import cors from "cors";
import { authRouter, requireAdmin } from "./rest/admin/auth.js";
import { publicContentRouter, adminContentRouter } from "./rest/admin/content.js";
import { generateRouter } from "./rest/admin/generate.js";
import { adminRoomsRouter, hostTokenRoomsRouter } from "./rest/admin/rooms.js";
import { initSocket } from "./socket/index.js";
import { prisma } from "./prismaClient.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", publicContentRouter);
app.use("/api/admin", authRouter);
// Must be registered BEFORE the requireAdmin-gated mounts below: Express applies middleware in
// registration order regardless of which router ultimately owns a route, so if a requireAdmin
// mount came first it would 401 this request before ever reaching this router (this bit us during
// testing — GET /api/admin/rooms/:code returned "Thiếu Bearer token" instead of checking hostToken).
// Host console auth here is the room's own hostToken (checked in-handler), not the admin JWT.
app.use("/api/admin", hostTokenRoomsRouter);
app.use("/api/admin", requireAdmin, adminContentRouter);
app.use("/api/admin", requireAdmin, generateRouter);
app.use("/api/admin", requireAdmin, adminRoomsRouter);

// A GenerationJob can only legitimately be "RUNNING" while the process that created it is alive —
// if the api container restarts (crash, redeploy, `docker compose up -d api`) mid-generation, that
// row is orphaned at RUNNING forever since nothing ever transitions it again. Left alone this
// silently corrupts /generate-quiz/batch/status's counts on every future restart. Reconcile once
// at boot: anything still RUNNING now definitely died with the previous process.
prisma.generationJob
  .updateMany({
    where: { status: "RUNNING" },
    data: { status: "FAILED", error: "Bị gián đoạn do server khởi động lại." },
  })
  .then(({ count }) => {
    if (count > 0) console.warn(`[api] Đã đánh dấu ${count} GenerationJob còn kẹt ở RUNNING thành FAILED sau khi khởi động lại.`);
  })
  .catch((err) => console.error("[api] Lỗi khi dọn GenerationJob RUNNING lúc khởi động:", err));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[api] Lỗi chưa được xử lý trong request:", err);
  if (!res.headersSent) res.status(500).json({ error: "Lỗi máy chủ không xác định." });
});

const httpServer = http.createServer(app);
initSocket(httpServer);

const port = Number(process.env.PORT) || 3001;
httpServer.listen(port, () => {
  console.log(`[api] Đang chạy ở cổng ${port} (HTTP + Socket.io)`);
});
