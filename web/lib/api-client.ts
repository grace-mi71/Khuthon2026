import type { ChatMessage, Hobby, Performance, ReviewTags } from "./types";

// ── 응답 타입 (API 라우트 응답 형태와 일치) ─────────────────────────────

export interface RegisterResp {
  userId: string;
  embedding: string;          // base64
}

export interface FinalizeResp {
  sensory_tags: string[];
  inferred_genres: string[];
  embedding: string;          // base64
}

export interface RecCard {
  id: string;
  title: string;
  genre: string;
  venue_name: string;
  region: string;
  poster_url: string;
  start_date: string;
  end_date: string;
  price: string;
  state: string;
  popularity: number;
  trend_score: number;
  sensory_tags: string[];
  score: number;
  distance?: number;          // /api/recommend 응답에만 포함
}

export interface LandingRecommendationsResp {
  userId: string;
  hobbies: Hobby[];
  embedding: string;
  step: 1 | 2 | 3 | 4 | 5;
  count: number;
  results: RecCard[];
}

export interface RecommendResp {
  step: 1 | 2 | 3 | 4 | 5;
  count: number;
  results: RecCard[];
}

export interface GroupSummary {
  id: string;
  name: string;
  member_count: number;
  last_message: string | null;
}

export interface GroupMessageRow {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  user_id: string;
  text: string;
  tags: ReviewTags;
  created_at: string;
}

// ── 내부 유틸 ──────────────────────────────────────────────────────────

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

// ── 회원가입 ──────────────────────────────────────────────────────────

export function register(email: string, hobbies: Hobby[]): Promise<RegisterResp> {
  return jsonFetch<RegisterResp>("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, hobbies }),
  });
}

// ── 채팅 SSE ───────────────────────────────────────────────────────────

/**
 * SSE 스트림 파서. 각 토큰을 onDelta 로 콜백.
 * AbortSignal 로 취소 가능. 종료 시 resolve, 에러 시 reject.
 */
export async function streamChat(
  messages: ChatMessage[],
  onDelta: (delta: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        if (json.error) throw new Error(json.error);
        if (typeof json.delta === "string") onDelta(json.delta);
      } catch (e) {
        if (e instanceof Error && e.message) throw e;
      }
    }
  }
}

export function finalize(userId: string, messages: ChatMessage[]): Promise<FinalizeResp> {
  return jsonFetch<FinalizeResp>("/api/chat/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, messages }),
  });
}

// ── 추천 ──────────────────────────────────────────────────────────────

export function getLandingRecommendations(
  userId: string,
  step: 1 | 2 | 3 | 4 | 5 = 2,
  limit = 10
): Promise<LandingRecommendationsResp> {
  const qs = new URLSearchParams({ userId, step: String(step), limit: String(limit) });
  return jsonFetch<LandingRecommendationsResp>(`/api/landing/recommendations?${qs}`);
}

export interface SearchOpts {
  region?: string;
  excludeIds?: string[];
  limit?: number;
}

export function searchByEmbedding(
  embedding: string,
  step: 1 | 2 | 3 | 4 | 5,
  opts: SearchOpts = {}
): Promise<RecommendResp> {
  const qs = new URLSearchParams({ embedding, step: String(step) });
  if (opts.region) qs.set("region", opts.region);
  if (opts.excludeIds?.length) qs.set("exclude", opts.excludeIds.join(","));
  if (opts.limit) qs.set("limit", String(opts.limit));
  return jsonFetch<RecommendResp>(`/api/recommend?${qs}`);
}

// ── 그룹 ──────────────────────────────────────────────────────────────

export function assignGroup(userId: string): Promise<{ groupId: string }> {
  return jsonFetch<{ groupId: string }>("/api/groups/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

export function getMyGroups(userId: string): Promise<{ groups: GroupSummary[] }> {
  return jsonFetch<{ groups: GroupSummary[] }>(
    `/api/groups/mine?userId=${encodeURIComponent(userId)}`
  );
}

export function getGroupMessages(
  groupId: string,
  cursor?: string,
  limit = 30
): Promise<{ messages: GroupMessageRow[]; nextCursor: string | null }> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) qs.set("cursor", cursor);
  return jsonFetch(`/api/groups/${groupId}/messages?${qs}`);
}

export function sendGroupMessage(
  groupId: string,
  userId: string,
  content: string
): Promise<{ id: string; groupId: string; userId: string; content: string }> {
  return jsonFetch(`/api/groups/${groupId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, content }),
  });
}

// ── 리뷰 ──────────────────────────────────────────────────────────────

export function submitReview(
  userId: string,
  perfId: string,
  text: string
): Promise<{ id: string; perfId: string; tags: ReviewTags }> {
  return jsonFetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, perfId, text }),
  });
}

export function getReviews(
  perfId: string
): Promise<{ perfId: string; count: number; reviews: ReviewRow[] }> {
  return jsonFetch(`/api/reviews?perfId=${encodeURIComponent(perfId)}`);
}

export interface MyReviewRow {
  id: string;
  perf_id: string;
  text: string;
  tags: ReviewTags;
  created_at: string;
}

export function getMyReviews(
  userId: string
): Promise<{ userId: string; count: number; reviews: MyReviewRow[] }> {
  return jsonFetch(`/api/reviews/mine?userId=${encodeURIComponent(userId)}`);
}

// ── 공연 상세 ─────────────────────────────────────────────────────────

export function getPerformance(id: string): Promise<Performance> {
  return jsonFetch<Performance>(`/api/performances/${encodeURIComponent(id)}`);
}
