'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import HeroBg from '../components/HeroBg'

// ── 상수 ──────────────────────────────────────────────────────────────────

const TRENDING = [
  { id: 't1', emoji: '🎭', title: '킹키부츠', venue: '샤롯데씨어터', genre: '뮤지컬', tags: '#화려함 #에너지', cls: 'tg-photo-img--a' },
  { id: 't2', emoji: '🎨', title: '이날치 특별공연', venue: '세종문화회관', genre: '콘서트', tags: '#국악팝 #독특함', cls: 'tg-photo-img--b' },
  { id: 't3', emoji: '🖼️', title: 'REAL DMZ PROJECT', venue: '문화역서울284', genre: '전시', tags: '#역사 #설치미술', cls: 'tg-photo-img--c' },
  { id: 't4', emoji: '🎬', title: '전주 국제영화제', venue: '전주시 일원', genre: '영화제', tags: '#독립영화 #감성', cls: 'tg-photo-img--d' },
]

const REASONS = [
  '독특한 분위기', '새로운 경험', '힐링이 필요해서',
  '감각적 자극', '문화 탐험', '혼자 즐기기 좋을 것 같아서',
  '가성비 좋아 보여서', '친구·지인 추천',
]

const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '강원', '충남', '충북', '전남', '전북', '경남', '경북', '제주']
const TRANSPORTS = ['도보', '대중교통', '자차', '자전거']
const TIMES = ['30분 이내', '1시간 이내', '2시간 이내', '상관없음']
const STEP_LABELS = ['매우 유사', '비슷한', '새로운', '도전적인', '파격적인']
const STEP_DESCS = [
  '익숙한 취향에서 살짝만 벗어난',
  '비슷하지만 새로운 느낌의',
  '새로운 경험을 선사하는',
  '기존과 꽤 다른 세계의',
  '완전히 색다른 파격적인',
]

// 결과 사진 클래스 순환
const PHOTO_CLS = ['tg-photo-img--a', 'tg-photo-img--b', 'tg-photo-img--c', 'tg-photo-img--d', 'tg-photo-img--e', 'tg-photo-img--f']

// ── 결과 데이터 ─────────────────────────────────────────────────────────────

interface Result {
  id: string; emoji: string; title: string; venue: string
  genre: string; region: string; price: string; tags: string[]
  desc: string
  vibes: string[]
  stepMin: number
  stepMax: number
}

