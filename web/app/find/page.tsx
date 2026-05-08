'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// ── 선택지 ──────────────────────────────────────────────────────────────────

interface Choice { id: string; emoji?: string; label: string; sublabel?: string }

const GENRE_CHOICES: Choice[] = [
  { id: 'music',       emoji: '🎵', label: '음악',      sublabel: '콘서트, 재즈, 클래식, 인디' },
  { id: 'exhibition',  emoji: '🖼️', label: '전시',      sublabel: '미술관, 갤러리, 설치미술' },
  { id: 'performance', emoji: '🎭', label: '공연·연극',  sublabel: '뮤지컬, 연극, 댄스' },
  { id: 'experience',  emoji: '🏺', label: '체험',      sublabel: '공방, 명상, 과학 탐험' },
  { id: 'outdoor',     emoji: '🌿', label: '야외·거리',  sublabel: '버스킹, 축제, 자연' },
]

const VIBE_MAP: Record<string, Choice[]> = {
  music: [
    { id: 'healing',      label: '힐링',    sublabel: '조용하고 감성적인' },
    { id: 'energetic',    label: '에너지',  sublabel: '활기차고 신나는' },
    { id: 'experimental', label: '실험적',  sublabel: '독특하고 창의적인' },
    { id: 'classic',      label: '클래식',  sublabel: '우아하고 세련된' },
    { id: 'indie',        label: '인디',    sublabel: '자유롭고 독립적인' },
  ],
  exhibition: [
    { id: 'modern',  label: '현대미술',  sublabel: '파격적이고 실험적인' },
    { id: 'media',   label: '미디어아트', sublabel: '디지털과 빛의 세계' },
    { id: 'street',  label: '거리·야외', sublabel: '일상 속 예술' },
    { id: 'history', label: '역사·전통', sublabel: '깊이 있는 이야기' },
  ],
  performance: [
    { id: 'indie_perf',       label: '인디·실험',  sublabel: '실험적인 무대' },
    { id: 'energetic_perf',   label: '에너지',     sublabel: '화려하고 역동적인' },
    { id: 'traditional_perf', label: '전통',       sublabel: '한국 고유의 정서' },
    { id: 'international',    label: '국제·다문화', sublabel: '세계의 다양성' },
  ],
  experience: [
    { id: 'craft',      label: '공예·손작업', sublabel: '직접 만드는 즐거움' },
    { id: 'meditation', label: '명상·요가',  sublabel: '내면을 찾아가는' },
    { id: 'science',    label: '과학·탐험',  sublabel: '호기심을 자극하는' },
    { id: 'nature_exp', label: '자연 체험',  sublabel: '자연과 함께하는' },
  ],
  outdoor: [
    { id: 'nature',   label: '자연·숲',    sublabel: '싱그러운 자연 속에서' },
    { id: 'city',     label: '도시·골목',  sublabel: '도심 속 새로운 발견' },
    { id: 'night',    label: '야간·야경',  sublabel: '밤의 특별한 분위기' },
    { id: 'festival', label: '축제·이벤트', sublabel: '함께 즐기는 축제' },
  ],
}

const REGION_CHOICES: Choice[] = [
  { id: '전체', label: '전국 어디든' },
  { id: '서울', label: '서울' }, { id: '경기', label: '경기' }, { id: '인천', label: '인천' },
  { id: '부산', label: '부산' }, { id: '대구', label: '대구' }, { id: '광주', label: '광주' },
  { id: '대전', label: '대전' }, { id: '강원', label: '강원' }, { id: '제주', label: '제주' },
]

const STEP_CHOICES: Choice[] = [
  { id: '1', label: '매우 유사',  sublabel: '익숙한 취향에서 살짝만' },
  { id: '2', label: '비슷한',    sublabel: '비슷하지만 새로운' },
  { id: '3', label: '새로운',    sublabel: '새로운 경험을 선사하는' },
  { id: '4', label: '도전적인',  sublabel: '기존과 꽤 다른 세계의' },
  { id: '5', label: '파격적인',  sublabel: '완전히 색다른 파격적인' },
]

// ── 결과 데이터 ──────────────────────────────────────────────────────────────

