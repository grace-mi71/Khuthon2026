import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "딴길",
  description: "취향을 단계적으로 확장하는 공연 발견 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
