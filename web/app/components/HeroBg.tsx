'use client'

import { useEffect, useRef, ReactNode, CSSProperties } from 'react'

interface Props {
  className?: string
  watermarks?: { char: string; pos: 'tl' | 'tr' | 'bl' | 'br'; size?: string; opacity?: number }[]
  children: ReactNode
  style?: CSSProperties
}

const POS_STYLES: Record<NonNullable<Props['watermarks']>[number]['pos'], CSSProperties> = {
  tl: { left: '4vw', top: '6%' },
  tr: { right: '5vw', top: '8%' },
  bl: { left: '5vw', bottom: '8%' },
  br: { right: '5vw', bottom: '6%' },
}

/* ────────────── 아날로그 / 컬처 일러스트 SVG ────────────── */

function LpRecord() {
  return (
    <svg viewBox="0 0 220 220" fill="none" aria-hidden>
      <circle cx="110" cy="110" r="100" fill="#1c1814" />
      <circle cx="110" cy="110" r="100" stroke="#3a2e22" strokeWidth=".6" />
      {[92, 84, 76, 68, 60, 52, 44].map(r => (
        <circle key={r} cx="110" cy="110" r={r} stroke="#2a2218" strokeWidth=".4" />
      ))}
      <circle cx="110" cy="110" r="34" fill="#C25E2A" />
      <circle cx="110" cy="110" r="34" stroke="#8B4513" strokeWidth=".8" />
      <path d="M110 84 a 26 26 0 0 1 26 26" stroke="rgba(255,255,255,.18)" strokeWidth=".6" fill="none" />
      <circle cx="110" cy="110" r="14" fill="none" stroke="#1c1814" strokeWidth=".5" />
      <circle cx="110" cy="110" r="3" fill="#1c1814" />
    </svg>
  )
}

function Tonearm() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden>
      <circle cx="170" cy="38" r="14" fill="#3a2e22" />
      <circle cx="170" cy="38" r="9" fill="#5a4a36" />
      <circle cx="170" cy="38" r="3" fill="#1c1814" />
      <line x1="170" y1="38" x2="100" y2="120" stroke="#9a8a72" strokeWidth="6" strokeLinecap="round" />
      <rect x="92" y="116" width="22" height="14" rx="2" fill="#2a221a" transform="rotate(-50 100 122)" />
    </svg>
  )
}

function Cd() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden>
      <defs>
        <radialGradient id="cd-rim" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5E5B8" stopOpacity=".4" />
          <stop offset="35%" stopColor="#D4ABD8" stopOpacity=".55" />
          <stop offset="65%" stopColor="#A8D8D4" stopOpacity=".55" />
          <stop offset="100%" stopColor="#F5E5B8" stopOpacity=".4" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="#F0EBDB" />
      <circle cx="100" cy="100" r="92" fill="url(#cd-rim)" />
      <circle cx="100" cy="100" r="92" stroke="#3a2e22" strokeWidth=".6" />
      <circle cx="100" cy="100" r="30" fill="#FBF8F2" />
      <circle cx="100" cy="100" r="30" stroke="#3a2e22" strokeWidth=".5" />
      <circle cx="100" cy="100" r="10" fill="#F5F4F0" />
      <circle cx="100" cy="100" r="10" stroke="#3a2e22" strokeWidth=".4" />
      <path d="M30 60 a 70 70 0 0 1 50 -28" stroke="rgba(255,255,255,.65)" strokeWidth="1.2" fill="none" />
      <path d="M40 130 a 70 70 0 0 0 24 28" stroke="rgba(255,255,255,.45)" strokeWidth=".8" fill="none" />
    </svg>
  )
}

