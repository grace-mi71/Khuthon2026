import { NextResponse } from "next/server";
import { loadContents } from "@/lib/vector-client";

/**
 * GET /api/performances/:id
 * data/contents.json 에서 단일 공연 데이터를 반환합니다.
 * 임베딩 벡터는 클라이언트로 보낼 필요가 없어 제외합니다 (응답 경량화).
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const all = loadContents();
  const perf = all.find((p) => p.id === params.id);
  if (!perf) {
    return NextResponse.json({ error: "공연을 찾을 수 없습니다" }, { status: 404 });
  }
  // embedding 은 클라이언트에서 사용하지 않으므로 제거
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { embedding, ...rest } = perf;
  return NextResponse.json(rest);
}
