import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "딴길 — 취향을 발견하는 중",
  description: "공연 한 편이 다음 한 편으로 이어지도록. 취향을 단계적으로 확장하는 공연 발견 서비스.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