function Cassette() {
  return (
    <svg viewBox="0 0 280 180" fill="none" aria-hidden>
      <rect x="6" y="6" width="268" height="168" rx="8" fill="#E0B770" stroke="#7A5A28" strokeWidth="1.2" />
      <rect x="20" y="20" width="240" height="62" rx="3" fill="#FBF4E1" stroke="#7A5A28" strokeWidth=".8" />
      <line x1="30" y1="38" x2="240" y2="38" stroke="#7A5A28" strokeWidth=".5" opacity=".7" />
      <line x1="30" y1="50" x2="180" y2="50" stroke="#7A5A28" strokeWidth=".5" opacity=".7" />
      <line x1="30" y1="62" x2="200" y2="62" stroke="#7A5A28" strokeWidth=".5" opacity=".7" />
      <text x="30" y="34" fontSize="9" fill="#7A5A28" fontFamily="serif" fontStyle="italic" letterSpacing="2">TANGIL MIXTAPE — vol.01</text>
      <rect x="50" y="98" width="180" height="40" rx="3" fill="#1f1a14" />
      <g className="tg-cassette-reel" style={{ transformOrigin: '90px 118px' }}>
        <circle cx="90" cy="118" r="22" fill="#E0B770" stroke="#7A5A28" strokeWidth="1" />
        <circle cx="90" cy="118" r="6" fill="#3a2e22" />
        {[0, 60, 120, 180, 240, 300].map(a => (
          <line key={a} x1="90" y1="118" x2={90 + 18 * Math.cos(a * Math.PI / 180)} y2={118 + 18 * Math.sin(a * Math.PI / 180)} stroke="#3a2e22" strokeWidth="1.2" />
        ))}
      </g>
      <g className="tg-cassette-reel" style={{ transformOrigin: '190px 118px' }}>
        <circle cx="190" cy="118" r="22" fill="#E0B770" stroke="#7A5A28" strokeWidth="1" />
        <circle cx="190" cy="118" r="6" fill="#3a2e22" />
        {[0, 60, 120, 180, 240, 300].map(a => (
          <line key={a} x1="190" y1="118" x2={190 + 18 * Math.cos(a * Math.PI / 180)} y2={118 + 18 * Math.sin(a * Math.PI / 180)} stroke="#3a2e22" strokeWidth="1.2" />
        ))}
      </g>
      <circle cx="40" cy="160" r="4" fill="#3a2e22" />
      <circle cx="240" cy="160" r="4" fill="#3a2e22" />
      <rect x="106" y="146" width="68" height="14" rx="2" fill="#FBF4E1" stroke="#7A5A28" strokeWidth=".5" />
      <text x="140" y="156" fontSize="7" fill="#7A5A28" fontFamily="serif" textAnchor="middle" letterSpacing="1.5">SIDE A · 60min</text>
    </svg>
  )
}

function Poster() {
  return (
    <svg viewBox="0 0 180 240" fill="none" aria-hidden>
      <rect x="3" y="3" width="174" height="234" fill="#FBF4E1" stroke="#3a2e22" strokeWidth="1.2" />
      <rect x="3" y="3" width="174" height="234" fill="url(#poster-grain)" opacity=".25" />
      <rect x="14" y="20" width="152" height="4" fill="#C25E2A" />
      <text x="90" y="50" fontSize="13" fill="#1c1814" fontFamily="serif" fontWeight="700" textAnchor="middle" letterSpacing="3">LIVE CONCERT</text>
      <text x="90" y="68" fontSize="6" fill="#1c1814" fontFamily="serif" textAnchor="middle" letterSpacing="3">TANGIL LOCAL · 2026</text>
      <line x1="20" y1="76" x2="160" y2="76" stroke="#1c1814" strokeWidth=".6" />
      <circle cx="90" cy="130" r="38" fill="#C25E2A" opacity=".55" />
      <circle cx="90" cy="130" r="38" stroke="#1c1814" strokeWidth=".8" fill="none" />
      <text x="90" y="128" fontSize="20" fill="#1c1814" fontFamily="serif" fontWeight="700" textAnchor="middle">路</text>
      <text x="90" y="142" fontSize="7" fill="#1c1814" fontFamily="serif" textAnchor="middle" letterSpacing="2">LOCAL</text>
      <rect x="14" y="186" width="152" height="2" fill="#1c1814" />
      <text x="90" y="200" fontSize="6" fill="#1c1814" fontFamily="serif" textAnchor="middle" letterSpacing="1.5">딴길 · 재즈 · 국악 · 인디</text>
      <text x="90" y="214" fontSize="5" fill="#1c1814" fontFamily="serif" textAnchor="middle" letterSpacing="1" opacity=".7">SEOUL · BUSAN · JEONJU · JEJU</text>
      <rect x="14" y="222" width="152" height="2" fill="#C25E2A" />
      <defs>
        <pattern id="poster-grain" patternUnits="userSpaceOnUse" width="4" height="4">
          <circle cx="1" cy="1" r=".5" fill="#1c1814" />
        </pattern>
      </defs>
    </svg>
  )
}

