'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import HeroBg from '../components/HeroBg'

interface CommItem {
  id: string; emoji: string; title: string; venue: string
  region: string; genre: string; likes: number; tags: string[]
}

const COMMUNITY: CommItem[] = [
  { id: 'c1',  emoji: '🎭', title: '낙산공원 야외 연극제',        venue: '낙산공원',              region: '서울',   genre: '연극',    likes: 248, tags: ['야외', '무료', '공원', '야경'] },
  { id: 'c2',  emoji: '🎸', title: '홍대 거리 버스킹',           venue: '홍대 걷고싶은거리',     region: '서울',   genre: '버스킹',  likes: 312, tags: ['버스킹', '라이브', '무료'] },
  { id: 'c3',  emoji: '🎪', title: '부산 국제 연극제',           venue: '부산문화회관',           region: '부산',   genre: '연극',    likes: 189, tags: ['국제', '연극', '다양성'] },
  { id: 'c4',  emoji: '🌊', title: '해운대 모래 조각 전시',      venue: '해운대 해수욕장',        region: '부산',   genre: '전시',    likes: 421, tags: ['야외', '설치미술', '무료'] },
  { id: 'c5',  emoji: '🏯', title: '경주 야간 역사 투어',        venue: '첨성대 일대',            region: '경상북도', genre: '체험', likes: 156, tags: ['역사', '야간', '체험'] },
  { id: 'c6',  emoji: '🌿', title: '제주 현대미술관 특별전',     venue: '제주현대미술관',         region: '제주',   genre: '전시',    likes: 203, tags: ['현대미술', '자연', '제주'] },
  { id: 'c7',  emoji: '🎶', title: '전주 국악 소리 축제',        venue: '전주 한옥마을',          region: '전라북도', genre: '국악', likes: 134, tags: ['국악', '전통', '한옥'] },
  { id: 'c8',  emoji: '🔦', title: '광주 폐공장 인디 공연',      venue: '대인시장 인근',          region: '광주',   genre: '콘서트',  likes: 267, tags: ['인디', '공연', '힙스터'] },
  { id: 'c9',  emoji: '⛵', title: '강릉 바다 요가 & 명상',      venue: '경포해변',               region: '강원',   genre: '체험',    likes: 98,  tags: ['요가', '명상', '바다', '힐링'] },
  { id: 'c10', emoji: '🔭', title: '대전 사이언스 나이트',       venue: '국립중앙과학관',         region: '대전',   genre: '체험',    likes: 178, tags: ['과학', '야간', '가족'] },
  { id: 'c11', emoji: '🏡', title: '인천 차이나타운 거리 공연',  venue: '인천 차이나타운',        region: '인천',   genre: '버스킹',  likes: 145, tags: ['거리공연', '다문화'] },
  { id: 'c12', emoji: '🌸', title: '수원 야생화 정원 음악회',    venue: '광교생태환경체험교육원', region: '경기',   genre: '콘서트',  likes: 167, tags: ['자연', '야외', '클래식'] },
]

const REGION_FILTERS = ['전체', '서울', '경기', '인천', '부산', '광주', '대전', '강원', '전라북도', '경상북도', '제주']
const GENRE_FILTERS  = ['전체', '연극', '전시', '콘서트', '버스킹', '국악', '체험']

const THUMB_CLS = ['tg-photo-img--a', 'tg-photo-img--b', 'tg-photo-img--c', 'tg-photo-img--d', 'tg-photo-img--e', 'tg-photo-img--f']

export default function OthersPage() {
  const [region, setRegion] = useState('전체')
  const [genre, setGenre] = useState('전체')
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    return COMMUNITY.filter(c => {
      const matchRegion = region === '전체' || c.region === region
      const matchGenre  = genre  === '전체' || c.genre  === genre
      const q = query.trim().toLowerCase()
      const matchQuery  = !q || c.title.includes(q) || c.venue.includes(q) ||
                          c.tags.some(t => t.includes(q))
      return matchRegion && matchGenre && matchQuery
    }).sort((a, b) => b.likes - a.likes)
  }, [region, genre, query])

  const toggleLike = (id: string) =>
    setLiked(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="wrap">
      {/* ── 사진형 히어로 ── */}
      <HeroBg
        className="tg-hero--others"
        watermarks={[
          { char: '他', pos: 'tl' },
          { char: '群', pos: 'br', size: '9rem', opacity: 0.05 },
        ]}
      >
        <Link href="/" className="tg-back">←</Link>
        <div className="tg-hero-content">
          <div className="tg-hero-stamp">
            <span className="tg-hero-stamp-date">Community</span>
            <span className="tg-hero-stamp-sub">Others' Tangil</span>
          </div>
          <div className="tg-hero-title">
            다른 이의 길
            <small>지역·장르로 탐색</small>
          </div>
        </div>
      </HeroBg>

      {/* ── 카운트 카드 ── */}
      <div className="tg-greet">
        <div>
          <div className="tg-greet-name">발견된 딴길</div>
          <div className="tg-greet-msg">{filtered.length}개의 길</div>
        </div>
        <div className="tg-greet-mark">他</div>
      </div>

      <div className="content" style={{ paddingTop: 28 }}>

        {/* ── 검색 ── */}
        <section>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="input"
              placeholder="장소, 장르, 태그로 검색"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </section>

        {/* ── 필터 ── */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">필터</span>
              <span className="tg-shead-title">지역과 장르로 좁히기</span>
            </div>
            <span className="tg-shead-deco">尋</span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="tg-eyebrow" style={{ marginBottom: 8 }}>지역</div>
            <div className="filter-bar">
              {REGION_FILTERS.map(r => (
                <button
                  key={r}
                  className={`fcip ${region === r ? 'on' : ''}`}
                  onClick={() => setRegion(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="tg-eyebrow" style={{ marginBottom: 8 }}>장르</div>
            <div className="filter-bar">
              {GENRE_FILTERS.map(g => (
                <button
                  key={g}
                  className={`fcip ${genre === g ? 'on' : ''}`}
                  onClick={() => setGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 리스트 ── */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">발견된 길</span>
              <span className="tg-shead-title">사람들이 걸어본 딴길</span>
            </div>
            <span className="tg-shead-deco tg-shead-deco--accent">路</span>
          </div>

          {filtered.length === 0 ? (
            <div className="tg-empty">
              <div className="tg-empty-mark">無</div>
              <div className="tg-empty-title">검색 결과가 없어요</div>
              <div className="tg-empty-desc">다른 조건으로 검색해보세요</div>
            </div>
          ) : (
            <div className="tg-cards-2">
              {filtered.map((item, i) => (
                <div key={item.id} className="comm-card" style={{ borderRadius: 6 }}>
                  <div className="comm-row">
                    <div className={`tg-comm-thumb ${THUMB_CLS[i % THUMB_CLS.length]}`}>
                      <span>{item.emoji}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="tg-photo-genre" style={{ marginBottom: 3 }}>{item.genre}</div>
                      <div className="comm-title">{item.title}</div>
                      <div className="comm-venue">◦ {item.venue} · {item.region}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span
                          className="comm-likes"
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleLike(item.id)}
                        >
                          {liked[item.id] ? '❤️' : '🤍'} {item.likes + (liked[item.id] ? 1 : 0)}
                        </span>
                        <span style={{ fontSize: '.72rem', color: 'var(--text-3)', letterSpacing: '.05em' }}>추천</span>
                      </div>
                    </div>
                  </div>
                  <div className="comm-tags">
                    {item.tags.map(t => (
                      <span key={t} className="comm-tag">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
