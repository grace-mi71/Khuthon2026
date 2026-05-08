import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";
import { cosineDist } from "@/lib/vector-client";
import { generateGroupName } from "@/lib/claude";
import type { UserProfile, Group } from "@/lib/types";
import { randomUUID } from "crypto";

const SIMILARITY_THRESHOLD = 0.25;  // 코사인 거리 < 0.25 → 같은 그룹 (유사도 > 0.75)
const MAX_GROUP_MEMBERS = 30;

/**
 * POST /api/groups/assign
 * Body: { userId: string }
 *
 * tasteEmbedding 기반으로 기존 그룹에 배정하거나 새 그룹을 만듭니다.
 */
export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId 필요" }, { status: 400 });

  const profile = await kv.get<UserProfile>(`user:${userId}`);
  if (!profile) return NextResponse.json({ error: "사용자 없음" }, { status: 404 });

  // DB 에서 기존 그룹 목록 조회
  const { rows: existingGroups } = await sql<{
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

  let assignedGroupId: string | null = null;

  // 유사한 그룹 탐색
  for (const group of existingGroups) {
    const centroid: number[] = JSON.parse(group.centroid_embedding);
    const dist = cosineDist(profile.tasteEmbedding, centroid);
    if (dist < SIMILARITY_THRESHOLD) {
      assignedGroupId = group.id;
      break;
    }
  }

  // 유사한 그룹이 없으면 새 그룹 생성
  if (!assignedGroupId) {
    const newGroupId = randomUUID();
    const groupName = await generateGroupName(profile.sensoryTags.slice(0, 5));

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
  }

  // 그룹 멤버 추가 (중복 방지)
  await sql`
    INSERT INTO group_members (group_id, user_id, joined_at)
    VALUES (${assignedGroupId}, ${userId}, NOW())
    ON CONFLICT (group_id, user_id) DO NOTHING
  `;

  // UserProfile 에 groupId 추가
  const updatedGroupIds = [...new Set([...profile.groupIds, assignedGroupId])];
  await kv.set(`user:${userId}`, {
    ...profile,
    groupIds: updatedGroupIds,
    updatedAt: Date.now(),
  });

  return NextResponse.json({ groupId: assignedGroupId });
}