function Headphones() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden>
      <path d="M30 110 C 30 50, 170 50, 170 110" stroke="#3a2e22" strokeWidth="6" strokeLinecap="round" />
      <rect x="14" y="100" width="34" height="56" rx="8" fill="#3a2e22" />
      <rect x="152" y="100" width="34" height="56" rx="8" fill="#3a2e22" />
      <rect x="20" y="108" width="22" height="42" rx="4" fill="#C25E2A" opacity=".75" />
      <rect x="158" y="108" width="22" height="42" rx="4" fill="#C25E2A" opacity=".75" />
    </svg>
  )
}

function Microphone() {
  return (
    <svg viewBox="0 0 100 200" fill="none" aria-hidden>
      <rect x="32" y="30" width="36" height="60" rx="18" fill="#3a2e22" />
      <rect x="36" y="38" width="28" height="44" rx="14" stroke="#9a8a72" strokeWidth=".8" fill="none" />
      {[46, 54, 62, 70, 78].map(y => (
        <line key={y} x1="38" y1={y} x2="62" y2={y} stroke="#9a8a72" strokeWidth=".5" />
      ))}
      <rect x="46" y="90" width="8" height="58" fill="#3a2e22" />
      <rect x="30" y="148" width="40" height="6" rx="3" fill="#3a2e22" />
      <ellipse cx="50" cy="160" rx="34" ry="8" fill="#3a2e22" />
    </svg>
  )
}

function MovieMarquee() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden>
      <rect x="20" y="20" width="160" height="100" fill="#FBF4E1" stroke="#3a2e22" strokeWidth="1.2" />
      <rect x="14" y="14" width="172" height="14" fill="#C25E2A" />
      <rect x="14" y="112" width="172" height="14" fill="#C25E2A" />
      {[24, 50, 76, 102, 128, 154, 180].map(x => (
        <circle key={`top-${x}`} cx={x} cy="10" r="3" fill="#F5E5B8" stroke="#3a2e22" strokeWidth=".4" />
      ))}
      {[24, 50, 76, 102, 128, 154, 180].map(x => (
        <circle key={`bot-${x}`} cx={x} cy="130" r="3" fill="#F5E5B8" stroke="#3a2e22" strokeWidth=".4" />
      ))}
      <text x="100" y="58" fontSize="14" fill="#1c1814" fontFamily="serif" fontWeight="800" textAnchor="middle" letterSpacing="6">CINEMA</text>
      <line x1="36" y1="68" x2="164" y2="68" stroke="#1c1814" strokeWidth=".6" />
      <text x="100" y="86" fontSize="8" fill="#1c1814" fontFamily="serif" textAnchor="middle" letterSpacing="3">NOW SHOWING</text>
      <text x="100" y="104" fontSize="9" fill="#C25E2A" fontFamily="serif" fontWeight="700" textAnchor="middle" letterSpacing="2">딴길 LOCAL</text>
      <rect x="92" y="126" width="16" height="32" fill="#3a2e22" />
    </svg>
  )
}

function Character() {
  return (
    <svg viewBox="0 0 90 150" fill="none" aria-hidden>
      <ellipse cx="45" cy="30" rx="16" ry="17" fill="#F0D4A8" stroke="#3a2e22" strokeWidth=".8" />
      <path d="M30 22 Q 45 12 60 22 Q 58 30 50 28 Q 45 22 40 28 Q 33 28 30 22 Z" fill="#3a2e22" />
      <path d="M28 26 C 28 14, 62 14, 62 26" stroke="#3a2e22" strokeWidth="2.5" fill="none" />
      <rect x="22" y="24" width="8" height="14" rx="2" fill="#C25E2A" />
      <rect x="60" y="24" width="8" height="14" rx="2" fill="#C25E2A" />
      <circle cx="40" cy="32" r="1.5" fill="#1c1814" />
      <circle cx="50" cy="32" r="1.5" fill="#1c1814" />
      <rect x="32" y="46" width="26" height="40" rx="4" fill="#6F8E5C" stroke="#3a2e22" strokeWidth=".6" />
      <line x1="34" y1="54" x2="22" y2="74" stroke="#F0D4A8" strokeWidth="6" strokeLinecap="round" />
      <line x1="56" y1="54" x2="68" y2="70" stroke="#F0D4A8" strokeWidth="6" strokeLinecap="round" />
      <rect x="62" y="66" width="14" height="9" rx="1" fill="#E0B770" stroke="#3a2e22" strokeWidth=".5" />
      <line x1="38" y1="86" x2="34" y2="118" stroke="#3a2e22" strokeWidth="6" strokeLinecap="round" />
      <line x1="52" y1="86" x2="56" y2="118" stroke="#3a2e22" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="34" cy="124" rx="7" ry="3" fill="#1c1814" />
      <ellipse cx="56" cy="124" rx="7" ry="3" fill="#1c1814" />
    </svg>
  )
}

