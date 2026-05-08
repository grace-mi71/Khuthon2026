"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, ChevronLeft, ChevronRight, Sparkles, MapPin, Compass,
  MessageSquareHeart, Hand,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SplineCanvas } from "@/components/ui/SplineCanvas";

const SPLINE_SCENE = "https://prod.spline.design/sIv66vxoTxWPDLTB/scene.splinecode";

interface JourneyStep {
  id: number;
  tag: string;
  title: string;
  desc: string;
  detail: string;
  imgUrl: string;
}

const journeySteps: JourneyStep[] = [
  {
    id: 0,
    tag: "출발점 · 익숙한 무대",
    title: "대형 상업 뮤지컬",
    desc: "오페라의 유령, 위키드, 시카고",
    detail:
      "당신은 무대 위에서 폭발하는 에너지와 합창의 웅장함에 끌립니다.",
    imgUrl: "/journey/concert-stadium.jpg",
  },
  {
    id: 1,
    tag: "1단계 · 규모를 줄여보기",
    title: "중소극장 창작 뮤지컬",
    desc: "빈센트 반 고흐, 마타하리",
    detail:
      "위키드에서 좋았던 ‘웅장함’ 을 300석 극장에서 만나면 배우의 숨소리까지 직접 전해집니다.",
    imgUrl: "/journey/black-box-theater.jpg",
  },
  {
    id: 2,
    tag: "2단계 · 장르를 옮겨보기",
    title: "음악극 / 소극장 연극",
    desc: "음악극 〈판〉, 12인의 성난 사람들",
    detail:
      "뮤지컬에서 좋았던 ‘서사 몰입’ 을 대사와 판소리의 성량으로 새롭게 경험합니다.",
    imgUrl: "/journey/workshop.jpg",
  },
  {
    id: 3,
    tag: "3단계 · 전통과 만나기",
    title: "퓨전 국악 · 타악 공연",
    desc: "이날치 라이브, 도시의 장단",
    detail:
      "판소리와 사물놀이의 에너지가 K-POP 군무보다 더 깊게 몸을 움직이게 합니다.",
    imgUrl: "/journey/hanok-village.jpg",
  },
];