interface Result {
  id: string; emoji: string; title: string; venue: string
  genre: string; region: string; price: string; tags: string[]
  desc: string; vibes: string[]
  genreKey: string; stepMin: number; stepMax: number
}

const POOL: Result[] = [
  { id: 's1', emoji: '🎷', title: '재즈의 밤 in 홍대', venue: '클럽 에반스', genre: '재즈', region: '서울', price: '20,000원', tags: ['재즈', '라이브', '소규모'], desc: '아늑한 클럽에서 즐기는 라이브 재즈', vibes: ['힐링', '소규모', '라이브', '음악', '홍대', '감성', '밤', '인디'], genreKey: 'music', stepMin: 2, stepMax: 4 },
  { id: 's2', emoji: '🎪', title: '서울 변방 연극제', venue: '여러 소극장', genre: '연극', region: '서울', price: '15,000원', tags: ['실험', '인디', '소극장'], desc: '독립 예술가들의 실험 무대', vibes: ['실험적', '독립', '소극장', '연극', '인디', '독특한'], genreKey: 'performance', stepMin: 3, stepMax: 5 },
  { id: 's3', emoji: '🌕', title: '달빛 마당극', venue: '남산골 한옥마을', genre: '전통공연', region: '서울', price: '무료', tags: ['전통', '야외', '한옥'], desc: '한옥에서 즐기는 야외 마당극', vibes: ['전통', '야외', '한옥', '무료', '힐링', '자연', '달빛'], genreKey: 'performance', stepMin: 2, stepMax: 4 },
  { id: 's4', emoji: '🔊', title: '소음의 미학', venue: '문화비축기지', genre: '현대미술', region: '서울', price: '8,000원', tags: ['실험', '노이즈', '현대미술'], desc: '불편함이 예술이 되는 순간', vibes: ['실험적', '현대미술', '파격', '도전', '비주류'], genreKey: 'exhibition', stepMin: 4, stepMax: 5 },
  { id: 's5', emoji: '🩰', title: '비보이 × 발레', venue: '예술의전당', genre: '댄스', region: '서울', price: '30,000원', tags: ['비보이', '발레', '퓨전'], desc: '클래식과 스트리트의 만남', vibes: ['에너지', '발레', '댄스', '화려한', '공연'], genreKey: 'performance', stepMin: 1, stepMax: 3 },
  { id: 's6', emoji: '👁️', title: '어둠 속에서 듣기', venue: '국립극단 소극장 판', genre: '실험극', region: '서울', price: '22,000원', tags: ['감각', '어둠', '체험'], desc: '청각으로만 경험하는 어둠 속 연극', vibes: ['감각적', '실험적', '독특한', '체험', '신비'], genreKey: 'experience', stepMin: 4, stepMax: 5 },
  { id: 's7', emoji: '🌱', title: '식물과 인간: 공생의 노래', venue: '세종문화회관 M씨어터', genre: '퍼포먼스', region: '서울', price: '25,000원', tags: ['환경', '복합예술', '퍼포먼스'], desc: '식물과 인간이 만드는 예상 밖 공연', vibes: ['자연', '환경', '힐링', '복합예술', '감성'], genreKey: 'outdoor', stepMin: 3, stepMax: 5 },
  { id: 'g1', emoji: '🌸', title: '수원 야생화 정원 음악회', venue: '광교생태환경체험교육원', genre: '콘서트', region: '경기', price: '무료', tags: ['야외', '클래식', '자연'], desc: '꽃밭에서 즐기는 야외 클래식', vibes: ['자연', '야외', '힐링', '클래식', '꽃', '정원', '산책'], genreKey: 'music', stepMin: 1, stepMax: 3 },
  { id: 'g2', emoji: '🏺', title: '이천 도예 체험 공방', venue: '이천 도자공원', genre: '체험', region: '경기', price: '25,000원', tags: ['도예', '체험', '공방'], desc: '손으로 빚는 나만의 도자기', vibes: ['체험', '공방', '손작업', '집중', '힐링'], genreKey: 'experience', stepMin: 2, stepMax: 4 },
  { id: 'g3', emoji: '🎨', title: '안양 벽화마을 야외 전시', venue: '안양예술공원', genre: '전시', region: '경기', price: '무료', tags: ['벽화', '야외', '무료'], desc: '골목 곳곳이 갤러리인 공간', vibes: ['야외', '벽화', '산책', '무료', '감성', '미술', '거리'], genreKey: 'exhibition', stepMin: 2, stepMax: 4 },
  { id: 'i1', emoji: '🏡', title: '개항장 레트로 투어 공연', venue: '인천 개항장 문화지구', genre: '공연', region: '인천', price: '무료', tags: ['레트로', '역사', '거리공연'], desc: '근대 역사가 살아숨쉬는 골목 공연', vibes: ['레트로', '역사', '야외', '산책', '무료', '골목', '도시'], genreKey: 'outdoor', stepMin: 2, stepMax: 4 },
  { id: 'b1', emoji: '🌊', title: '감천문화마을 미디어아트전', venue: '감천문화마을', genre: '전시', region: '부산', price: '5,000원', tags: ['미디어아트', '마을', '야외'], desc: '형형색색 마을에 펼쳐진 빛의 예술', vibes: ['미디어아트', '야외', '컬러풀', '감성', '야경'], genreKey: 'exhibition', stepMin: 2, stepMax: 4 },
  { id: 'b2', emoji: '🎭', title: '부산 국제 연극제', venue: '부산문화회관', genre: '연극', region: '부산', price: '20,000원', tags: ['국제', '연극', '다양성'], desc: '세계 각국 작품을 한자리에서', vibes: ['국제', '연극', '다양성', '공연', '문화'], genreKey: 'performance', stepMin: 2, stepMax: 4 },
  { id: 'b3', emoji: '🌅', title: '영화의전당 야외 영화제', venue: '영화의전당', genre: '영화', region: '부산', price: '무료', tags: ['야외', '독립영화', '저녁'], desc: '별빛 아래 즐기는 인디 영화', vibes: ['야외', '영화', '독립', '감성', '힐링', '저녁'], genreKey: 'outdoor', stepMin: 2, stepMax: 4 },
  { id: 'd1', emoji: '🏙️', title: '근대골목 스트리트 아트', venue: '중구 근대골목', genre: '전시', region: '대구', price: '무료', tags: ['거리미술', '골목', '역사'], desc: '역사와 예술이 공존하는 골목', vibes: ['골목', '레트로', '역사', '산책', '야외', '무료', '거리'], genreKey: 'exhibition', stepMin: 2, stepMax: 4 },
  { id: 'd2', emoji: '🎵', title: '대구오페라하우스 갈라 콘서트', venue: '대구오페라하우스', genre: '오페라', region: '대구', price: '30,000원', tags: ['오페라', '클래식', '웅장'], desc: '웅장한 오페라 하우스의 갈라 공연', vibes: ['오페라', '클래식', '웅장', '음악', '화려한', '공연'], genreKey: 'music', stepMin: 1, stepMax: 3 },
  { id: 'gw1', emoji: '🏛️', title: '국립아시아문화전당 특별전', venue: '국립아시아문화전당', genre: '전시', region: '광주', price: '5,000원', tags: ['현대미술', '아시아', '다문화'], desc: '아시아 예술의 다양성을 탐험', vibes: ['현대미술', '아시아', '문화', '다양성', '전시', '감성'], genreKey: 'exhibition', stepMin: 2, stepMax: 4 },
  { id: 'gw2', emoji: '🔦', title: '광주 폐공장 인디 공연', venue: '대인시장 인근', genre: '콘서트', region: '광주', price: '10,000원', tags: ['인디', '공연', '언더그라운드'], desc: '폐공장에서 열리는 언더그라운드 공연', vibes: ['인디', '힙스터', '공연', '라이브', '실험적', '독립'], genreKey: 'music', stepMin: 3, stepMax: 5 },
  { id: 'dj1', emoji: '🔭', title: '대전 사이언스 나이트', venue: '국립중앙과학관', genre: '체험', region: '대전', price: '무료', tags: ['과학', '야간', '체험'], desc: '별빛 아래 과학을 체험하는 밤', vibes: ['과학', '야간', '체험', '신기한', '무료'], genreKey: 'experience', stepMin: 1, stepMax: 3 },
  { id: 'gw3', emoji: '⛵', title: '강릉 바다 요가 & 명상', venue: '경포해변', genre: '체험', region: '강원', price: '15,000원', tags: ['요가', '명상', '바다'], desc: '파도 소리와 함께하는 바다 명상', vibes: ['요가', '명상', '바다', '힐링', '야외', '자연'], genreKey: 'experience', stepMin: 2, stepMax: 4 },
  { id: 'gw4', emoji: '🎻', title: '평창 뮤직 페스티벌', venue: '알펜시아 콘서트홀', genre: '클래식', region: '강원', price: '40,000원', tags: ['클래식', '야외', '축제'], desc: '자연 속에서 즐기는 클래식 음악 축제', vibes: ['클래식', '자연', '야외', '축제', '음악', '웅장'], genreKey: 'music', stepMin: 1, stepMax: 3 },
  { id: 'j1', emoji: '🌿', title: '제주 현대미술관 특별전', venue: '제주현대미술관', genre: '전시', region: '제주', price: '5,000원', tags: ['현대미술', '자연', '제주'], desc: '자연과 예술이 공존하는 공간', vibes: ['현대미술', '자연', '제주', '힐링', '산책', '미술'], genreKey: 'exhibition', stepMin: 2, stepMax: 4 },
  { id: 'j2', emoji: '🌋', title: '한라산 새벽 탐방 & 명상', venue: '한라산 영실 탐방로', genre: '체험', region: '제주', price: '무료', tags: ['등산', '새벽', '자연'], desc: '새벽 안개 속 한라산 명상 탐방', vibes: ['자연', '등산', '명상', '새벽', '힐링', '파격', '도전'], genreKey: 'experience', stepMin: 3, stepMax: 5 },
]

