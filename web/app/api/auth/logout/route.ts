import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { createLogger } from "@/lib/logger";
import { SESSION_COOKIE } from "@/lib/session";

const log = createLogger("api/auth/logout");

/**
 * POST /api/auth/logout
 *
 * 쿠키에서 세션 토큰 읽어 KV에서 삭제 후 쿠키 무효화.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await kv.del(`session:${token}`).catch(() => {});
    log.info("세션 삭제", { token: token.slice(0, 8) });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
