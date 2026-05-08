import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { createLogger } from "@/lib/logger";
import { randomUUID } from "crypto";

const log = createLogger("api/groups/messages");

/**
 * GET /api/groups/:id/messages
 * Query: cursor (마지막 메시지 ID, 페이지네이션), limit (기본 30)
 *
 * POST /api/groups/:id/messages
 * Body: { userId: string, content: string }
 */

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const groupId = params.id;
  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") ?? "30");
  const cursor = searchParams.get("cursor");

  try {
    let rows;
    if (cursor) {
      ({ rows } = await sql`
        SELECT id, group_id, user_id, content, created_at
        FROM messages
        WHERE group_id = ${groupId} AND id < ${cursor}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
    } else {
      ({ rows } = await sql`
        SELECT id, group_id, user_id, content, created_at
        FROM messages
        WHERE group_id = ${groupId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);
    }

    const messages = rows.reverse();  // 오래된 것부터
    const nextCursor = rows.length === limit ? rows[0]?.id : null;

    log.info("메시지 조회 완료", { groupId, count: messages.length, hasCursor: !!cursor });
    return NextResponse.json({ messages, nextCursor });
  } catch (e) {
    log.error("메시지 조회 실패", { groupId, cursor, error: String(e) });
    return NextResponse.json({ error: "메시지 조회 실패" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const groupId = params.id;
  const body = await req.json().catch((e) => {
    log.warn("body 파싱 실패", { groupId, error: String(e) });
    return null;
  });
  if (!body?.userId || !body?.content) {
    log.warn("userId/content 누락", { groupId, body });
    return NextResponse.json({ error: "userId, content 필요" }, { status: 400 });
  }

  const id = randomUUID();
  try {
    await sql`
      INSERT INTO messages (id, group_id, user_id, content, created_at)
      VALUES (${id}, ${groupId}, ${body.userId}, ${body.content}, NOW())
    `;
    log.info("메시지 작성 완료", { groupId, userId: body.userId, msgId: id });
    return NextResponse.json({ id, groupId, userId: body.userId, content: body.content });
  } catch (e) {
    log.error("메시지 저장 실패", { groupId, userId: body.userId, error: String(e) });
    return NextResponse.json({ error: "메시지 저장 실패" }, { status: 500 });
  }
}
