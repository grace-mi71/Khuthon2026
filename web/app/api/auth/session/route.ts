import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { encodeEmbedding } from "@/lib/vector-client";
import { createLogger } from "@/lib/logger";
import { SESSION_COOKIE } from "@/lib/session";
import type { UserProfile } from "@/lib/types";

const log = createLogger("api/auth/session");

/**
 * GET /api/auth/session
 *
 * 쿠키의 세션 토큰으로 현재 로그인 사용자 정보 반환.
 * 미인증 시 401.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "인증되지 않은 요청" }, { status: 401 });
  }

  const sess = await kv.get<{ userId: string }>(`session:${token}`);
  if (!sess) {
    return NextResponse.json({ error: "만료된 세션" }, { status: 401 });
  }

  const profile = await kv.get<UserProfile>(`user:${sess.userId}`);
  if (!profile) {
    log.error("세션은 있으나 프로필 없음", { userId: sess.userId });
    return NextResponse.json({ error: "사용자 없음" }, { status: 401 });
  }

  log.debug("세션 조회", { userId: sess.userId });

  return NextResponse.json({
    userId: profile.id,
    email: profile.email,
    hobbies: profile.hobbies,
    sensoryTags: profile.sensoryTags,
    embedding: encodeEmbedding(profile.tasteEmbedding),
  });
}
