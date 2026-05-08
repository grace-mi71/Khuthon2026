"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PerformanceCard } from "@/components/ui/PerformanceCard";
import { TasteSlider } from "@/components/ui/TasteSlider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  getLandingRecommendations,
  searchByEmbedding,
  type RecCard,
} from "@/lib/api-client";
import type { TasteStep } from "@/lib/types";
import { STEP_LABELS } from "@/lib/types";

const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "광주", "대전", "강원", "제주"];

export default function RecommendationsPage() {
  const router = useRouter();
  const [step, setStep] = useState<TasteStep>(2);
  const [region, setRegion] = useState<string>("전체");
  const [results, setResults] = useState<RecCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [embedding, setEmbedding] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 첫 진입 — 세션 확인 후 landing recommendations 로드
  useEffect(() => {
    (async () => {
      try {
        const sessRes = await fetch("/api/auth/session");
        if (!sessRes.ok) {
          router.replace("/start");
          return;
        }
        const sess = await sessRes.json();
        const r = await getLandingRecommendations(sess.userId, 2);
        setEmbedding(r.embedding);
        setHobbies(r.hobbies);
        setResults(r.results);
      } catch (e) {
        setError(e instanceof Error ? e.message : "추천을 불러오지 못했습니다");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // 슬라이더/지역 변경 시 debounce 검색
  const refresh = useCallback(
    async (s: TasteStep, r: string, emb: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchByEmbedding(emb, s, {
          region: r === "전체" ? undefined : r,
          limit: 12,
        });
        setResults(res.results);
      } catch (e) {
        setError(e instanceof Error ? e.message : "검색 실패");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  function changeStep(s: TasteStep) {
    setStep(s);
    if (!embedding) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => refresh(s, region, embedding), 250);
  }

  function changeRegion(r: string) {
    setRegion(r);
    if (!embedding) return;
    refresh(step, r, embedding);
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-sm font-bold text-brand-600 mb-3">
            {hobbies.length > 0 ? `${hobbies.join(" · ")} 기반 취향` : "당신을 위한 추천"}
          </p>
          <h1 className="text-[36px] md:text-[48px] font-extrabold text-gray-900 leading-[1.3] mb-4">
            <span className="text-brand-600">{STEP_LABELS[step]}</span> 한 공연으로<br />
            취향을 넓혀볼까요?
          </h1>
          <p className="text-gray-500 text-base md:text-lg font-medium">
            슬라이더를 움직여 익숙함과 새로움 사이를 자유롭게 탐색해보세요.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 mb-10">
          <TasteSlider step={step} onChange={changeStep} />

          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 mr-2">
              <Filter size={14} /> 지역
            </span>
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => changeRegion(r)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold transition",
                  region === r
                    ? "bg-brand-600 text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                )}
              >
                {r}
              </button>
            ))}
            <button
              onClick={() => embedding && refresh(step, region, embedding)}
              disabled={loading}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-brand-600 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={cn(loading && "animate-spin")} />
              새로고침
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-6 text-center text-rose-600 font-semibold bg-rose-50 px-4 py-3 rounded-full">
            {error}
          </p>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : results.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-bold text-gray-700 mb-2">
              이 단계에서는 추천할 공연이 없어요.
            </p>
            <p className="text-gray-500 mb-8">슬라이더를 옮겨 다른 단계도 살펴보세요.</p>
            <Link href="/chat">
              <Button variant="subtle">취향 다시 다듬기</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((perf) => (
              <PerformanceCard key={perf.id} perf={perf} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-gray-50 rounded-3xl overflow-hidden animate-pulse">
          <div className="aspect-[2/3] bg-gray-100" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
