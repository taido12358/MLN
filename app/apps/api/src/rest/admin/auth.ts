import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authRouter = Router();

interface AdminJwtPayload {
  role: "admin";
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET chưa được cấu hình.");
  return secret;
}

authRouter.post("/login", (req: Request, res: Response) => {
  const { password } = req.body ?? {};
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return res.status(500).json({ error: "ADMIN_PASSWORD chưa được cấu hình trên server." });

  if (typeof password !== "string" || password !== adminPassword) {
    return res.status(401).json({ error: "Sai mật khẩu." });
  }

  const token = jwt.sign({ role: "admin" } satisfies AdminJwtPayload, getJwtSecret(), { expiresIn: "8h" });
  res.json({ token });
});

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Thiếu Bearer token." });

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as AdminJwtPayload;
    if (payload.role !== "admin") throw new Error("role không hợp lệ");
    next();
  } catch {
    res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn." });
  }
}
