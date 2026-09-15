"use client";

import { CenteredMessage } from "@/components/ui/CenteredMessage";

/** Next.js App Router 404 — previously absent, so an invalid path (typo'd room code, stale link)
 * fell through to Next's bare unstyled 404 instead of matching the rest of the app's dark theme
 * (see error.tsx for the crash-boundary equivalent). */
export default function NotFound() {
  return (
    <CenteredMessage emoji="🧭" title="Không tìm thấy trang" subtitle="Đường dẫn này không tồn tại — kiểm tra lại link hoặc quay về trang chủ.">
      <a href="/" className="tap-target flex items-center rounded-2xl bg-gradient-to-r from-accent to-accent2 px-5 py-3 font-bold text-ink">
        Về trang chủ
      </a>
    </CenteredMessage>
  );
}
