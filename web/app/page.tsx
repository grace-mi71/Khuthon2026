'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import HeroBg from './components/HeroBg'

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

  const today = new Date()
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="wrap">
      {/* ── 사진형 히어로 (삼청각 hero 오마주) ── */}
      <HeroBg
        className="tg-hero--home"
        watermarks={[
          { char: '他', pos: 'tl' },
          { char: '路', pos: 'br', size: '10rem', opacity: 0.05 },
        ]}
      >
        <div className="tg-hero-content">
          <div className="tg-hero-stamp">
            <span className="tg-hero-stamp-date">{dateStr}</span>
            <span className="tg-hero-stamp-sub">Tangil Local</span>
          </div>
          <div className="tg-hero-title">
            딴 길
            <small>색다른 문화 경험</small>
          </div>
        </div>
        <div className="tg-hero-dots">
          <span className="tg-hero-dot on" />
          <span className="tg-hero-dot" />
          <span className="tg-hero-dot" />
          <span className="tg-hero-dot" />
        </div>
      </HeroBg>

      {/* ── 인사 카드 (히어로와 살짝 겹침) ── */}
      <div className="tg-greet">
        <div>
          <div className="tg-greet-name">{userName} 님, 안녕하세요</div>
          <div className="tg-greet-msg">오늘은 어떤 딴길을 걸어볼까요?</div>
        </div>
        <div className="tg-greet-mark">他</div>
      </div>

      {/* ── 본문 ── */}
      <div className="content" style={{ paddingTop: 28 }}>

        {/* 딴길 이야기 (about 섹션 오마주) */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">딴길 이야기</span>
              <span className="tg-shead-title">정보는 같지만, 경험은 다르게</span>
            </div>
            <span className="tg-shead-deco">他路</span>
          </div>
          <div className="tg-2col">
            <p className="tg-story-body">
              SNS는 같은 유행을 전국에 동시에 보여주지만,<br />
              실제 <strong>경험할 수 있는 조건</strong>은 지역마다 다릅니다.<br /><br />
              딴길은 멀리 있는 유행에 끌린 감각을,<br />
              지금 있는 곳에서 경험할 수 있는 <strong>로컬 문화</strong>로 번역해드립니다.
            </p>
            <p className="tg-story-quote">
              "정보는 동시에 도착하지만,<br />
              경험은 지역마다 다르게 도착합니다."
            </p>
          </div>
        </section>

        {/* 메뉴 (삼청각 공연·전시 카드 오마주 → 사진형 메뉴 카드) */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">오늘의 길</span>
              <span className="tg-shead-title">딴길의 입구</span>
            </div>
            <span className="tg-shead-deco tg-shead-deco--accent">三 路</span>
          </div>

          <div className="tg-cards-3">
            <Link href="/find" className="tg-menu-card">
              <div className="tg-menu-photo tg-menu-photo--a"><span>🧭</span></div>
              <div className="tg-menu-body">
                <div className="tg-menu-eyebrow">Discover</div>
                <div className="tg-menu-title">딴길 찾기</div>
                <div className="tg-menu-desc">유행에 끌린 감각을 지역 문화로 번역</div>
              </div>
              <span className="tg-menu-arrow">›</span>
            </Link>

            <Link href="/my-tangil" className="tg-menu-card">
              <div className="tg-menu-photo tg-menu-photo--b"><span>🗂️</span></div>
              <div className="tg-menu-body">
                <div className="tg-menu-eyebrow">Drawer</div>
                <div className="tg-menu-title">나의 딴길 서랍</div>
                <div className="tg-menu-desc">내가 저장한 딴길 모아보기</div>
              </div>
              <span className="tg-menu-arrow">›</span>
            </Link>

            <Link href="/others" className="tg-menu-card">
              <div className="tg-menu-photo tg-menu-photo--c"><span>🌏</span></div>
              <div className="tg-menu-body">
                <div className="tg-menu-eyebrow">Community</div>
                <div className="tg-menu-title">다른 사람들의 딴길</div>
                <div className="tg-menu-desc">지역·장르별로 딴길 탐색</div>
              </div>
              <span className="tg-menu-arrow">›</span>
            </Link>
          </div>
        </section>

        {/* CTA — 삼청각 다크 배너 오마주 */}
        <section>
          <div className="tg-cta">
            <div className="tg-cta-eyebrow">Tangil Local</div>
            <div className="tg-cta-title">지금 있는 곳에서, 색다른 길로</div>
            <Link href="/find" className="tg-cta-btn">
              📷 딴길 찾으러 가기
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
