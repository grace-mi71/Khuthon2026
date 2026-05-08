'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HeroBg from '../components/HeroBg'

const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충남', '충북', '전남', '전북', '경남', '경북', '제주',
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', region: '', birthdate: '', email: '' })
  const [error, setError] = useState('')

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return }
    if (!form.region) { setError('지역을 선택해주세요.'); return }
    if (!form.birthdate) { setError('생년월일을 입력해주세요.'); return }
    if (!form.email.trim()) { setError('이메일을 입력해주세요.'); return }

    localStorage.setItem('tangil_user', JSON.stringify({
      name: form.name.trim(),
      region: form.region,
      birthdate: form.birthdate,
      email: form.email.trim(),
    }))
    router.push('/')
  }

  const today = new Date()
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="wrap">
      {/* ── 사진형 히어로 ── */}
      <HeroBg
        className="tg-hero--register"
        watermarks={[
          { char: '迎', pos: 'tl' },
          { char: '始', pos: 'br', size: '9rem', opacity: 0.05 },
        ]}
      >
        <div className="tg-hero-content">
          <div className="tg-hero-stamp">
            <span className="tg-hero-stamp-date">{dateStr}</span>
            <span className="tg-hero-stamp-sub">First Step</span>
          </div>
          <div className="tg-hero-title">
            시 작
            <small>딴길의 첫걸음</small>
          </div>
        </div>
      </HeroBg>

      {/* ── 인삿말 카드 ── */}
      <div className="tg-greet">
        <div>
          <div className="tg-greet-name">환영합니다</div>
          <div className="tg-greet-msg">먼저, 간단히 알려주세요</div>
        </div>
        <div className="tg-greet-mark">迎</div>
      </div>

      {/* ── 본문 ── */}
      <form onSubmit={handleSubmit} className="content" style={{ paddingTop: 28 }}>

        {/* 안내 섹션 */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">소개</span>
              <span className="tg-shead-title">당신의 딴길을 위해</span>
            </div>
            <span className="tg-shead-deco">入 口</span>
          </div>
          <p className="tg-story-body">
            지역과 생일은 <strong>딴길 추천 정확도</strong>를 높이는 데 사용됩니다.<br />
            언제든 마음에 드는 딴길을 서랍에 담을 수 있어요.
          </p>
        </section>

        {/* 입력 폼 — 밑줄형 인풋으로 차분하게 */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">기본 정보</span>
              <span className="tg-shead-title">네 가지만 알려주세요</span>
            </div>
            <span className="tg-shead-deco tg-shead-deco--accent">四 問</span>
          </div>

          <div className="tg-form-grid">
            <div className="tg-field">
              <label className="tg-field-label">이름</label>
              <input
                className="tg-input"
                placeholder="홍길동"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="tg-field">
              <label className="tg-field-label">사는 지역</label>
              <select
                className="tg-input"
                style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'11\' height=\'7\'%3E%3Cpath d=\'M1 1l4.5 4.5L10 1\' stroke=\'%23A0A0A0\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center' }}
                value={form.region}
                onChange={e => set('region', e.target.value)}
              >
                <option value="">지역 선택</option>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="tg-field">
              <label className="tg-field-label">생년월일</label>
              <input
                className="tg-input"
                type="date"
                value={form.birthdate}
                onChange={e => set('birthdate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="tg-field">
              <label className="tg-field-label">이메일</label>
              <input
                className="tg-input"
                type="email"
                placeholder="hello@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
        </section>

        {error && (
          <p style={{ color: '#C0392B', fontSize: '.86rem', textAlign: 'center', marginTop: -10 }}>
            {error}
          </p>
        )}

        <button type="submit" className="tg-btn-primary">
          딴길 시작하기 →
        </button>

        <p style={{ fontSize: '.75rem', color: 'var(--text-3)', textAlign: 'center', letterSpacing: '.08em', marginTop: -8 }}>
          TANGIL LOCAL · 멀리 있는 유행을 지금 여기로
        </p>
      </form>
    </div>
  )
}