const POOL: Result[] = [
  // ── 서울
  { id: 's1', emoji: '🎷', title: '재즈의 밤 in 홍대', venue: '클럽 에반스', genre: '재즈', region: '서울', price: '20,000원', tags: ['재즈', '라이브', '소규모'], desc: '아늑한 클럽에서 즐기는 라이브 재즈', vibes: ['아늑한', '소규모', '라이브', '음악', '홍대', '감성', '밤'], stepMin: 2, stepMax: 4 },
  { id: 's2', emoji: '🎪', title: '서울 변방 연극제', venue: '여러 소극장', genre: '연극', region: '서울', price: '15,000원', tags: ['실험', '인디', '소규모'], desc: '독립 예술가들의 실험 무대', vibes: ['실험적', '독립', '소극장', '연극', '인디', '독특한'], stepMin: 3, stepMax: 5 },
  { id: 's3', emoji: '🌕', title: '달빛 마당극', venue: '남산골 한옥마을', genre: '전통', region: '서울', price: '무료', tags: ['전통', '야외', '한옥'], desc: '한옥에서 즐기는 야외 마당극', vibes: ['전통', '야외', '한옥', '무료', '힐링', '자연', '달빛'], stepMin: 2, stepMax: 4 },
  { id: 's4', emoji: '🔊', title: '소음의 미학', venue: '문화비축기지', genre: '현대미술', region: '서울', price: '8,000원', tags: ['실험', '노이즈', '현대미술'], desc: '불편함이 예술이 되는 순간', vibes: ['실험적', '현대미술', '파격', '도전', '비주류'], stepMin: 4, stepMax: 5 },
  { id: 's5', emoji: '🩰', title: '비보이 × 발레', venue: '예술의전당', genre: '댄스', region: '서울', price: '30,000원', tags: ['비보이', '발레', '퓨전'], desc: '클래식과 스트리트의 만남', vibes: ['퓨전', '발레', '댄스', '에너지', '공연', '화려한'], stepMin: 1, stepMax: 3 },
  { id: 's6', emoji: '👁️', title: '어둠 속에서 듣기', venue: '국립극단 소극장 판', genre: '실험극', region: '서울', price: '22,000원', tags: ['감각', '어둠', '체험'], desc: '청각으로만 경험하는 어둠 속 연극', vibes: ['감각적', '실험적', '독특한', '체험', '혼자', '신비'], stepMin: 4, stepMax: 5 },
  { id: 's7', emoji: '🌱', title: '식물과 인간: 공생의 노래', venue: '세종문화회관 M씨어터', genre: '퍼포먼스', region: '서울', price: '25,000원', tags: ['환경', '복합예술', '퍼포먼스'], desc: '식물과 인간이 만드는 예상 밖 공연', vibes: ['자연', '환경', '힐링', '복합예술', '감성', '식물'], stepMin: 3, stepMax: 5 },
  // ── 경기
  { id: 'g1', emoji: '🌸', title: '수원 야생화 정원 음악회', venue: '광교생태환경체험교육원', genre: '콘서트', region: '경기', price: '무료', tags: ['야외', '클래식', '자연'], desc: '꽃밭에서 즐기는 야외 클래식', vibes: ['자연', '야외', '힐링', '클래식', '꽃', '정원', '산책'], stepMin: 1, stepMax: 3 },
  { id: 'g2', emoji: '🏺', title: '이천 도예 체험 공방', venue: '이천 도자공원', genre: '체험', region: '경기', price: '25,000원', tags: ['도예', '체험', '공방'], desc: '손으로 빚는 나만의 도자기', vibes: ['체험', '공방', '손작업', '집중', '힐링', '느린'], stepMin: 2, stepMax: 4 },
  { id: 'g3', emoji: '🎨', title: '안양 벽화마을 야외 전시', venue: '안양예술공원', genre: '전시', region: '경기', price: '무료', tags: ['벽화', '야외', '무료'], desc: '골목 곳곳이 갤러리인 공간', vibes: ['야외', '벽화', '산책', '무료', '감성', '미술'], stepMin: 2, stepMax: 4 },
  // ── 인천
  { id: 'i1', emoji: '🏡', title: '개항장 레트로 투어 공연', venue: '인천 개항장 문화지구', genre: '공연', region: '인천', price: '무료', tags: ['레트로', '역사', '거리공연'], desc: '근대 역사가 살아숨쉬는 골목 공연', vibes: ['레트로', '역사', '야외', '산책', '무료', '골목'], stepMin: 2, stepMax: 4 },
  { id: 'i2', emoji: '⚓', title: '차이나타운 거리 공연', venue: '인천 차이나타운', genre: '버스킹', region: '인천', price: '무료', tags: ['버스킹', '다문화', '거리'], desc: '다문화가 어우러진 거리 공연', vibes: ['다문화', '거리공연', '야외', '무료', '신기한'], stepMin: 2, stepMax: 4 },
  // ── 부산
  { id: 'b1', emoji: '🌊', title: '감천문화마을 미디어아트전', venue: '감천문화마을', genre: '전시', region: '부산', price: '5,000원', tags: ['미디어아트', '마을', '야외'], desc: '형형색색 마을에 펼쳐진 빛의 예술', vibes: ['미디어아트', '야외', '마을', '컬러풀', '감성', '야경'], stepMin: 2, stepMax: 4 },
  { id: 'b2', emoji: '🎭', title: '부산 국제 연극제', venue: '부산문화회관', genre: '연극', region: '부산', price: '20,000원', tags: ['국제', '연극', '다양성'], desc: '세계 각국 작품을 한자리에서', vibes: ['국제', '연극', '다양성', '공연', '문화'], stepMin: 2, stepMax: 4 },
  { id: 'b3', emoji: '🌅', title: '영화의전당 야외 영화제', venue: '영화의전당', genre: '영화', region: '부산', price: '무료', tags: ['야외', '독립영화', '저녁'], desc: '별빛 아래 즐기는 인디 영화', vibes: ['야외', '영화', '독립', '감성', '힐링', '별빛', '저녁'], stepMin: 2, stepMax: 4 },
  // ── 대구
  { id: 'd1', emoji: '🏙️', title: '근대골목 스트리트 아트', venue: '중구 근대골목', genre: '전시', region: '대구', price: '무료', tags: ['거리미술', '골목', '역사'], desc: '역사와 예술이 공존하는 골목', vibes: ['골목', '레트로', '역사', '산책', '야외', '무료', '미술'], stepMin: 2, stepMax: 4 },
  { id: 'd2', emoji: '🎵', title: '대구오페라하우스 갈라 콘서트', venue: '대구오페라하우스', genre: '오페라', region: '대구', price: '30,000원', tags: ['오페라', '클래식', '웅장'], desc: '웅장한 오페라 하우스의 갈라 공연', vibes: ['오페라', '클래식', '웅장', '음악', '화려한', '공연'], stepMin: 1, stepMax: 3 },
  // ── 광주
  { id: 'gw1', emoji: '🏛️', title: '국립아시아문화전당 특별전', venue: '국립아시아문화전당', genre: '전시', region: '광주', price: '5,000원', tags: ['현대미술', '아시아', '다문화'], desc: '아시아 예술의 다양성을 탐험', vibes: ['현대미술', '아시아', '문화', '다양성', '전시', '감성'], stepMin: 2, stepMax: 4 },
  { id: 'gw2', emoji: '🔦', title: '광주 폐공장 인디 공연', venue: '대인시장 인근', genre: '콘서트', region: '광주', price: '10,000원', tags: ['인디', '공연', '언더그라운드'], desc: '폐공장에서 열리는 언더그라운드 공연', vibes: ['인디', '힙스터', '공연', '라이브', '실험적', '독립'], stepMin: 3, stepMax: 5 },
  // ── 대전
  { id: 'dj1', emoji: '🔭', title: '대전 사이언스 나이트', venue: '국립중앙과학관', genre: '체험', region: '대전', price: '무료', tags: ['과학', '야간', '체험'], desc: '별빛 아래 과학을 체험하는 밤', vibes: ['과학', '야간', '체험', '신기한', '무료', '별빛'], stepMin: 1, stepMax: 3 },
  { id: 'dj2', emoji: '🌳', title: '한밭수목원 새벽 숲 명상', venue: '한밭수목원', genre: '체험', region: '대전', price: '무료', tags: ['자연', '명상', '야외'], desc: '새벽 숲에서 이루어지는 명상 체험', vibes: ['자연', '명상', '야외', '힐링', '새벽', '숲', '조용한'], stepMin: 3, stepMax: 5 },
  // ── 강원
  { id: 'gw3', emoji: '⛵', title: '강릉 바다 요가 & 명상', venue: '경포해변', genre: '체험', region: '강원', price: '15,000원', tags: ['요가', '명상', '바다'], desc: '파도 소리와 함께하는 바다 명상', vibes: ['요가', '명상', '바다', '힐링', '야외', '자연', '파도'], stepMin: 2, stepMax: 4 },
  { id: 'gw4', emoji: '🎻', title: '평창 뮤직 페스티벌', venue: '알펜시아 콘서트홀', genre: '클래식', region: '강원', price: '40,000원', tags: ['클래식', '야외', '축제'], desc: '자연 속에서 즐기는 클래식 음악 축제', vibes: ['클래식', '자연', '야외', '축제', '음악', '웅장'], stepMin: 1, stepMax: 3 },
  // ── 전라북도
  { id: 'jb1', emoji: '🎶', title: '전주 국악 소리 축제', venue: '전주 한옥마을', genre: '국악', region: '전라북도', price: '무료', tags: ['국악', '전통', '한옥'], desc: '한옥마을에 울려퍼지는 우리 소리', vibes: ['국악', '전통', '한옥', '소리', '무료', '힐링', '조용한'], stepMin: 2, stepMax: 4 },
  // ── 경상북도
  { id: 'gb1', emoji: '🏯', title: '경주 야간 역사 투어', venue: '첨성대 일대', genre: '체험', region: '경상북도', price: '10,000원', tags: ['역사', '야간', '야경'], desc: '달빛에 빛나는 천년 고도의 야경', vibes: ['역사', '야간', '야경', '산책', '전통', '신비'], stepMin: 1, stepMax: 3 },
  // ── 제주
  { id: 'j1', emoji: '🌿', title: '제주 현대미술관 특별전', venue: '제주현대미술관', genre: '전시', region: '제주', price: '5,000원', tags: ['현대미술', '자연', '제주'], desc: '자연과 예술이 공존하는 공간', vibes: ['현대미술', '자연', '제주', '힐링', '산책', '미술'], stepMin: 2, stepMax: 4 },
  { id: 'j2', emoji: '🌋', title: '한라산 새벽 탐방 & 명상', venue: '한라산 영실 탐방로', genre: '체험', region: '제주', price: '무료', tags: ['등산', '새벽', '자연'], desc: '새벽 안개 속 한라산 명상 탐방', vibes: ['자연', '등산', '명상', '새벽', '힐링', '파격', '도전'], stepMin: 3, stepMax: 5 },
]

