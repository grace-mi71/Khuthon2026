import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";
import { cosineDist } from "@/lib/vector-client";
import { generateGroupName } from "@/lib/claude";
import { createLogger } from "@/lib/logger";
import type { UserProfile } from "@/lib/types";
import { randomUUID } from "crypto";

const log = createLogger("api/groups/assign");

const SIMILARITY_THRESHOLD = 0.25;  // 코사인 거리 < 0.25 → 같은 그룹 (유사도 > 0.75)
const MAX_GROUP_MEMBERS = 30;

/**
 * POST /api/groups/assign
 * Body: { userId: string }
 *
 * tasteEmbedding 기반으로 기존 그룹에 배정하거나 새 그룹을 만듭니다.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch((e) => {
    log.warn("body 파싱 실패", { error: String(e) });
    return null;
  });
  const userId = body?.userId;
  if (!userId) {
    log.warn("userId 누락");
    return NextResponse.json({ error: "userId 필요" }, { status: 400 });
  }

  const profile = await kv.get<UserProfile>(`user:${userId}`);
  if (!profile) {
    log.warn("사용자 없음", { userId });
    return NextResponse.json({ error: "사용자 없음" }, { status: 404 });
  }

  log.info("그룹 배정 시작", { userId, sensoryTagCount: profile.sensoryTags.length });

  // DB 에서 기존 그룹 목록 조회
  let existingGroups;
  try {
    const result = await sql<{
      id: string;
      name: string;
      centroid_embedding: string;
      member_count: number;
    }>`
      SELECT g.id, g.name, g.centroid_embedding,
             COUNT(gm.user_id)::int as member_count
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      GROUP BY g.id
      HAVING COUNT(gm.user_id) < ${MAX_GROUP_MEMBERS}
      ORDER BY g.created_at DESC
      LIMIT 100
    `;
    existingGroups = result.rows;
  } catch (e) {
    log.error("그룹 조회 실패", { userId, error: String(e) });
    return NextResponse.json({ error: "그룹 조회 실패" }, { status: 500 });
  }

  let assignedGroupId: string | null = null;
  let bestDist = 1.0;

  // 유사한 그룹 탐색
  for (const group of existingGroups) {
    try {
      const centroid: number[] = JSON.parse(group.centroid_embedding);
      const dist = cosineDist(profile.tasteEmbedding, centroid);
      if (dist < bestDist) bestDist = dist;
      if (dist < SIMILARITY_THRESHOLD) {
        assignedGroupId = group.id;
        log.info("기존 그룹 매칭", { userId, groupId: group.id, distance: dist });
        break;
      }
    } catch (e) {
      log.error("centroid 파싱 실패", { groupId: group.id, error: String(e) });
    }
  }

  // 유사한 그룹이 없으면 새 그룹 생성
  if (!assignedGroupId) {
    log.info("새 그룹 생성 (최단 거리 그룹과도 너무 멀음)", { userId, bestDist });
    const newGroupId = randomUUID();

    let groupName = "새 취향 그룹";
    try {
      groupName = await generateGroupName(profile.sensoryTags.slice(0, 5));
    } catch (e) {
      log.warn("그룹 이름 생성 실패 — 기본 이름 사용", { error: String(e) });
    }

    try {
      await sql`
        INSERT INTO groups (id, name, centroid_embedding, created_at)
        VALUES (
          ${newGroupId},
          ${groupName},
          ${JSON.stringify(profile.tasteEmbedding)},
          NOW()
        )
      `;
      assignedGroupId = newGroupId;
      log.info("새 그룹 생성 완료", { groupId: newGroupId, name: groupName });
    } catch (e) {
      log.error("그룹 생성 실패", { userId, error: String(e) });
      return NextResponse.json({ error: "그룹 생성 실패" }, { status: 500 });
    }
  }

  // 그룹 멤버 추가 (중복 방지)
  try {
    await sql`
      INSERT INTO group_members (group_id, user_id, joined_at)
      VALUES (${assignedGroupId}, ${userId}, NOW())
      ON CONFLICT (group_id, user_id) DO NOTHING
    `;
  } catch (e) {
    log.error("멤버 추가 실패", { groupId: assignedGroupId, userId, error: String(e) });
    return NextResponse.json({ error: "멤버 추가 실패" }, { status: 500 });
  }

  // UserProfile 에 groupId 추가
  const updatedGroupIds = [...new Set([...profile.groupIds, assignedGroupId])];
  await kv.set(`user:${userId}`, {
    ...profile,
    groupIds: updatedGroupIds,
    updatedAt: Date.now(),
  });

  log.info("그룹 배정 완료", { userId, groupId: assignedGroupId });
  return NextResponse.json({ groupId: assignedGroupId });
}
