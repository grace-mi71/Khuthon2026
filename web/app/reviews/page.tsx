"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, MessageSquare } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getMyReviews, type MyReviewRow } from "@/lib/api-client";
import { loadSession } from "@/lib/storage";

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<MyReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s?.userId) {
      router.replace("/start");
      return;
    }
    (async () => {
      try {
        const r = await getMyReviews(s.userId);
        setReviews(r.reviews);
      } catch (e) {
        setError(e instanceof Error ? e.message : "리뷰를 불러오지 못했습니다");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 bg-brand-50 px-4 py-1.5 rounded-full mb-4">
            <Pencil size={14} /> 내가 남긴 감상
          </p>
          <h1 className="text-[36px] md:text-[48px] font-extrabold text-gray-900 leading-[1.3] mb-3">
            지금까지의 <span className="text-brand-600">취향 발자국</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg font-medium">
            리뷰 한 줄이 다음 추천을 더 정확하게 만들어요.
          </p>
        </div>

        {loading ? (
          <SkeletonList />
        ) : error ? (
          <p className="text-center text-rose-600 font-semibold bg-rose-50 px-4 py-3 rounded-full">
            {error}
          </p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl">
            <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-bold text-gray-700 mb-2">아직 작성한 리뷰가 없어요</p>
            <p className="text-gray-500 mb-8">
              관람한 공연을 찾아 한 줄 감상을 남겨보세요.
            </p>
            <Link href="/recommendations">
              <Button>추천 공연 보러가기</Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="bg-white border border-gray-100 rounded-3xl p-6 hover:border-brand-300 transition"
              >
                <Link
                  href={`/performances/${r.perf_id}`}
                  className="text-xs font-bold text-brand-600 hover:underline mb-2 inline-block"
                >
                  공연 다시 보기 →
                </Link>
                <p className="text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
                  {r.text}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {r.tags.positive.map((t) => (
                    <Chip key={`p-${t}`} variant="pos">{t}</Chip>
                  ))}
                  {r.tags.mood.map((t) => (
                    <Chip key={`m-${t}`} variant="mood">{t}</Chip>
                  ))}
                  {r.tags.negative.map((t) => (
                    <Chip key={`n-${t}`} variant="neg">{t}</Chip>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">
                  {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Footer />
    </main>
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

function SkeletonList() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="bg-gray-50 rounded-3xl p-6 animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </li>
      ))}
    </ul>
  );
}
