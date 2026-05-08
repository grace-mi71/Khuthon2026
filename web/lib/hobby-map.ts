import path from "path";
import fs from "fs";
import type { Hobby } from "./types";

// 취미 → 장르 매핑 (KOPIS 6대 장르: 뮤지컬, 연극, 음악, 무용, 국악, 서커스/마술)
export const HOBBY_GENRE_MAP: Record<Hobby, string[]> = {
  독서: ["연극", "음악"],
  영화: ["뮤지컬", "연극"],
  음악: ["음악", "뮤지컬"],
  여행: ["국악", "서커스/마술"],
  운동: ["무용", "서커스/마술"],
  요리: ["국악", "음악"],
  게임: ["뮤지컬", "서커스/마술"],
  미술: ["연극", "무용"],
};

export const HOBBIES: Hobby[] = [
  "독서", "영화", "음악", "여행", "운동", "요리", "게임", "미술",
];

let _centroids: Record<string, number[]> | null = null;

function loadCentroids(): Record<string, number[]> {
  if (_centroids) return _centroids;
  const filePath = path.join(process.cwd(), "..", "data", "genre_centroids.json");
  _centroids = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return _centroids!;
}

/**
 * 선택한 취미 목록에서 초기 tasteEmbedding 을 생성합니다.
 * 각 취미가 매핑하는 장르의 centroid 벡터를 평균합니다.
 */
export function hobbiestoEmbedding(hobbies: Hobby[]): number[] {
  const centroids = loadCentroids();

  const vecs: number[][] = [];
  for (const hobby of hobbies) {
    const genres = HOBBY_GENRE_MAP[hobby] ?? [];
    for (const genre of genres) {
      const vec = centroids[genre];
      if (vec) vecs.push(vec);
    }
  }

  if (vecs.length === 0) {
    // fallback: 모든 장르 centroid 의 평균
    const all = Object.values(centroids);
    return averageVecs(all);
  }

  return averageVecs(vecs);
}

function averageVecs(vecs: number[][]): number[] {
  const dim = vecs[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of vecs) {
    for (let i = 0; i < dim; i++) sum[i] += v[i];
  }
  const avg = sum.map((v) => v / vecs.length);
  // L2 정규화
  const norm = Math.sqrt(avg.reduce((s, v) => s + v * v, 0));
  return norm > 0 ? avg.map((v) => v / norm) : avg;
}
