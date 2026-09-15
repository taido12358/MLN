"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { writeAdminToken } from "@/lib/storage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function HostLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await api.login(password);
      writeAdminToken(token);
      router.push("/host/content");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể đăng nhập.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs space-y-4 rounded-2xl bg-panel p-6 shadow-glow"
      >
        <h1 className="text-center text-xl font-extrabold">👩‍🏫 Giáo viên đăng nhập</h1>
        <Input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          autoFocus
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="tap-target flex items-center justify-center rounded-lg p-2 text-white/50 hover:text-white"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        {error && <p className="text-sm text-wrong">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
        <a href="/" className="block text-center text-xs text-white/40 hover:text-white/70">
          ← Về trang sinh viên
        </a>
      </motion.form>
    </main>
  );
}
