"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { RecCard } from "@/lib/api-client";
import { Flame, MapPin } from "lucide-react";

interface Props {
  perf: RecCard;
  onClick?: () => void;
}

export function PerformanceCard({ perf, onClick }: Props) {
  const isHot = perf.trend_score >= 0.6;
  const isHidden = isHot && perf.popularity < 30;

  return (
    <Link
      href={`/performances/${perf.id}`}
      onClick={onClick}
      className="group block bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-300 hover:shadow-xl transition transform hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
        {perf.poster_url ? (
          <Image
            src={perf.poster_url}
            alt={perf.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            이미지 없음
          </div>
        )}
        {isHidden && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-extrabold rounded-full shadow">
            <Flame size={12} /> 숨겨진 보석
          </span>
        )}
        {isHot && !isHidden && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500 text-white text-xs font-extrabold rounded-full shadow">
            <Flame size={12} /> 화제
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-brand-600">
          <span className="px-2.5 py-1 bg-brand-50 rounded-full">{perf.genre}</span>
          {perf.region && (
            <span className="inline-flex items-center gap-1 text-gray-500">
              <MapPin size={12} /> {perf.region}
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
          {perf.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{perf.venue_name}</p>
        {perf.sensory_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {perf.sensory_tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-semibold",
                  "bg-gray-50 text-gray-600 border border-gray-100"
                )}
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
