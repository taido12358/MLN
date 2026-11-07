import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TetBackground } from "@/components/TetBackground";

export const metadata: Metadata = {
  title: "Lớp học Lý luận chính trị — Tương tác trực tiếp",
  description: "Trang tương tác gamified cho lớp học Lý luận chính trị",
};

export const viewport: Viewport = {
  themeColor: "#d7261e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <TetBackground />
        {children}
      </body>
    </html>
  );
}
