'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('tangil_user')
    if (!raw) {
      router.replace('/register')
      return
    }
    const u = JSON.parse(raw)
    setUserName(u.name ?? null)
  }, [router])

  if (!userName) return null

  return (
    <div className="wrap">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-logo">딴길</div>
        <div className="home-greeting">안녕하세요, {userName}님 👋</div>
        <div className="home-tagline">오늘은 어떤 딴길을 걸어볼까요?</div>
      </div>

      {/* Menu */}
      <div className="home-menu">
        <Link href="/find" className="menu-item">
          <div className="menu-icon" style={{ background: '#EBF4EC' }}>🧭</div>
          <div className="menu-text">
            <div className="menu-title">딴길 찾기</div>
            <div className="menu-desc">내 취향 기반 색다른 문화 경험 추천</div>
          </div>
          <span className="menu-arrow">›</span>
        </Link>

        <Link href="/my-tangil" className="menu-item">
          <div className="menu-icon" style={{ background: '#FDF1EB' }}>🗂️</div>
          <div className="menu-text">
            <div className="menu-title">나의 딴길 서랍</div>
            <div className="menu-desc">내가 저장한 딴길 모아보기</div>
          </div>
          <span className="menu-arrow">›</span>
        </Link>

        <Link href="/others" className="menu-item">
          <div className="menu-icon" style={{ background: '#EEF2FF' }}>🌏</div>
          <div className="menu-text">
            <div className="menu-title">다른 사람들의 딴길</div>
            <div className="menu-desc">지역·장르별로 딴길 탐색하기</div>
          </div>
          <span className="menu-arrow">›</span>
        </Link>
      </div>
    </div>
  )
}
