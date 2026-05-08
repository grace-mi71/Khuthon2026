import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";
import { createLogger } from "@/lib/logger";
import type { UserProfile } from "@/lib/types";

const log = createLogger("api/groups/mine");

/**
 * GET /api/groups/mine
 * Query: userId
 *
 * 사용자가 속한 그룹 목록과 각 그룹의 최신 메시지를 반환합니다.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    log.warn("userId 파라미터 누락");
    return NextResponse.json({ error: "userId 필요" }, { status: 400 });
  }

  const profile = await kv.get<UserProfile>(`user:${userId}`);
  if (!profile) {
    log.warn("사용자 없음", { userId });
    return NextResponse.json({ error: "사용자 없음" }, { status: 404 });
  }

  if (profile.groupIds.length === 0) {
    return NextResponse.json({ groups: [] });
  }

  try {
    // IN 쿼리를 위해 플레이스홀더 처리
    const placeholders = profile.groupIds.map((_, i) => `$${i + 1}`).join(", ");
    const { rows } = await sql.query(
      `SELECT g.id, g.name,
              COUNT(DISTINCT gm.user_id)::int as member_count,
              (SELECT content FROM messages m WHERE m.group_id = g.id
               ORDER BY created_at DESC LIMIT 1) as last_message
       FROM groups g
       LEFT JOIN group_members gm ON g.id = gm.group_id
       WHERE g.id IN (${placeholders})
       GROUP BY g.id`,
      profile.groupIds
    );
    log.info("그룹 조회 완료", { userId, groupCount: rows.length });
    return NextResponse.json({ groups: rows });
  } catch (e) {
    log.error("그룹 조회 실패", { userId, error: String(e) });
    return NextResponse.json({ error: "그룹 조회 실패" }, { status: 500 });
  }
}