// ── 추천 로직 ────────────────────────────────────────────────────────────────

function getResults(step: number, region: string, interest: string, reasons: string[]): Result[] {
  const keywords = [
    ...interest.toLowerCase().split(/[\s,·]+/).filter(w => w.length >= 2),
    ...reasons.flatMap(r => r.toLowerCase().split(/[\s,]+/)),
  ]

  let pool = [...POOL]

  if (region !== '전체') {
    const regional = pool.filter(r => r.region === region)
    if (regional.length > 0) pool = regional
  }

  const scored = pool.map(r => {
    let score = 0

    if (step >= r.stepMin && step <= r.stepMax) {
      score += 10
    } else {
      const mid = (r.stepMin + r.stepMax) / 2
      score += Math.max(0, 6 - Math.abs(step - mid) * 2)
    }

    if (keywords.length > 0) {
      score += keywords.filter(kw =>
        r.vibes.some(v => v.includes(kw)) ||
        r.tags.some(t => t.toLowerCase().includes(kw)) ||
        r.title.toLowerCase().includes(kw) ||
        r.genre.toLowerCase().includes(kw) ||
        r.venue.toLowerCase().includes(kw)
      ).length * 3
    }

    return { r, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 4).map(s => s.r)
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

export default function FindPage() {
  const [interest, setInterest] = useState('')
  const [reasons, setReasons] = useState<string[]>([])
  const [otherReason, setOtherReason] = useState('')
  const [budget, setBudget] = useState('')
  const [region, setRegion] = useState('전체')
  const [transports, setTransports] = useState<string[]>([])
  const [time, setTime] = useState('')
  const [step, setStep] = useState(3)
  const [results, setResults] = useState<Result[] | null>(null)
  const [saveTarget, setSaveTarget] = useState<Result | null>(null)
  const [saveVis, setSaveVis] = useState<'public' | 'private'>('private')
  const [savedIds, setSavedIds] = useState<string[]>([])
  const reasonRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const showFollow = interest.trim().length > 0

  const toggleReason = (r: string) =>
    setReasons(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])

  const toggleTransport = (t: string) =>
    setTransports(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const handleRecommend = () => {
    setResults(getResults(step, region, interest, reasons))
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleSave = (result: Result) => { setSaveTarget(result); setSaveVis('private') }

  const confirmSave = () => {
    if (!saveTarget) return
    const saves = JSON.parse(localStorage.getItem('tangil_saves') ?? '[]')
    saves.push({
      id: Date.now().toString(),
      title: saveTarget.title,
      venue: saveTarget.venue,
      genre: saveTarget.genre,
      emoji: saveTarget.emoji,
      tags: saveTarget.tags,
      desc: saveTarget.desc,
      isPublic: saveVis === 'public',
      savedAt: new Date().toISOString(),
    })
    localStorage.setItem('tangil_saves', JSON.stringify(saves))
    setSavedIds(p => [...p, saveTarget.id])
    setSaveTarget(null)
  }

  return (
    <div className="wrap">
      {/* ── 사진형 히어로 ── */}
      <HeroBg
        className="tg-hero--find"
        watermarks={[
          { char: '尋', pos: 'tl' },
          { char: '路', pos: 'br', size: '9rem', opacity: 0.05 },
        ]}
      >
        <Link href="/" className="tg-back">←</Link>
        <div className="tg-hero-content">
          <div className="tg-hero-stamp">
            <span className="tg-hero-stamp-date">Discover</span>
            <span className="tg-hero-stamp-sub">Local Culture</span>
          </div>
          <div className="tg-hero-title">
            딴길 찾기
            <small>유행을 지금 여기로</small>
          </div>
        </div>
      </HeroBg>

      <div className="content" style={{ paddingTop: 28 }}>

        {/* ── 요즘 뜨는 딴길 ── */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">요즘 뜨는</span>
              <span className="tg-shead-title">지금 화제의 딴길</span>
            </div>
            <span className="tg-shead-deco">多 感</span>
          </div>
          <div className="h-scroll" style={{ marginTop: -4 }}>
            {TRENDING.map(t => (
              <div key={t.id} className="tg-trend-card">
                <div className={`tg-trend-img ${t.cls}`}>
                  <span>{t.emoji}</span>
                </div>
                <div className="tg-trend-body">
                  <div className="tg-trend-genre">{t.genre}</div>
                  <div className="tg-trend-title">{t.title}</div>
                  <div className="tg-trend-venue">{t.venue}</div>
                  <div className="tg-trend-tags">{t.tags}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 관심 장소 ── */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">끌림 입력</span>
              <span className="tg-shead-title">관심 있는 장소가 있나요?</span>
            </div>
            <span className="tg-shead-deco tg-shead-deco--accent">心</span>
          </div>
          <p className="section-desc" style={{ marginTop: -8 }}>찾아가고 싶은 공간·동네·장르를 자유롭게 적어주세요</p>
          <input
            className="input"
            placeholder="예) 홍대 소극장, 바닷가, 클래식 공연..."
            value={interest}
            onChange={e => setInterest(e.target.value)}
          />
        </section>

        {/* ── 끌린 이유 ── */}
        {showFollow && (
          <section ref={reasonRef}>
            <div className="tg-shead">
              <div className="tg-shead-left">
                <span className="tg-eyebrow">끌림 분석</span>
                <span className="tg-shead-title">어떤 점에 끌리셨나요?</span>
              </div>
              <span className="tg-shead-deco">感</span>
            </div>
            <div className="chip-grid">
              {REASONS.map(r => (
                <button
                  key={r}
                  className={`chip ${reasons.includes(r) ? 'on' : ''}`}
                  onClick={() => toggleReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <textarea
                className="input"
                placeholder="기타 이유가 있다면 자유롭게 (선택)"
                value={otherReason}
                onChange={e => setOtherReason(e.target.value)}
              />
            </div>
          </section>
        )}

        {/* ── 조건 설정 ── */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">지금 조건</span>
              <span className="tg-shead-title">어디서, 얼마로?</span>
            </div>
            <span className="tg-shead-deco">地 時</span>
          </div>

          <div className="field-group">
            <div>
              <label className="field-label">예산</label>
              <select className="input" value={budget} onChange={e => setBudget(e.target.value)}>
                <option value="">상관없음</option>
                <option value="free">무료</option>
                <option value="10000">1만원 이하</option>
                <option value="30000">3만원 이하</option>
                <option value="50000">5만원 이하</option>
                <option value="over">5만원 이상</option>
              </select>
            </div>

            <div>
              <label className="field-label">지역</label>
              <select className="input" value={region} onChange={e => setRegion(e.target.value)}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="field-label">이동수단 (복수 선택)</label>
              <div className="chip-grid">
                {TRANSPORTS.map(t => (
                  <button
                    key={t}
                    className={`chip ${transports.includes(t) ? 'on' : ''}`}
                    onClick={() => toggleTransport(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">이동 가능 시간</label>
              <div className="chip-grid">
                {TIMES.map(t => (
                  <button
                    key={t}
                    className={`chip ${time === t ? 'on' : ''}`}
                    onClick={() => setTime(prev => prev === t ? '' : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 딴길 지수 ── */}
        <section>
          <div className="tg-shead">
            <div className="tg-shead-left">
              <span className="tg-eyebrow">딴길 지수</span>
              <span className="tg-shead-title">얼마나 색다른 경험을?</span>
            </div>
            <span className="tg-shead-deco tg-shead-deco--accent">度</span>
          </div>

          <div className="tg-step">
            <div className="tg-step-display">
              <div className="tg-step-meter">
                {[1, 2, 3, 4, 5].map(i => (
                  <span
                    key={i}
                    className={`tg-step-pip ${i <= step ? 'on' : ''} ${i === step ? 'now' : ''}`}
                  />
                ))}
              </div>
              <div className="tg-step-main">{STEP_LABELS[step - 1]} 딴길</div>
              <div className="tg-step-sub">{STEP_DESCS[step - 1]} 경험을 추천드려요</div>
            </div>

            <div className="tg-step-track">
              <input
                type="range"
                className="tg-step-slider"
                style={{ ['--progress' as string]: `${((step - 1) / 4) * 100}%` }}
                min={1}
                max={5}
                step={1}
                value={step}
                onChange={e => setStep(Number(e.target.value))}
              />
            </div>

            <div className="tg-step-labels">
              {STEP_LABELS.map((l, i) => (
                <button
                  type="button"
                  key={l}
                  className={`tg-step-label ${step === i + 1 ? 'on' : ''}`}
                  onClick={() => setStep(i + 1)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── 추천받기 ── */}
        <button className="tg-btn-primary" onClick={handleRecommend}>
          ✨ 딴길 추천받기
        </button>

        {/* ── 추천 결과 — 사진형 카드 ── */}
        {results && (
          <section ref={resultRef}>
            <div className="tg-shead">
              <div className="tg-shead-left">
                <span className="tg-eyebrow">추천 결과</span>
                <span className="tg-shead-title">
                  {interest ? `"${interest}" 느낌의 딴길` : '이런 딴길 어떠세요?'}
                </span>
              </div>
              <span className="tg-shead-deco tg-shead-deco--accent">薦</span>
            </div>
            {region !== '전체' && (
              <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginBottom: 14, letterSpacing: '.05em' }}>
                ◦ {region} 내 추천
              </p>
            )}
            <div className="tg-cards-4">
              {results.map((r, i) => (
                <div key={r.id} className="tg-photo-card">
                  <div className={`tg-photo-img ${PHOTO_CLS[i % PHOTO_CLS.length]}`}>
                    <span>{r.emoji}</span>
                  </div>
                  <div className="tg-photo-body">
                    <div className="tg-photo-genre">{r.genre}</div>
                    <div className="tg-photo-title">{r.title}</div>
                    <div className="tg-photo-venue">{r.venue}</div>
                    <div className="tg-photo-tag">{r.price}</div>
                    <div className="result-tags">
                      {r.tags.map(t => <span key={t} className="result-tag">{t}</span>)}
                    </div>
                    <button
                      className="result-save-btn"
                      onClick={() => handleSave(r)}
                      disabled={savedIds.includes(r.id)}
                    >
                      {savedIds.includes(r.id) ? '✓ 저장됨' : '+ 나의 딴길에 넣기'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── 저장 바텀시트 ── */}
      {saveTarget && (
        <div className="overlay" onClick={() => setSaveTarget(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">나의 딴길 서랍에 넣기</div>
            <div className="sheet-desc">
              <strong>{saveTarget.title}</strong>을(를) 어떻게 저장할까요?
            </div>
            <div className={`save-opt ${saveVis === 'private' ? 'on' : ''}`} onClick={() => setSaveVis('private')}>
              <span className="save-opt-icon">🔒</span>
              <div>
                <div className="save-opt-title">비공개</div>
                <div className="save-opt-desc">나만 볼 수 있어요</div>
              </div>
            </div>
            <div className={`save-opt ${saveVis === 'public' ? 'on' : ''}`} onClick={() => setSaveVis('public')}>
              <span className="save-opt-icon">🌍</span>
              <div>
                <div className="save-opt-title">전체 공개</div>
                <div className="save-opt-desc">다른 사람들의 딴길에 공유돼요</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSaveTarget(null)}>취소</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmSave}>저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
