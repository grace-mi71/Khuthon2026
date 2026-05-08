import { loadContents, cosineDist } from "./vector-client";
import type { Performance, SearchResult, TasteStep } from "./types";
import { STEP_RANGES } from "./types";

// UI 단축명 → 데이터 전체명 매핑
const REGION_MAP: Record<string, string> = {
  "서울": "서울특별시",
  "경기": "경기도",
  "인천": "인천광역시",
  "부산": "부산광역시",
  "대구": "대구광역시",
  "광주": "광주광역시",
  "대전": "대전광역시",
  "강원": "강원특별자치도",
  "제주": "제주특별자치도",
};

export interface SearchOptions {
  step: TasteStep;
  region?: string;           // 지역 필터 (예: "서울")
  excludeIds?: string[];     // 이미 본 공연 제외
  limit?: number;            // 결과 수 (기본 10)
  trendBonus?: boolean;      // 트렌드 보너스 적용 여부
}

/**
 * 취향 임베딩 벡터로 공연을 검색합니다.
 * step 슬라이더가 코사인 거리 범위를 결정합니다 (당근마켓 거리 반경과 동일한 개념).
 */
export function searchByEmbedding(
  tasteVec: number[],
  opts: SearchOptions
): SearchResult[] {
  const { step, region, excludeIds = [], limit = 10, trendBonus = true } = opts;
  const [minDist, maxDist] = STEP_RANGES[step];
  const excludeSet = new Set(excludeIds);
  const regionFull = region ? (REGION_MAP[region] ?? region) : undefined;

  const contents = loadContents();
  const results: SearchResult[] = [];

  for (const perf of contents) {
    if (excludeSet.has(perf.id)) continue;
    if (regionFull && perf.region !== regionFull) continue;
    if (!perf.embedding || perf.embedding.length === 0) continue;

    const dist = cosineDist(tasteVec, perf.embedding);
    if (dist < minDist || dist > maxDist) continue;

    let score = 1 - dist;  // 기본 점수: 유사도

    // 트렌드 보너스: 높은 트렌드 + 낮은 popularity → hidden gem
    if (trendBonus && perf.trend) {
      if (perf.trend.trend_score > 0.6 && perf.popularity < 100) {
        score += 0.08;
      }
    }

    // spectrum_position 이 step 과 맞을수록 미세 보너스 (+0~0.03)
    if (perf.profile) {
      const idealSpectrum = step * 2;  // step 1→2, 5→10
      const spectrumDiff = Math.abs(perf.profile.spectrum_position - idealSpectrum);
      score += Math.max(0, 0.03 - spectrumDiff * 0.006);
    }

    results.push({ performance: perf, distance: dist, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/**
 * 사용자 sensory_tags 와 리뷰 태그 매칭 → 추가 점수
 */
export function applyReviewBoost(
  results: SearchResult[],
  userSensoryTags: string[],
  reviewTagsMap: Record<string, string[]>   // perfId → flat tag list
): SearchResult[] {
  const userTagSet = new Set(userSensoryTags);
  return results.map((r) => {
    const tags = reviewTagsMap[r.performance.id] ?? [];
    const matches = tags.filter((t) => userTagSet.has(t)).length;
    return { ...r, score: r.score + matches * 0.05 };
  });
}
