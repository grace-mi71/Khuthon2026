'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
      {/* Header */}
      <div className="page-header">
        <Link href="/" className="back-btn">←</Link>
        <span className="page-header-title">나의 딴길 서랍</span>
      </div>

      <div className="content">
        {loaded && items.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🗂️</div>
            <div className="empty-title">아직 저장한 딴길이 없어요</div>
            <div className="empty-desc">딴길 찾기에서 마음에 드는 공연·전시를 담아보세요</div>
            <Link href="/find" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex', width: 'auto', padding: '12px 24px' }}>
              딴길 찾으러 가기
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '.83rem', color: 'var(--text-3)' }}>
              총 {items.length}개의 딴길이 서랍에 있어요
            </p>
            {items.slice().reverse().map(item => (
              <div key={item.id} className="my-card">
                <div className="my-card-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{item.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="my-card-title"
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      <div className="my-card-venue">{item.venue}</div>
                    </div>
                  </div>
                  <span
                    className={`badge ${item.isPublic ? 'badge-public' : 'badge-private'}`}
                    style={{ cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}
                    onClick={() => toggleVis(item.id)}
                    title="클릭해서 공개 설정 변경"
                  >
                    {item.isPublic ? '🌍 공개' : '🔒 비공개'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                  {item.tags.map(t => (
                    <span key={t} className="result-tag">{t}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span className="my-card-meta">{formatDate(item.savedAt)} 저장</span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{ fontSize: '.78rem', color: 'var(--text-3)', padding: '4px 8px', borderRadius: 'var(--r-xs)', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FFE5E5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
