// ── 공연 데이터 ─────────────────────────────────────────────────────────

export interface DesireProfile {
  core_desire: string;
  sensory_experience: string;
  emotional_payoff: string;
}

export interface MainstreamBridge {
  mainstream_name: string;
  shared_desire: string;
  key_difference: string;
}

export interface PerformanceProfile {
  desire_profile: DesireProfile;
  mainstream_bridges: MainstreamBridge[];
  sensory_tags: string[];
  emotion_tags: string[];
  spectrum_position: number;        // 1(대중) ~ 10(실험)
  entry_level: "쉬움" | "보통" | "어려움";
  solo_friendly: boolean;
  reason_hidden: string;
}

export interface TrendData {
  trend_score: number;              // 0~1
  news: number;
  blogs: number;
  yt_views: number;
}

export interface Performance {
  id: string;
  title: string;
  genre: string;
  description: string;
  venue_name: string;
  venue_seats: number;
  venue_address: string;
  venue_lat: string;
  venue_lng: string;
  region: string;
  start_date: string;
  end_date: string;
  price: string;
  age_rating: string;
  poster_url: string;
  state: string;
  popularity: number;               // 0~100 (seats 기반)
  profile: PerformanceProfile | null;
  embedding: number[];              // 768차원
  trend?: TrendData;
}

// ── 사용자 프로필 ────────────────────────────────────────────────────────

export type Hobby =
  | "독서" | "영화" | "음악" | "여행"
  | "운동" | "요리" | "게임" | "미술";

export interface UserProfile {
  id: string;
  email: string;
  hobbies: Hobby[];
  tasteEmbedding: number[];         // 768차원, 취향 요약 벡터
  sensoryTags: string[];            // 채팅을 통해 추출된 태그
  seenIds: string[];                // 이미 본 공연 ID
  groupIds: string[];               // 소속 그룹 ID
  createdAt: number;
  updatedAt: number;
}

// ── 검색 ────────────────────────────────────────────────────────────────

export type TasteStep = 1 | 2 | 3 | 4 | 5;

export const STEP_RANGES: Record<TasteStep, [number, number]> = {
  1: [0.15, 0.35],  // 매우 유사
  2: [0.30, 0.50],  // 비슷한
  3: [0.45, 0.65],  // 새로운
  4: [0.60, 0.75],  // 도전
  5: [0.65, 0.85],  // 파격
};

export const STEP_LABELS: Record<TasteStep, string> = {
  1: "매우 유사",
  2: "비슷한",
  3: "새로운",
  4: "도전",
  5: "파격",
};

export interface SearchResult {
  performance: Performance;
  distance: number;                 // 코사인 거리 (낮을수록 유사)
  score: number;                    // 최종 점수 (높을수록 추천)
}

// ── 채팅 ────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TasteExtractResult {
  sensory_tags: string[];
  inferred_genres: string[];
  embedding_delta: number[];        // 768차원 취향 보정 벡터
}

// ── 그룹 ────────────────────────────────────────────────────────────────

export interface Group {
  id: string;
  name: string;
  centroidEmbedding: number[];      // 768차원 그룹 평균 벡터
  memberCount: number;
  createdAt: number;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt: number;
}

// ── 리뷰 ────────────────────────────────────────────────────────────────

export interface ReviewTags {
  positive: string[];
  negative: string[];
  mood: string[];
}

export interface Review {
  id: string;
  perfId: string;
  userId: string;
  text: string;
  tags: ReviewTags;
  createdAt: number;
}
