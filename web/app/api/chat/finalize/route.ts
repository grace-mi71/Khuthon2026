import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { createLogger } from "@/lib/logger";
const log = createLogger("api/chat/finalize");
import { extractTasteProfile } from "@/lib/claude";
import { blendEmbeddings, encodeEmbedding } from "@/lib/vector-client";
import { hobbiestoEmbedding } from "@/lib/hobby-map";
import type { ChatMessage, UserProfile } from "@/lib/types";
import { SentenceTransformerEmbedder } from "@/lib/embedder";

/**
 * POST /api/chat/finalize
 * Body: { userId: string, messages: ChatMessage[] }
 *
 * 대화를 분석해 취향 프로필을 추출하고 tasteEmbedding 을 업데이트합니다.
 * 이후 /api/groups/assign 을 호출해 그룹 배정을 트리거합니다.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.userId || !Array.isArray(body?.messages)) {
    return NextResponse.json({ error: "userId, messages 필요" }, { status: 400 });
  }

  const { userId, messages }: { userId: string; messages: ChatMessage[] } = body;

  const profile = await kv.get<UserProfile>(`user:${userId}`);
  if (!profile) {
    log.warn("사용자 없음", { userId });
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  log.info("취향 추출 시작", { userId, messageCount: messages.length });

  let extracted;
  try {
    extracted = await extractTasteProfile(messages);
    log.info("취향 추출 완료", { userId, sensoryTagCount: extracted.sensory_tags.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log.error("취향 추출 Claude 호출 실패", { userId, error: msg });
    return NextResponse.json({ error: "취향 분석 중 오류가 발생했습니다" }, { status: 500 });
  }

  // 2. embedding_hint 텍스트를 임베딩으로 변환 (서버 사이드 임베딩)
  //    SentenceTransformerEmbedder 는 별도 /lib/embedder.ts 에서 정의
  //    빌드 환경에 sentence-transformers 가 없으면 Python microservice 호출로 대체 가능
  let deltaVec: number[];
  try {
    deltaVec = await SentenceTransformerEmbedder.embed(extracted.embedding_hint);
    log.debug("임베딩 서버 호출 성공", { userId, hint: extracted.embedding_hint.slice(0, 50) });
  } catch (e) {
    log.warn("임베딩 서버 호출 실패 — centroid fallback 사용", { userId, error: String(e) });
    deltaVec = hobbiestoEmbedding(
      extracted.inferred_genres.map((g) => mapGenreToHobby(g))
    );
  }

  // 3. tasteEmbedding 업데이트 (70% 기존 + 30% 새로운 취향)
  const newEmbedding = blendEmbeddings(profile.tasteEmbedding, deltaVec, 0.3);

  // 4. 프로필 저장
  const updated: UserProfile = {
    ...profile,
    tasteEmbedding: newEmbedding,
    sensoryTags: [
      ...new Set([...profile.sensoryTags, ...extracted.sensory_tags]),
    ].slice(0, 20),  // 최대 20개 유지
    updatedAt: Date.now(),
  };
  await kv.set(`user:${userId}`, updated);
  log.info("프로필 업데이트 완료", { userId, newTagCount: updated.sensoryTags.length });

  fetch(`${req.nextUrl.origin}/api/groups/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  }).catch(() => {});

  return NextResponse.json({
    sensory_tags: extracted.sensory_tags,
    inferred_genres: extracted.inferred_genres,
    embedding: encodeEmbedding(newEmbedding),
  });
}

// inferred_genres → Hobby 근사 변환 (fallback 전용)
function mapGenreToHobby(genre: string): any {
  const map: Record<string, string> = {
    뮤지컬: "음악", 연극: "독서", 클래식: "음악",
    무용: "미술", 국악: "여행", "서커스/마술": "게임",
  };
  return map[genre] ?? "음악";
}
