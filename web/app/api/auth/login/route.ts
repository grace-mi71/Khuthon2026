import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { encodeEmbedding } from "@/lib/vector-client";
import { createLogger } from "@/lib/logger";
import { SESSION_COOKIE, SESSION_TTL } from "@/lib/session";
import type { UserProfile } from "@/lib/types";
import { randomUUID } from "crypto";

const log = createLogger("api/auth/login");

/**
 * POST /api/auth/login
 * Body: { email: string }
 *
 * 이메일 인덱스로 userId 조회 → 세션 토큰 생성 → HttpOnly 쿠키 설정.
 * 패스워드 없는 데모용 로그인.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "email 필요" }, { status: 400 });
  }

  const userId = await kv.get<string>(`email:${email}`);
  if (!userId) {
    log.warn("로그인 실패 — 미등록 이메일", { email });
    return NextResponse.json({ error: "등록되지 않은 이메일입니다" }, { status: 404 });
  }

  const profile = await kv.get<UserProfile>(`user:${userId}`);
  if (!profile) {
    log.error("이메일 인덱스는 있으나 프로필 없음", { userId, email });
    return NextResponse.json({ error: "사용자 데이터 없음" }, { status: 404 });
  }

  const token = randomUUID();
  await kv.set(`session:${token}`, { userId }, { ex: SESSION_TTL });

  log.info("로그인 완료", { userId, email });

  const res = NextResponse.json({
    userId,
    embedding: encodeEmbedding(profile.tasteEmbedding),
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
  return res;
}
