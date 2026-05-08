import { NextRequest, NextResponse } from "next/server";
import { searchByEmbedding } from "@/lib/search";
import { decodeEmbedding } from "@/lib/vector-client";
import { createLogger } from "@/lib/logger";
import type { TasteStep } from "@/lib/types";

const log = createLogger("api/recommend");

/**
 * GET /api/recommend
 * Query params:
 *   embedding  — base64 Float32 벡터 (768차원)
 *   step       — 1~5 (취향 슬라이더)
 *   region     — (선택) 지역 필터
 *   exclude    — (선택) 쉼표로 구분된 공연 ID 목록
 *   limit      — (선택) 결과 수 (기본 10)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const b64 = searchParams.get("embedding");
  const stepRaw = searchParams.get("step");
  if (!b64 || !stepRaw) {
    log.warn("파라미터 누락", { hasEmbedding: !!b64, hasStep: !!stepRaw });
    return NextResponse.json({ error: "embedding, step 파라미터 필요" }, { status: 400 });
  }

  const step = parseInt(stepRaw) as TasteStep;
  if (![1, 2, 3, 4, 5].includes(step)) {
    log.warn("잘못된 step 값", { step });
    return NextResponse.json({ error: "step 은 1~5 사이여야 합니다" }, { status: 400 });
  }

  let tasteVec: number[];
  try {
    tasteVec = decodeEmbedding(b64);
  } catch (e) {
    log.error("embedding 디코딩 실패", { error: String(e), b64Length: b64.length });
    return NextResponse.json({ error: "embedding 디코딩 실패" }, { status: 400 });
  }

  const region = searchParams.get("region") ?? undefined;
  const excludeIds = searchParams.get("exclude")?.split(",").filter(Boolean) ?? [];
  const limit = parseInt(searchParams.get("limit") ?? "10");

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
