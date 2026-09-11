"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api, ApiError } from "@/lib/api";

export default function HostLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await api.login(password);
      localStorage.setItem("mln:adminToken", token);
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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full rounded-xl border border-white/10 bg-panel2 px-4 py-3 outline-none ring-accent focus:ring-2"
          autoFocus
        />
        {error && <p className="text-sm text-wrong">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent2 py-3 font-extrabold text-ink disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
        <a href="/" className="block text-center text-xs text-white/40 hover:text-white/70">
          ← Về trang sinh viên
        </a>
      </motion.form>
    </main>
  );
}