const VIBE_KEYWORDS: Record<string, string[]> = {
  healing: ['힐링', '조용한', '자연', '감성', '명상'],
  energetic: ['에너지', '화려한', '활기', '라이브', '공연'],
  experimental: ['실험적', '독특한', '파격', '비주류', '도전'],
  classic: ['클래식', '우아한', '웅장'],
  indie: ['인디', '독립', '라이브', '소규모'],
  modern: ['현대미술', '실험적', '파격'],
  media: ['미디어아트', '미디어', '빛'],
  street: ['거리', '벽화', '골목', '야외'],
  history: ['역사', '레트로', '전통'],
  indie_perf: ['인디', '실험적', '독립'],
  energetic_perf: ['에너지', '화려한', '댄스'],
  traditional_perf: ['전통', '한옥', '국악'],
  international: ['국제', '다문화', '다양성'],
  craft: ['체험', '손작업', '공방'],
  meditation: ['명상', '요가', '힐링', '조용한'],
  science: ['과학', '신기한', '체험'],
  nature_exp: ['자연', '야외', '숲'],
  nature: ['자연', '야외', '숲', '산책'],
  city: ['도시', '골목', '거리'],
  night: ['야간', '야경', '밤'],
  festival: ['축제', '이벤트', '야외'],
}

