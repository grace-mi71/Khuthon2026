'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  return (
    <div className="wrap">
      {/* Hero */}
      <div className="reg-hero">
        <div className="reg-logo">딴길</div>
        <p className="reg-sub">
          색다른 문화 경험을 찾아드릴게요.<br />
          먼저 간단히 알려주세요 😊
        </p>
      </div>

      <form onSubmit={handleSubmit} className="content" style={{ paddingTop: 0 }}>
        <div className="card">
          <div className="field-group">
            {/* 이름 */}
            <div>
              <label className="field-label">이름</label>
              <input
                className="input"
                placeholder="홍길동"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                autoComplete="name"
              />
            </div>

            {/* 지역 */}
            <div>
              <label className="field-label">사는 지역</label>
              <select
                className="input"
                value={form.region}
                onChange={e => set('region', e.target.value)}
              >
                <option value="">지역 선택</option>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* 생년월일 */}
            <div>
              <label className="field-label">생년월일</label>
              <input
                className="input"
                type="date"
                value={form.birthdate}
                onChange={e => set('birthdate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="field-label">이메일</label>
              <input
                className="input"
                type="email"
                placeholder="hello@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
        </div>

        {error && (
          <p style={{ color: '#C0392B', fontSize: '.88rem', textAlign: 'center', marginTop: -12 }}>
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" style={{ marginTop: -8 }}>
          딴길 시작하기 →
        </button>
      </form>
    </div>
  )
}
