"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Tag, Users, Flame, Send } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  getPerformance, getReviews, submitReview,
  type ReviewRow,
} from "@/lib/api-client";
import { loadSession } from "@/lib/storage";
import type { Performance, ReviewTags } from "@/lib/types";

export default function PerformanceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [perf, setPerf] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTags, setSubmittedTags] = useState<ReviewTags | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, r] = await Promise.all([getPerformance(id), getReviews(id)]);
        setPerf(p);
        setReviews(r.reviews);
      } catch (e) {
        setError(e instanceof Error ? e.message : "공연 정보를 불러오지 못했습니다");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSubmit() {
    const text = reviewText.trim();
    if (!text || submitting) return;
    const s = loadSession();
    if (!s?.userId) {
      router.push("/start");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await submitReview(s.userId, id, text);
      setSubmittedTags(r.tags);
      setReviews((prev) => [
        {
          id: r.id,
          user_id: s.userId,
          text,
          tags: r.tags,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setReviewText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "리뷰 저장 실패");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 px-6 max-w-5xl mx-auto animate-pulse">
          <div className="h-96 bg-gray-100 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (!perf) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 px-6 max-w-3xl mx-auto text-center">
          <p className="text-2xl font-extrabold text-gray-900 mb-2">
            공연을 찾을 수 없어요
          </p>
          <p className="text-gray-500 mb-8">{error ?? "다른 공연을 찾아볼까요?"}</p>
          <Link href="/recommendations">
            <Button>추천으로 돌아가기</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isHot = (perf.trend?.trend_score ?? 0) >= 0.6;

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="pt-28 pb-16 px-6 max-w-5xl mx-auto">
        <Link
          href="/recommendations"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-brand-600 mb-6 transition"
        >
          <ArrowLeft size={14} /> 추천 목록으로
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
          <div className="relative aspect-[2/3] rounded-3xl overflow-hidden bg-gray-100 shadow-xl">
            {perf.poster_url ? (
              <Image
                src={perf.poster_url}
                alt={perf.title}
                fill
                sizes="280px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                포스터 없음
              </div>
            )}
            {isHot && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white text-xs font-extrabold rounded-full shadow">
                <Flame size={12} /> 화제
              </span>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-extrabold">
                {perf.genre}
              </span>
              <span className="text-xs font-bold text-gray-500">{perf.state}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              {perf.title}
            </h1>
            {perf.description && (
              <p className="text-gray-600 leading-relaxed line-clamp-5">
                {perf.description}
              </p>
            )}

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
              <Info icon={<MapPin size={16} />} label="장소">
                {perf.venue_name} <span className="text-gray-400">· {perf.region}</span>
              </Info>
              <Info icon={<Calendar size={16} />} label="기간">
                {perf.start_date} ~ {perf.end_date}
              </Info>
              <Info icon={<Tag size={16} />} label="가격">
                {perf.price || "정보 없음"}
              </Info>
              <Info icon={<Users size={16} />} label="관람 연령">
                {perf.age_rating || "전체관람"}
              </Info>
            </dl>

            {perf.profile?.sensory_tags && perf.profile.sensory_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {perf.profile.sensory_tags.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-700 rounded-full text-sm font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="px-6 max-w-5xl mx-auto pb-32">
        <div className="border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            관객 리뷰 <span className="text-brand-600">{reviews.length}</span>
          </h2>
          <p className="text-gray-500 mb-8">
            한 줄 감상도 좋아요. 작성하면 Claude 가 자동으로 태그를 정리해드려요.
          </p>

          <div className="bg-gray-50 rounded-3xl p-6 mb-8">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="기억에 남는 장면이나 느낌을 적어주세요"
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-100 transition resize-none text-gray-800 placeholder-gray-400 min-h-[100px]"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400">
                {submittedTags && (
                  <>
                    추출된 태그: {[...submittedTags.positive, ...submittedTags.mood].slice(0, 3).join(", ") || "—"}
                  </>
                )}
              </span>
              <Button
                onClick={onSubmit}
                disabled={!reviewText.trim() || submitting}
                className="inline-flex items-center gap-2"
              >
                <Send size={14} />
                {submitting ? "분석 중…" : "리뷰 남기기"}
              </Button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-rose-600 font-semibold">{error}</p>
            )}
          </div>

          <ul className="space-y-4">
            {reviews.length === 0 ? (
              <li className="text-center text-gray-400 py-12">
                첫 리뷰를 남겨보세요.
              </li>
            ) : (
              reviews.map((r) => <ReviewItem key={r.id} review={r} />)
            )}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Info({
  icon, label, children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-brand-600 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-bold text-gray-400 mb-0.5">{label}</dt>
        <dd className="text-sm font-semibold text-gray-800 truncate">{children}</dd>
      </div>
    </div>
  );
}

function ReviewItem({ review }: { review: ReviewRow }) {
  return (
    <li className="bg-white border border-gray-100 rounded-3xl p-5">
      <p className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
        {review.text}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {review.tags.positive.map((t) => (
          <Chip key={`p-${t}`} variant="pos">{t}</Chip>
        ))}
        {review.tags.mood.map((t) => (
          <Chip key={`m-${t}`} variant="mood">{t}</Chip>
        ))}
        {review.tags.negative.map((t) => (
          <Chip key={`n-${t}`} variant="neg">{t}</Chip>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-3">
        {new Date(review.created_at).toLocaleDateString("ko-KR")}
      </p>
    </li>
  );
}

function Chip({ variant, children }: { variant: "pos" | "mood" | "neg"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
        variant === "pos"  && "bg-emerald-50 text-emerald-700 border-emerald-100",
        variant === "mood" && "bg-brand-50    text-brand-700    border-brand-100",
        variant === "neg"  && "bg-rose-50     text-rose-700     border-rose-100"
      )}
    >
      #{children}
    </span>
  );
}