function getResults(genreId: string, vibeId: string, region: string, step: number): Result[] {
  const kws = VIBE_KEYWORDS[vibeId] ?? []
  let pool = [...POOL]
  const byGenre = pool.filter(r => r.genreKey === genreId)
  if (byGenre.length >= 2) pool = byGenre
  if (region !== '전체') {
    const byRegion = pool.filter(r => r.region === region)
    if (byRegion.length > 0) pool = byRegion
  }
  return pool
    .map(r => {
      let score = (step >= r.stepMin && step <= r.stepMax)
        ? 10
        : Math.max(0, 6 - Math.abs(step - (r.stepMin + r.stepMax) / 2) * 2)
      score += kws.filter(kw => r.vibes.some(v => v.includes(kw)) || r.tags.some(t => t.includes(kw))).length * 3
      return { r, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.r)
}

// ── 레벨 타입 ────────────────────────────────────────────────────────────────

type LevelType = 'genre' | 'vibe' | 'region' | 'step'
interface Level { type: LevelType; label: string; sublabel: string; choices: Choice[]; selected: string | null }

const LEVEL_META: Record<LevelType, { label: string; sublabel: string }> = {
  genre:   { label: '어떤 분야가 끌리나요?',        sublabel: '관심 있는 문화 분야를 골라보세요' },
  vibe:    { label: '어떤 느낌을 원하세요?',         sublabel: '분위기나 감성을 선택해주세요' },
  region:  { label: '어디서 즐기고 싶나요?',         sublabel: '지역을 선택해주세요' },
  step:    { label: '얼마나 색다른 경험을 원하세요?', sublabel: '딴길 지수를 선택해주세요' },
}

const STEP_NAMES = ['장르', '분위기', '지역', '색다름']

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

export default function FindPage() {
  const [levels, setLevels] = useState<Level[]>([
    { ...LEVEL_META.genre, type: 'genre', choices: GENRE_CHOICES, selected: null },
  ])
  const [results, setResults]   = useState<Result[] | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [saveTarget, setSaveTarget] = useState<Result | null>(null)
  const [saveVis, setSaveVis]   = useState<'public' | 'private'>('private')
  const [navSolid, setNavSolid] = useState(false)

  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (results) {
      const t = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
      return () => clearTimeout(t)
    }
  }, [results])

  const currentLevel = levels[levels.length - 1]
  const completedCount = levels.filter(l => l.selected).length

  const selectChoice = (choiceId: string) => {
    const idx = levels.length - 1
    const newLevels = levels.map((l, i) =>
      i === idx ? { ...l, selected: choiceId } : l
    )
    if (currentLevel.type === 'genre') {
      newLevels.push({ ...LEVEL_META.vibe, type: 'vibe', choices: VIBE_MAP[choiceId] ?? [], selected: null })
    } else if (currentLevel.type === 'vibe') {
      newLevels.push({ ...LEVEL_META.region, type: 'region', choices: REGION_CHOICES, selected: null })
    } else if (currentLevel.type === 'region') {
      newLevels.push({ ...LEVEL_META.step, type: 'step', choices: STEP_CHOICES, selected: null })
    } else if (currentLevel.type === 'step') {
      const genre  = newLevels.find(l => l.type === 'genre')?.selected ?? ''
      const vibe   = newLevels.find(l => l.type === 'vibe')?.selected ?? ''
      const region = newLevels.find(l => l.type === 'region')?.selected ?? '전체'
      setResults(getResults(genre, vibe, region, parseInt(choiceId)))
    }
    setLevels(newLevels)
  }

  const goBack = () => {
    if (levels.length <= 1) return
    const newLevels = levels.slice(0, -1)
    newLevels[newLevels.length - 1] = { ...newLevels[newLevels.length - 1], selected: null }
    setLevels(newLevels)
    setResults(null)
  }

  const resetTree = () => {
    setLevels([{ ...LEVEL_META.genre, type: 'genre', choices: GENRE_CHOICES, selected: null }])
    setResults(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmSave = () => {
    if (!saveTarget) return
    const saves = JSON.parse(localStorage.getItem('tangil_saves') ?? '[]')
    saves.push({
      id: Date.now().toString(), title: saveTarget.title, venue: saveTarget.venue,
      genre: saveTarget.genre, emoji: saveTarget.emoji, tags: saveTarget.tags,
      desc: saveTarget.desc, isPublic: saveVis === 'public', savedAt: new Date().toISOString(),
    })
    localStorage.setItem('tangil_saves', JSON.stringify(saves))
    setSavedIds(p => [...p, saveTarget.id])
    setSaveTarget(null)
  }

  const pathLabels = levels
    .filter(l => l.selected)
    .map(l => l.choices.find(c => c.id === l.selected)?.label ?? '')
    .filter(Boolean)

  return (
    <div className="fp-page">

      {/* ── 내비게이션 ── */}
      <nav className={`fp-nav${navSolid ? ' solid' : ''}`}>
        <Link href="/" className="fp-back">←</Link>
        {pathLabels.length > 0 && (
          <span className="fp-nav-path">{pathLabels.join(' › ')}</span>
        )}
        {results && (
          <button className="fp-nav-reset" onClick={resetTree}>↺ 다시 탐색</button>
        )}
      </nav>

      {/* ── 히어로 ── */}
      <section className="fp-hero">
        <div className="fp-hero-bg-text" aria-hidden="true">딴길</div>

        <div className="fp-hero-inner">
          <div className="fp-hero-center">

            {/* 단계 진행 표시 */}
            <div className="fp-steps">
              {STEP_NAMES.map((name, i) => (
                <div
                  key={name}
                  className={`fp-step-item${i < completedCount ? ' done' : i === completedCount ? ' active' : ''}`}
                >
                  <div className="fp-step-dot" />
                  <span className="fp-step-name">{name}</span>
                </div>
              ))}
            </div>

            {/* 메인 질문 헤딩 */}
            <h1 className="fp-hero-title">
              {!results ? currentLevel.label : '탐색 완료!'}
            </h1>

            {/* 선택 위젯 */}
            {!results ? (
              <div className="fp-widget">
                <div className="fp-widget-meta">STEP {levels.length} / 4</div>

                <div className={`fp-choices${currentLevel.choices.length > 5 ? ' fp-choices-scroll' : ' fp-choices-grid'}`}>
                  {currentLevel.choices.map(choice => (
                    <button
                      key={choice.id}
                      className={`fp-choice${currentLevel.selected === choice.id ? ' selected' : ''}`}
                      onClick={() => selectChoice(choice.id)}
                    >
                      {choice.emoji && <span className="fp-choice-emoji">{choice.emoji}</span>}
                      <span className="fp-choice-label">{choice.label}</span>
                      {choice.sublabel && <span className="fp-choice-sub">{choice.sublabel}</span>}
                    </button>
                  ))}
                </div>

                {levels.length > 1 && (
                  <button className="fp-widget-back" onClick={goBack}>← 이전 단계</button>
                )}
              </div>
            ) : (
              <div className="fp-widget fp-widget-done">
                <div className="fp-done-sub">아래에서 추천 딴길을 확인하세요</div>
                <div className="fp-done-path">{pathLabels.join(' › ')}</div>
                <div className="fp-done-scroll">↓</div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── 결과 섹션 ── */}
      {results && (
        <section className="fp-results" ref={resultsRef}>
          <div className="fp-results-hd">
            <span className="fp-results-tag">추천 결과</span>
            <h2 className="fp-results-title">딴길 추천 결과</h2>
            <p className="fp-results-sub">선택한 취향에 딱 맞는 문화 경험이에요</p>
          </div>

          <div className="fp-card-grid">
            {results.map(r => (
              <div key={r.id} className="fp-card">
                <div className="fp-card-visual">
                  <span className="fp-card-emoji">{r.emoji}</span>
                  <button
                    className={`fp-card-save${savedIds.includes(r.id) ? ' saved' : ''}`}
                    onClick={() => { setSaveTarget(r); setSaveVis('private') }}
                    disabled={savedIds.includes(r.id)}
                  >
                    {savedIds.includes(r.id) ? '✓' : '↗'}
                  </button>
                </div>
                <div className="fp-card-body">
                  <span className="fp-card-genre">{r.genre}</span>
                  <div className="fp-card-title">{r.title}</div>
                  <div className="fp-card-venue">{r.venue}</div>
                  <div className="fp-card-price">{r.price}</div>
                  <div className="fp-card-tags">
                    {r.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="fp-card-tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="fp-results-foot">
            <button className="fp-restart-btn" onClick={resetTree}>↺ 다시 탐색하기</button>
          </div>
        </section>
      )}

      {/* ── 저장 바텀시트 ── */}
      {saveTarget && (
        <div className="overlay" onClick={() => setSaveTarget(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">나의 딴길 서랍에 넣기</div>
            <div className="sheet-desc"><strong>{saveTarget.title}</strong>을(를) 어떻게 저장할까요?</div>
            <div className={`save-opt ${saveVis === 'private' ? 'on' : ''}`} onClick={() => setSaveVis('private')}>
              <span className="save-opt-icon">🔒</span>
              <div><div className="save-opt-title">비공개</div><div className="save-opt-desc">나만 볼 수 있어요</div></div>
            </div>
            <div className={`save-opt ${saveVis === 'public' ? 'on' : ''}`} onClick={() => setSaveVis('public')}>
              <span className="save-opt-icon">🌍</span>
              <div><div className="save-opt-title">전체 공개</div><div className="save-opt-desc">다른 사람들의 딴길에 공유돼요</div></div>
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