// CTA 섹션 포스터 콜라주 (이모지 대신 실제 공연 포스터로 주제 표현)
const COLLAGE_POSTERS = [
  "http://www.kopis.or.kr/upload/pfmPoster/PF_PF290658_260506_101411.jpg",
  "http://www.kopis.or.kr/upload/pfmPoster/PF_PF290650_260504_180836.gif",
  "http://www.kopis.or.kr/upload/pfmPoster/PF_PF290423_260430_104342.png",
  "http://www.kopis.or.kr/upload/pfmPoster/PF_PF290135_260427_110601.png",
  "http://www.kopis.or.kr/upload/pfmPoster/PF_PF290330_260429_104908.jpg",
];

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const handlePrev = () =>
    setCurrentStep((p) => (p === 0 ? journeySteps.length - 1 : p - 1));
  const handleNext = () =>
    setCurrentStep((p) => (p === journeySteps.length - 1 ? 0 : p + 1));

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden break-keep selection:bg-brand-100">
      <Header />

      {/* ──────────────── HERO ──────────────── */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Spline — 우측 배치 (scale 0.5, origin right) */}
        <SplineCanvas
          scene={SPLINE_SCENE}
          className="absolute inset-0 w-full h-full"
          style={{ transform: "scale(0.5)", transformOrigin: "right center" }}
        />

        {/* 텍스트 가독성 + 중앙 경계 그라디언트 */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, white 0%, white 32%, rgba(255,255,255,0.85) 42%, rgba(255,255,255,0.3) 55%, transparent 68%)",
          }}
        />

        {/* 텍스트 콘텐츠 */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-32 flex flex-col justify-center min-h-screen">
          <div className="max-w-xl space-y-9">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/90 text-brand-600 rounded-full text-sm font-bold shadow-sm border border-brand-100 backdrop-blur-sm">
              <Sparkles size={16} />
              <span>취향의 경계를 넓혀가는 공연 발견 플랫폼</span>
            </div>

            <h1 className="text-[44px] sm:text-[56px] md:text-[68px] font-extrabold leading-[1.2] tracking-tight">
              지금은 <span className="text-brand-600">취향</span>을<br />
              발견하는 중
            </h1>

            <p className="text-lg md:text-xl text-gray-600 font-medium leading-[1.7]">
              한 번의 추천이 아닌, 관객의 취향을<br className="hidden sm:block" />
              단계적으로 확장하는 여정을 설계합니다.
            </p>

            <Link
              href="/recommendations"
              className="inline-flex items-center bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 max-w-xl w-full hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition group"
            >
              <span className="flex-1 px-5 py-2 text-gray-400 text-base md:text-lg font-medium select-none truncate">
                오페라의 유령, 이날치… 좋았던 공연을 떠올려 보세요
              </span>
              <span className="bg-brand-600 text-white p-3.5 rounded-full transition transform group-hover:scale-105 shrink-0">
                <Search size={20} />
              </span>
            </Link>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/start"
                className="inline-flex items-center gap-2 bg-brand-600 text-white text-base font-bold px-7 py-3.5 rounded-full hover:bg-brand-700 transition shadow-lg"
              >
                내 취향 여정 시작하기 <ChevronRight size={18} />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 text-base font-bold px-7 py-3.5 rounded-full hover:border-brand-300 transition"
              >
                취향 탐정과 대화 →
              </Link>
            </div>
          </div>

        </div>

        {/* drag hint — section 기준 absolute, Built with Spline 워터마크 위에 고정 */}
        <div className="absolute bottom-[25vh] right-1 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-md border border-gray-100 text-xs font-bold text-gray-700 inline-flex items-center gap-2 pointer-events-none z-20">
          <Hand size={13} className="text-brand-600" />
          드래그해서 움직여보세요
        </div>
      </section>

      {/* ──────────────── PROBLEM & SOLUTION ──────────────── */}
      <section className="relative bg-slate-50 py-32 md:py-40 px-6">
        <div className="absolute inset-0 bg-spotlight pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-20 space-y-5">
            <h2 className="text-[28px] md:text-[40px] font-bold text-gray-900 leading-[1.4]">
              추천이 필요한 지금,<br />
              <span className="text-brand-600">딴길로 떠날 결심</span>만 하세요
            </h2>
            <p className="text-base md:text-lg text-gray-500 font-medium leading-[1.7]">
              유명한 공연은 다 봤고, 비주류는 낯설게 느껴지는 당신에게
            </p>
          </div>

          <div className="space-y-6 flex flex-col">
            <div className="self-start max-w-[85%] bg-white border border-gray-100 shadow-sm rounded-3xl rounded-tl-md px-7 py-5">
              <p className="text-gray-700 font-medium text-base md:text-lg leading-[1.6]">
                뮤지컬 좋아하는데, 다음에 뭘 봐야 할지 모르겠어요.
              </p>
            </div>
            <div className="self-end max-w-[85%] bg-brand-600 text-white shadow-md rounded-3xl rounded-tr-md px-7 py-5">
              <p className="font-medium text-base md:text-lg leading-[1.6]">
                무대 위에서 폭발하는 에너지의 순간에 끌리시는군요.
              </p>
            </div>
            <div className="self-start max-w-[85%] bg-white border border-gray-100 shadow-sm rounded-3xl rounded-tl-md px-7 py-5">
              <p className="text-gray-700 font-medium text-base md:text-lg leading-[1.6]">
                항상 비슷하고 뻔한 상업 공연만 보게 돼요.
              </p>
            </div>
            <div className="self-end max-w-[85%] bg-brand-50 text-brand-900 border border-brand-200/50 shadow-sm rounded-3xl rounded-tr-md px-7 py-5">
              <p className="font-medium text-base md:text-lg leading-[1.6]">
                위키드에서 좋았던 ‘웅장한 합창’을<br className="hidden md:block" />
                300석 창작 음악극에서 만나면 어떨까요?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── JOURNEY SLIDER ──────────────── */}
      <section className="relative bg-gradient-to-b from-white via-brand-50/40 to-white py-32 md:py-40 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-[28px] md:text-[40px] font-bold text-gray-900 mb-6 leading-[1.4]">
            나의 취향과<br />
            <span className="text-brand-600">자유로운 딴길</span>로 지금 떠나요
          </h2>
          <div className="w-14 h-1 bg-gray-900 mx-auto mb-20 rounded-full" />

          <div className="relative flex items-center justify-center min-h-[480px] md:min-h-[560px]">
            <button
              onClick={handlePrev}
              className="absolute left-0 md:left-8 z-20 p-4 bg-white rounded-full shadow-xl hover:bg-gray-50 hover:scale-110 transition text-gray-700 border border-gray-100"
              aria-label="이전 단계"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="relative w-[300px] h-[300px] md:w-[440px] md:h-[440px] rounded-full p-2.5 bg-gradient-to-tr from-brand-100 via-white to-brand-50 shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 border-2 border-dashed border-brand-300 rounded-full animate-[spin_60s_linear_infinite] opacity-60 pointer-events-none" />
              <div className="w-full h-full rounded-full overflow-hidden relative group bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={journeySteps[currentStep].imgUrl}
                  alt={journeySteps[currentStep].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white font-extrabold px-6 py-2.5 rounded-full shadow-lg whitespace-nowrap z-10 border-4 border-white text-xs md:text-sm">
                {journeySteps[currentStep].tag}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="absolute right-0 md:right-8 z-20 p-4 bg-white rounded-full shadow-xl hover:bg-gray-50 hover:scale-110 transition text-gray-700 border border-gray-100"
              aria-label="다음 단계"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="mt-14 max-w-2xl mx-auto space-y-4 px-4 min-h-[10rem]">
            <h3 className="text-2xl md:text-[28px] font-extrabold text-gray-900 leading-[1.4]">
              {journeySteps[currentStep].title}
            </h3>
            <p className="text-brand-600 font-bold text-base md:text-lg">
              {journeySteps[currentStep].desc}
            </p>
            <p className="text-gray-600 font-medium text-base md:text-lg leading-[1.7] break-keep">
              {journeySteps[currentStep].detail}
            </p>
          </div>

          <div className="flex justify-center gap-3 mt-10">
            {journeySteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                aria-label={`${idx + 1}단계로 이동`}
                className={`transition-all duration-300 rounded-full ${
                  currentStep === idx
                    ? "w-9 h-2.5 bg-brand-600"
                    : "w-2.5 h-2.5 bg-brand-200 hover:bg-brand-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FEATURE CARDS ──────────────── */}
      <section className="relative bg-brand-600 py-32 md:py-40 px-6 text-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-dot-pattern opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)" }}
        />
        <div className="relative max-w-7xl mx-auto">
          <h2 className="text-white text-[28px] md:text-[40px] font-bold mb-4 leading-[1.4]">
            딴길의 핵심 기술로<br className="hidden md:block" /> 이만큼 넓혀 드릴게요
          </h2>
          <p className="text-brand-100/80 text-base md:text-lg font-medium leading-[1.7] mb-20 max-w-2xl mx-auto">
            검색 엔진과 LLM 이 손잡고, 한 번에 한 축씩 취향의 경계를 옮깁니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "AI 취향 프로파일링",
                icon: <MessageSquareHeart size={32} className="text-brand-600" />,
                desc: "Claude 가 5~7턴의 대화로 감각적 취향을 심층 해석합니다.",
              },
              {
                title: "임베딩 거리 단계 추천",
                icon: <Compass size={32} className="text-brand-600" />,
                desc: "한 번에 한 축씩 낯섦을 줄이며 취향의 경계를 넓힙니다.",
              },
              {
                title: "지역 기반 매칭",
                icon: <MapPin size={32} className="text-brand-600" />,
                desc: "내 주변, 지역 사회의 숨겨진 공연을 발견합니다.",
              },
              {
                title: "딴길 시그널",
                icon: <Sparkles size={32} className="text-brand-600" />,
                desc: "새로운 수요와 중소 창작자를 데이터로 연결합니다.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 text-left shadow-xl transform hover:-translate-y-2 transition duration-300 flex flex-col items-start min-h-[240px]"
              >
                <div className="bg-brand-50 p-4 rounded-2xl mb-7">{feature.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2.5 leading-[1.4]">
                  {feature.title}
                </h3>
                <p className="text-gray-500 font-medium text-sm md:text-base leading-[1.7] break-keep">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER CTA — 포스터 콜라주 ──────────────── */}
      <section className="relative py-32 md:py-40 px-6 bg-white text-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-white to-white"
        />

        <div className="relative max-w-5xl mx-auto space-y-14 flex flex-col items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 bg-brand-50 px-4 py-1.5 rounded-full">
              <Sparkles size={14} /> 지금 시작해도 늦지 않아요
            </p>
            <h2 className="text-[28px] md:text-[40px] font-bold text-gray-900 leading-[1.5]">
              서울에 없어도, 취향은 있습니다.<br />
              누구에게나 즐거운 여정이 되도록<br className="md:hidden" />
              <span className="text-brand-600"> 딴길</span>이 안내할게요.
            </h2>
          </div>

          {/* 실제 KOPIS 포스터로 만든 콜라주 (이모지 대체) */}
          <PosterCollage />

          <Link
            href="/start"
            className="bg-brand-600 text-white text-lg md:text-xl font-bold px-10 py-5 rounded-full shadow-xl hover:shadow-brand-600/40 hover:bg-brand-700 transition transform hover:-translate-y-1 inline-flex items-center gap-3"
          >
            내 취향 여정 시작하기
            <ChevronRight size={22} />
          </Link>

          <p className="text-sm text-gray-400 leading-[1.6]">
            취미 선택 1분 · 취향 탐정 대화 3분<br className="md:hidden" /> · 첫 추천까지 5분이면 충분해요.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ──────────────── 포스터 콜라주 ────────────────
function PosterCollage() {
  // 5개의 포스터를 부채꼴/웨이브로 배치
  const layouts = [
    "rotate-[-12deg] -translate-y-2 hidden sm:block",
    "rotate-[-6deg]  translate-y-3",
    "rotate-0        -translate-y-4",
    "rotate-[6deg]   translate-y-3",
    "rotate-[12deg]  -translate-y-2 hidden sm:block",
  ];

  return (
    <div className="relative flex justify-center items-end gap-3 md:gap-5 py-8">
      {COLLAGE_POSTERS.map((src, i) => (
        <div
          key={src}
          className={`relative w-24 md:w-36 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl border-4 border-white transition transform hover:-translate-y-3 hover:rotate-0 ${layouts[i]}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
