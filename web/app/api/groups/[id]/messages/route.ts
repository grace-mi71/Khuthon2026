import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

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

  return NextResponse.json({ messages, nextCursor });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const groupId = params.id;
  const body = await req.json().catch(() => null);
  if (!body?.userId || !body?.content) {
    return NextResponse.json({ error: "userId, content 필요" }, { status: 400 });
  }

  const id = randomUUID();
  await sql`
    INSERT INTO messages (id, group_id, user_id, content, created_at)
    VALUES (${id}, ${groupId}, ${body.userId}, ${body.content}, NOW())
  `;

  return NextResponse.json({ id, groupId, userId: body.userId, content: body.content });
}
