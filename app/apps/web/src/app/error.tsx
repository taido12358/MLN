"use client";

import { useEffect } from "react";
import { CenteredMessage } from "@/components/ui/CenteredMessage";

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
    <CenteredMessage
      emoji="😵"
      title="Đã có lỗi xảy ra"
      subtitle="Trang gặp sự cố ngoài dự kiến. Thử lại — nếu vẫn lỗi, quay về trang chủ và tham gia lại phòng."
    >
      <button onClick={reset} className="tap-target rounded-2xl btn-shine bg-red-envelope ring-1 ring-inset ring-gold/60 shadow-glow px-5 py-3 font-bold text-gold">
        Thử lại
      </button>
      <a href="/" className="tap-target flex items-center rounded-2xl bg-ink/10 px-5 py-3 font-bold">
        Về trang chủ
      </a>
    </CenteredMessage>
  );
}
