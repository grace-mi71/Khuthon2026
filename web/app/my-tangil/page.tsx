'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import HeroBg from '../components/HeroBg'

interface SavedItem {
  id: string
  title: string
  venue: string
  genre: string
  emoji: string
  tags: string[]
  desc: string
  isPublic: boolean
  savedAt: string
}

const THUMB_CLS = ['tg-photo-img--a', 'tg-photo-img--b', 'tg-photo-img--c', 'tg-photo-img--d', 'tg-photo-img--e', 'tg-photo-img--f']

export default function MyTangilPage() {
  const [items, setItems] = useState<SavedItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('tangil_saves') ?? '[]'
    setItems(JSON.parse(raw))
    setLoaded(true)
  }, [])

  const toggleVis = (id: string) => {
    setItems(prev => {
      const next = prev.map(item =>
        item.id === id ? { ...item, isPublic: !item.isPublic } : item
      )
      localStorage.setItem('tangil_saves', JSON.stringify(next))
      return next
    })
  }

  const deleteItem = (id: string) => {
    setItems(prev => {
      const next = prev.filter(item => item.id !== id)
      localStorage.setItem('tangil_saves', JSON.stringify(next))
      return next
    })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="wrap">
      {/* ── 사진형 히어로 ── */}
      <HeroBg
        className="tg-hero--my"
        watermarks={[
          { char: '藏', pos: 'tl' },
          { char: '收', pos: 'br', size: '9rem', opacity: 0.05 },
        ]}
      >
        <Link href="/" className="tg-back">←</Link>
        <div className="tg-hero-content">
          <div className="tg-hero-stamp">
            <span className="tg-hero-stamp-date">My Drawer</span>
            <span className="tg-hero-stamp-sub">Saved Tangil</span>
          </div>
          <div className="tg-hero-title">
            나의 서랍
            <small>저장한 딴길 모음</small>
          </div>
        </div>
      </HeroBg>

      {/* ── 카운트 카드 ── */}
      <div className="tg-greet">
        <div>
          <div className="tg-greet-name">현재 보관 중</div>
          <div className="tg-greet-msg">
            {loaded ? `${items.length}개의 딴길` : '...'}
          </div>
        </div>
        <div className="tg-greet-mark">藏</div>
      </div>

      <div className="content" style={{ paddingTop: 28 }}>

        {loaded && items.length === 0 ? (
          <div className="tg-empty">
            <div className="tg-empty-mark">空</div>
            <div className="tg-empty-title">아직 저장한 딴길이 없어요</div>
            <div className="tg-empty-desc">
              딴길 찾기에서 마음에 드는<br />공연·전시를 담아보세요
            </div>
            <Link href="/find" className="tg-btn-primary" style={{ width: 'auto', padding: '12px 28px', display: 'inline-flex', marginTop: 6 }}>
              딴길 찾으러 가기 →
            </Link>
          </div>
        ) : (
          <section>
            <div className="tg-shead">
              <div className="tg-shead-left">
                <span className="tg-eyebrow">서랍 속</span>
                <span className="tg-shead-title">담아둔 딴길</span>
              </div>
              <span className="tg-shead-deco">收 藏</span>
            </div>

            <div className="tg-cards-2">
              {items.slice().reverse().map((item, i) => (
                <div key={item.id} className="my-card" style={{ borderRadius: 6 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div className={`tg-my-thumb ${THUMB_CLS[i % THUMB_CLS.length]}`}>
                      <span>{item.emoji}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="my-card-title"
                            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                          <div className="my-card-venue">{item.venue}</div>
                        </div>
                        <span
                          className={`badge ${item.isPublic ? 'badge-public' : 'badge-private'}`}
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                          onClick={() => toggleVis(item.id)}
                          title="클릭해서 공개 설정 변경"
                        >
                          {item.isPublic ? '🌍 공개' : '🔒 비공개'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                        {item.tags.map(t => (
                          <span key={t} className="result-tag">{t}</span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                        <span className="my-card-meta" style={{ letterSpacing: '.05em' }}>
                          ◦ {formatDate(item.savedAt)} 저장
                        </span>
                        <button
                          onClick={() => deleteItem(item.id)}
                          style={{ fontSize: '.76rem', color: 'var(--text-3)', padding: '4px 10px', borderRadius: 'var(--r-xs)', transition: 'all .15s', letterSpacing: '.05em' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FFE5E5'; e.currentTarget.style.color = '#C0392B' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)' }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
