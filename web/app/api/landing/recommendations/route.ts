import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { searchByEmbedding } from "@/lib/search";
import { encodeEmbedding } from "@/lib/vector-client";
import type { UserProfile } from "@/lib/types";

/**
 * GET /api/landing/recommendations
 * Query params:
 *   userId  — Vercel KV 에 저장된 사용자 ID
 *   step    — (선택, 기본 2) 취향 슬라이더
 *   limit   — (선택, 기본 10)
 *
 * 랜딩 페이지에 표시할 맞춤 추천 공연을 반환합니다.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId 파라미터 필요" }, { status: 400 });
  }

  const profile = await kv.get<UserProfile>(`user:${userId}`);
  if (!profile) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  const step = Math.min(5, Math.max(1, parseInt(searchParams.get("step") ?? "2"))) as 1 | 2 | 3 | 4 | 5;
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const results = searchByEmbedding(profile.tasteEmbedding, {
    step,
    excludeIds: profile.seenIds,
    limit,
    trendBonus: true,
  });

  return NextResponse.json({
    userId,
    hobbies: profile.hobbies,
    embedding: encodeEmbedding(profile.tasteEmbedding),
    step,
    count: results.length,
    results: results.map((r) => ({
      id: r.performance.id,
      title: r.performance.title,
      genre: r.performance.genre,
      venue_name: r.performance.venue_name,
      region: r.performance.region,
      poster_url: r.performance.poster_url,
      start_date: r.performance.start_date,
      end_date: r.performance.end_date,
      price: r.performance.price,
      state: r.performance.state,
      popularity: r.performance.popularity,
      trend_score: r.performance.trend?.trend_score ?? 0,
      sensory_tags: r.performance.profile?.sensory_tags ?? [],
      score: Math.round(r.score * 1000) / 1000,
    })),
  });
}
