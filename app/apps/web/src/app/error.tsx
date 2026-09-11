"use client";

import { useEffect } from "react";

/**
 * Next.js App Router error boundary for everything under the root layout (`/`, `/host/*`,
 * `/play/*`, `/leaderboard/*`). Before this existed, any uncaught client exception replaced the
 * whole page with Next's bare "Application error: a client-side exception has occurred" — no way
 * back except a manual URL edit. Mid-class that means one bad render (e.g. a malformed row from an
 * API response) strands a student or the host with a dead screen and no visible way to recover.
 */
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl">😵</div>
      <h1 className="mt-4 text-xl font-extrabold">Đã có lỗi xảy ra</h1>
      <p className="mt-2 max-w-sm text-sm text-white/60">
        Trang gặp sự cố ngoài dự kiến. Thử lại — nếu vẫn lỗi, quay về trang chủ và tham gia lại phòng.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="tap-target rounded-xl bg-accent px-5 py-3 font-bold text-ink">
          Thử lại
        </button>
        <a href="/" className="tap-target flex items-center rounded-xl bg-white/10 px-5 py-3 font-bold">
          Về trang chủ
        </a>
      </div>
    </main>
  );
}
