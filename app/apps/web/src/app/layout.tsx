import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lớp học Lý luận chính trị — Tương tác trực tiếp",
  description: "Trang tương tác gamified cho lớp học Lý luận chính trị",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
