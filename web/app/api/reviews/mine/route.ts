import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/reviews/mine");

/**
 * GET /api/reviews/mine?userId=xxx
 * 사용자가 작성한 리뷰 목록 (최근 50개).
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId 필요" }, { status: 400 });
  }

  try {
    const { rows } = await sql`
      SELECT id, perf_id, text, tags_json, created_at
      FROM reviews
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const reviews = rows.map((r) => ({
      id: r.id,
      perf_id: r.perf_id,
      text: r.text,
      tags: typeof r.tags_json === "string" ? JSON.parse(r.tags_json) : r.tags_json,
      created_at: r.created_at,
    }));

    return NextResponse.json({ userId, count: reviews.length, reviews });
  } catch (e) {
    log.error("내 리뷰 조회 실패", { userId, error: String(e) });
    return NextResponse.json({ error: "리뷰 조회 실패" }, { status: 500 });
  }
}
