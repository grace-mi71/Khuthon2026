import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { kv } from "@vercel/kv";
import { extractReviewTags } from "@/lib/claude";
import { createLogger } from "@/lib/logger";
import { randomUUID } from "crypto";

const log = createLogger("api/reviews");

/**
 * POST /api/reviews
 * Body: { userId: string, perfId: string, text: string }
 *
 * GET /api/reviews?perfId=xxx
 */

export async function POST(req: NextRequest) {
  const body = await req.json().catch((e) => {
    log.warn("요청 body 파싱 실패", { error: String(e) });
    return null;
  });
  if (!body?.userId || !body?.perfId || !body?.text) {
    log.warn("잘못된 요청", { userId: body?.userId, perfId: body?.perfId });
    return NextResponse.json(
      { error: "userId, perfId, text 필요" },
      { status: 400 }
    );
  }

  const { userId, perfId, text } = body as { userId: string; perfId: string; text: string };
  log.info("리뷰 저장 시작", { userId, perfId, textLength: text.length });

  let tags;
  try {
    tags = await extractReviewTags(text);
    log.debug("태그 추출 완료", { perfId, tags });
  } catch (e) {
    log.error("Claude 태그 추출 실패", { perfId, error: String(e) });
    return NextResponse.json({ error: "태그 추출 실패" }, { status: 500 });
  }

  const id = randomUUID();
  try {
    await sql`
      INSERT INTO reviews (id, perf_id, user_id, text, tags_json, created_at)
      VALUES (
        ${id},
        ${perfId},
        ${userId},
        ${text},
        ${JSON.stringify(tags)},
        NOW()
      )
    `;
    await kv.incr(`review_count:${perfId}`);
    log.info("리뷰 저장 완료", { reviewId: id, perfId, userId });
  } catch (e) {
    log.error("DB 저장 실패", { id, perfId, userId, error: String(e) });
    return NextResponse.json({ error: "리뷰 저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ id, perfId, tags });
}

export async function GET(req: NextRequest) {
  const perfId = req.nextUrl.searchParams.get("perfId");
  if (!perfId) return NextResponse.json({ error: "perfId 필요" }, { status: 400 });

  const { rows } = await sql`
    SELECT id, user_id, text, tags_json, created_at
    FROM reviews
    WHERE perf_id = ${perfId}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  const reviews = rows.map((r) => ({
    ...r,
    tags: typeof r.tags_json === "string" ? JSON.parse(r.tags_json) : r.tags_json,
  }));

  return NextResponse.json({ perfId, reviews });
}
