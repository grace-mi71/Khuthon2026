import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { hobbiestoEmbedding } from "@/lib/hobby-map";
import { encodeEmbedding } from "@/lib/vector-client";
import { createLogger } from "@/lib/logger";
import type { Hobby, UserProfile } from "@/lib/types";
import { randomUUID } from "crypto";

const log = createLogger("api/auth/register");

/**
 * POST /api/auth/register
 * Body: { email: string, hobbies: Hobby[] }
 *
 * Vercel KV 에 UserProfile 저장 후 userId + encodedEmbedding 반환.
 * (세션/JWT 발급은 NextAuth 등 인증 레이어와 통합 필요)
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch((e) => {
    log.warn("요청 body 파싱 실패", { error: String(e) });
    return null;
  });
  if (!body?.email || !Array.isArray(body?.hobbies) || body.hobbies.length === 0) {
    log.warn("잘못된 요청", { email: body?.email, hobbies: body?.hobbies });
    return NextResponse.json(
      { error: "email 과 hobbies (배열) 가 필요합니다" },
      { status: 400 }
    );
  }

  const { email, hobbies } = body as { email: string; hobbies: Hobby[] };
  log.info("회원가입 시작", { email, hobbies });

  const id = randomUUID();
  let tasteEmbedding: number[];
  try {
    tasteEmbedding = hobbiestoEmbedding(hobbies);
    log.debug("취향 임베딩 생성 완료", { userId: id, dim: tasteEmbedding.length });
  } catch (e) {
    log.error("취향 임베딩 생성 실패", { userId: id, error: String(e) });
    return NextResponse.json({ error: "임베딩 생성 실패" }, { status: 500 });
  }

  const profile: UserProfile = {
    id,
    email,
    hobbies,
    tasteEmbedding,
    sensoryTags: [],
    seenIds: [],
    groupIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    await kv.set(`user:${id}`, profile);
    log.info("회원가입 완료", { userId: id, email });
  } catch (e) {
    log.error("KV 저장 실패", { userId: id, email, error: String(e) });
    return NextResponse.json({ error: "사용자 저장 실패" }, { status: 500 });
  }

  return NextResponse.json({
    userId: id,
    embedding: encodeEmbedding(tasteEmbedding),
  });
}
