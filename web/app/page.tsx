'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('tangil_user')
    if (!raw) { router.replace('/register'); return }
    const u = JSON.parse(raw)
    setUserName(u.name ?? null)
  }, [router])

  if (!userName) return null

  return (
    <div className="hp-page">

      {/* ── 네비게이션 ── */}
      <nav className="hp-nav">
        <div className="hp-nav-logo">
          <span>🧭</span>딴길
        </div>
        <div className="hp-nav-links">
          <Link href="/"          className="hp-nav-link hp-nav-link-active">홈</Link>
          <Link href="/find"      className="hp-nav-link">딴길 찾기</Link>
          <Link href="/my-tangil" className="hp-nav-link">나의 서랍</Link>
          <Link href="/others"    className="hp-nav-link">커뮤니티</Link>
        </div>
        <Link href="/find" className="hp-nav-cta">탐색 시작하기 →</Link>
      </nav>

      {/* ── 히어로 ── */}
      <section className="hp-hero">

        {/* 왼쪽: 헤드카피 */}
        <div className="hp-hero-left">
          <div className="hp-chip">
            <span className="hp-chip-dot" />
            AI 문화 큐레이션
          </div>

          <h1 className="hp-hero-title">
            오늘의 딴길을<br />
            <span className="hp-hero-em">🧭 발견</span>해보세요
          </h1>

          <p className="hp-hero-sub">
            안녕하세요, <strong>{userName}</strong>님!<br />
            나만의 취향 기반 색다른 문화 경험을 AI가 큐레이션해드려요.
          </p>

          {/* 퀵 필터 바 */}
          <div className="hp-filter">
            <div className="hp-filter-cell">
              <span className="hp-filter-lbl">장르</span>
              <span className="hp-filter-val">전체 장르 ▾</span>
            </div>
            <div className="hp-filter-sep" />
            <div className="hp-filter-cell">
              <span className="hp-filter-lbl">지역</span>
              <span className="hp-filter-val">전국 어디든 ▾</span>
            </div>
            <div className="hp-filter-sep" />
            <div className="hp-filter-cell">
              <span className="hp-filter-lbl">분위기</span>
              <span className="hp-filter-val">자유 선택 ▾</span>
            </div>
            <Link href="/find" className="hp-filter-go">🔍</Link>
          </div>
        </div>

        {/* 오른쪽: 비주얼 카드 영역 */}
        <div className="hp-hero-visual">
          {/* 메인 이벤트 카드 */}
          <div className="hp-ec hp-ec-main">
            <div className="hp-ec-thumb">🎷</div>
            <div className="hp-ec-body">
              <span className="hp-ec-badge">NEW</span>
              <div className="hp-ec-title">재즈의 밤 in 홍대</div>
              <div className="hp-ec-meta">📍 클럽 에반스, 서울</div>
              <div className="hp-ec-foot">
                <span className="hp-ec-price">20,000원</span>
                <Link href="/find" className="hp-ec-btn">탐색하기</Link>
              </div>
            </div>
          </div>

          {/* 보조 카드 */}
          <div className="hp-ec hp-ec-sm hp-ec-left">
            <div className="hp-ec-sm-thumb">🌿</div>
            <div>
              <div className="hp-ec-sm-title">제주 현대미술관</div>
              <div className="hp-ec-sm-meta">📍 제주 · 5,000원</div>
            </div>
          </div>
          <div className="hp-ec hp-ec-sm hp-ec-right">
            <div className="hp-ec-sm-thumb hp-ec-sm-thumb-b">🎭</div>
            <div>
              <div className="hp-ec-sm-title">부산 국제 연극제</div>
              <div className="hp-ec-sm-meta">📍 부산 · 20,000원</div>
            </div>
          </div>

          {/* 지도 도트 */}
          <div className="hp-dot" style={{ top: '18%', left: '14%' }}>🎵</div>
          <div className="hp-dot" style={{ top: '28%', right: '12%' }}>🖼️</div>
          <div className="hp-dot" style={{ bottom: '34%', left: '42%' }}>🌿</div>
          <div className="hp-dot-count">20+</div>
        </div>
      </section>

      {/* ── 통계 바 ── */}
      <div className="hp-stats">
        {[
          { num: '200+',   lbl: '문화 공간' },
          { num: '1,200+', lbl: '활성 사용자' },
          { num: '8,500+', lbl: '저장된 딴길' },
          { num: '94%',    lbl: '추천 만족도' },
        ].map((s, i) => (
          <div key={s.lbl} className="hp-stats-item">
            {i > 0 && <div className="hp-stats-sep" />}
            <div className="hp-stat">
              <span className="hp-stat-num">{s.num}</span>
              <span className="hp-stat-lbl">{s.lbl}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 피처 섹션 ── */}
      <section className="hp-feature">

        {/* 왼쪽 */}
        <div className="hp-feat-left">
          <div className="hp-feat-chip">✦ 딴길을 선택해야 하는 이유</div>
          <h2 className="hp-feat-title">
            취향에 딱 맞는<br />문화 경험, AI가<br />찾아드려요
          </h2>
          <p className="hp-feat-desc">
            수백 개의 문화 공간을 분석하고, 내 취향과 가장 잘 맞는 색다른 경험을 AI가 큐레이션합니다. 나만의 딴길을 지금 시작해보세요.
          </p>
          <Link href="/find" className="hp-feat-btn">나만의 딴길 탐색하기 →</Link>
        </div>

        {/* 오른쪽: 피처 카드 그리드 */}
        <div className="hp-feat-right">
          <div className="hp-fcard">
            <div className="hp-fcard-search">
              <span className="hp-fcard-search-icon">🔍</span>
              <span className="hp-fcard-search-txt">AI로 찾기...</span>
            </div>
            <div className="hp-fcard-title">AI 맞춤 추천</div>
            <div className="hp-fcard-sub">취향을 분석해 딱 맞는 딴길을 추천해요</div>
          </div>

          <div className="hp-fcard hp-fcard-dark">
            <div className="hp-fcard-icon">🗂️</div>
            <div className="hp-fcard-title" style={{ color: '#fff' }}>97% 만족도</div>
            <div className="hp-fcard-sub" style={{ color: 'rgba(255,255,255,.6)' }}>사용자들이 추천하는 믿을 수 있는 큐레이션</div>
          </div>

          <div className="hp-fcard hp-fcard-wide">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <div className="hp-fcard-map-dots">📍🎵🖼️🎭</div>
              <div>
                <div className="hp-fcard-title">내 주변 딴길</div>
                <div className="hp-fcard-sub">지역별 문화 경험을 탐색하세요</div>
              </div>
            </div>
            <div className="hp-fcard-img">🌸</div>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="hp-footer">
        <div className="hp-footer-logo">🧭 딴길</div>
        <div className="hp-footer-copy">© 2026 딴길 · 색다른 문화 경험을 발견하세요.</div>
      </footer>

    </div>
  )
}
