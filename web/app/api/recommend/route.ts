import { NextRequest, NextResponse } from "next/server";
import { searchByEmbedding } from "@/lib/search";
import { decodeEmbedding } from "@/lib/vector-client";
import { createLogger } from "@/lib/logger";
import type { TasteStep } from "@/lib/types";

const log = createLogger("api/recommend");

/**
 * POST /api/recommend
 * Body: { embedding: base64, step: 1~5, region?, exclude?: string[], limit?: number }
 *
 * 기존 GET 방식에서 POST로 변경 (base64 임베딩이 ~4KB라 URL 초과 방지).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "요청 body 필요" }, { status: 400 });
  }

  const { embedding: b64, step: stepRaw, region, exclude, limit: limitRaw } = body;

  if (!b64 || !stepRaw) {
    log.warn("파라미터 누락", { hasEmbedding: !!b64, hasStep: !!stepRaw });
    return NextResponse.json({ error: "embedding, step 파라미터 필요" }, { status: 400 });
  }

  const step = Number(stepRaw) as TasteStep;
  if (![1, 2, 3, 4, 5].includes(step)) {
    log.warn("잘못된 step 값", { step });
    return NextResponse.json({ error: "step 은 1~5 사이여야 합니다" }, { status: 400 });
  }

  let tasteVec: number[];
  try {
    tasteVec = decodeEmbedding(b64);
  } catch (e) {
    log.error("embedding 디코딩 실패", { error: String(e) });
    return NextResponse.json({ error: "embedding 디코딩 실패" }, { status: 400 });
  }

  const excludeIds: string[] = Array.isArray(exclude) ? exclude : [];
  const limit = Number(limitRaw ?? 10);

  log.info("검색 시작", { step, region, excludeCount: excludeIds.length, limit });

  let results;
  try {
    results = searchByEmbedding(tasteVec, { step, region, excludeIds, limit, trendBonus: true });
  } catch (e) {
    log.error("searchByEmbedding 실패", { error: String(e), step });
    return NextResponse.json({ error: "검색 중 오류가 발생했습니다" }, { status: 500 });
  }

  log.info("검색 완료", { step, resultCount: results.length });

  return NextResponse.json({
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
      distance: Math.round(r.distance * 1000) / 1000,
      score: Math.round(r.score * 1000) / 1000,
    })),
  });
}