function MusicNote() {
  return (
    <svg viewBox="0 0 60 100" fill="none" aria-hidden>
      <ellipse cx="20" cy="80" rx="14" ry="10" fill="#6F8E5C" transform="rotate(-15 20 80)" />
      <line x1="33" y1="76" x2="33" y2="14" stroke="#6F8E5C" strokeWidth="3" strokeLinecap="round" />
      <path d="M33 14 Q 56 22 50 44" stroke="#6F8E5C" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function MusicNotes() {
  return (
    <svg viewBox="0 0 110 100" fill="none" aria-hidden>
      <ellipse cx="20" cy="78" rx="11" ry="8" fill="#6F8E5C" transform="rotate(-15 20 78)" />
      <ellipse cx="80" cy="78" rx="11" ry="8" fill="#6F8E5C" transform="rotate(-15 80 78)" />
      <line x1="30" y1="74" x2="30" y2="20" stroke="#6F8E5C" strokeWidth="2.5" />
      <line x1="90" y1="74" x2="90" y2="20" stroke="#6F8E5C" strokeWidth="2.5" />
      <path d="M30 18 L 90 26" stroke="#6F8E5C" strokeWidth="6" />
      <path d="M30 32 L 90 40" stroke="#6F8E5C" strokeWidth="5" opacity=".7" />
    </svg>
  )
}

function TrebleClef() {
  return (
    <svg viewBox="0 0 80 160" fill="none" aria-hidden>
      <path d="M 40 12 C 26 14 20 32 28 46 C 36 60 50 70 50 86 C 50 108 38 120 28 116 C 18 112 18 96 30 94 C 42 92 46 102 44 112 C 42 124 36 134 28 136" stroke="#6F8E5C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="138" r="4" fill="#6F8E5C" />
    </svg>
  )
}

/* ────────────── HeroBg 본체 ────────────── */

export default function HeroBg({ className = '', watermarks = [], children, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      el.style.setProperty('--mx', String(mx))
      el.style.setProperty('--my', String(my))
    }
    const onLeave = () => {
      el.style.setProperty('--mx', '0')
      el.style.setProperty('--my', '0')
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={ref} className={`tg-hero ${className}`} style={style}>
      <div className="tg-analog-stage">
        <div className="tg-analog tg-analog--lp">
          <LpRecord />
          <Tonearm />
        </div>
        <div className="tg-analog tg-analog--cassette"><Cassette /></div>
        <div className="tg-analog tg-analog--poster"><Poster /></div>
        <div className="tg-analog tg-analog--phones"><Headphones /></div>
        <div className="tg-analog tg-analog--cd"><Cd /></div>
        <div className="tg-analog tg-analog--mic"><Microphone /></div>
        <div className="tg-analog tg-analog--marquee"><MovieMarquee /></div>
        <div className="tg-analog tg-analog--character"><Character /></div>
        <div className="tg-analog tg-analog--note1"><MusicNote /></div>
        <div className="tg-analog tg-analog--note2"><MusicNotes /></div>
        <div className="tg-analog tg-analog--clef"><TrebleClef /></div>
      </div>

      {watermarks.map((w, i) => (
        <div
          key={i}
          className="tg-hero-watermark"
          style={{
            ...POS_STYLES[w.pos],
            ...(w.size ? { fontSize: w.size } : {}),
            ...(w.opacity != null ? { opacity: w.opacity } : {}),
          }}
        >
          {w.char}
        </div>
      ))}
      {children}
    </div>
  )
}
