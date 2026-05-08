import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '딴길',
  description: '색다른 문화 경험을 찾아드려요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
