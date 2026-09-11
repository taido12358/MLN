"use client";

/**
 * Catches errors thrown by the root layout itself (very rare here — layout.tsx is just an
 * <html>/<body> wrapper with no logic) — App Router requires this to render its own <html>/<body>
 * since it replaces the layout entirely. `error.tsx` (same folder) covers every normal page crash;
 * this is just the last-resort fallback so that rare case doesn't fall through to an unstyled
 * browser error page instead.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center", background: "#0b0b1a", color: "#fff" }}>
          <div style={{ fontSize: "48px" }}>😵</div>
          <h1 style={{ marginTop: "16px", fontSize: "20px", fontWeight: 800 }}>Đã có lỗi xảy ra</h1>
          <p style={{ marginTop: "8px", maxWidth: "360px", fontSize: "14px", opacity: 0.6 }}>
            Trang gặp sự cố nghiêm trọng. Thử tải lại trang.
          </p>
          <button
            onClick={reset}
            style={{ marginTop: "24px", borderRadius: "12px", background: "#7c5cff", padding: "12px 20px", fontWeight: 700, color: "#0b0b1a" }}
          >
            Thử lại
          </button>
        </main>
      </body>
    </html>
  );
}
