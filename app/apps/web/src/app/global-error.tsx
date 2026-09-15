"use client";

import { THEME } from "../theme-tokens";

/**
 * Catches errors thrown by the root layout itself (very rare here — layout.tsx is just an
 * <html>/<body> wrapper with no logic) — App Router requires this to render its own <html>/<body>
 * since it replaces the layout entirely. `error.tsx` (same folder) covers every normal page crash;
 * this is just the last-resort fallback so that rare case doesn't fall through to an unstyled
 * browser error page instead.
 *
 * This file can't use Tailwind (it replaces the root layout, so globals.css never loads), so it
 * uses inline styles built from the shared THEME tokens instead of hand-copied hex values.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center", background: THEME.ink, color: "#fff" }}>
          <div style={{ fontSize: "48px" }}>😵</div>
          <h1 style={{ marginTop: "16px", fontSize: "20px", fontWeight: 800 }}>Đã có lỗi xảy ra</h1>
          <p style={{ marginTop: "8px", maxWidth: "360px", fontSize: "14px", opacity: 0.6 }}>
            Trang gặp sự cố nghiêm trọng. Thử tải lại trang.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: "24px", borderRadius: "12px", background: THEME.accent, padding: "12px 20px", fontWeight: 700, color: THEME.ink, minHeight: 44, minWidth: 44 }}
          >
            Thử lại
          </button>
        </main>
      </body>
    </html>
  );
}
