import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, TasteExtractResult, ReviewTags } from "./types";

const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_KEY;
const client = new Anthropic({ apiKey });

const TASTE_DETECTIVE_SYSTEM = `당신은 관객의 취향을 발견하는 '취향 탐정'입니다.
사용자의 과거 경험과 감각 반응을 질문해서 공연예술 취향을 파악합니다.

규칙:
- 한 번에 질문 하나만 하세요.
- 공연 전문 용어 대신 일상적인 언어를 사용하세요.
- 긍정적이고 호기심 있는 톤을 유지하세요.
- 5~7번 교환 후 자연스럽게 마무리하세요.

예시 질문 방향:
- "최근 인상 깊었던 영화나 음악이 있나요? 어떤 점이 좋았나요?"
- "공연장이나 전시회에 가본 적 있나요? 그때 느낌이 어땠나요?"
- "혼자 조용히 감상하는 것과 함께 즐기는 것 중 어떤 걸 더 좋아하나요?"`;

const TASTE_EXTRACT_SYSTEM = `다음 대화에서 사용자의 공연예술 취향을 추출하세요.
아래 JSON만 응답하고 다른 텍스트는 포함하지 마세요.

{
  "sensory_tags": ["감각 태그 5~8개 (예: 몰입감, 웅장함, 섬세함, 긴장감)"],
  "inferred_genres": ["추정 선호 장르 1~3개"],
  "embedding_hint": "취향을 한 문장으로 요약 (임베딩 생성에 사용)"
}`;

const REVIEW_EXTRACT_SYSTEM = `공연 리뷰 텍스트에서 태그를 추출하세요.
아래 JSON만 응답하고 다른 텍스트는 포함하지 마세요.

{
  "positive": ["긍정 태그 2~4개"],
  "negative": ["부정 태그 0~3개 (없으면 빈 배열)"],
  "mood": ["분위기 태그 2~3개"]
}`;

const GROUP_NAME_SYSTEM = `공유된 취향 태그들을 보고 그룹 이름을 지어주세요.
짧고 감성적인 한국어 이름 1개만 반환하세요. 예: "새벽 감성 탐험가", "소극장 단골손님"`;

/** Claude Haiku 로 SSE 스트리밍 */
export async function* streamChat(
  messages: ChatMessage[],
  systemPrompt = TASTE_DETECTIVE_SYSTEM
): AsyncGenerator<string> {
  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: systemPrompt,
    messages,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      yield chunk.delta.text;
    }
  }
}

/** 대화 기록에서 취향 프로필 추출 */
export async function extractTasteProfile(
  conversation: ChatMessage[]
): Promise<TasteExtractResult & { embedding_hint: string }> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: TASTE_EXTRACT_SYSTEM,
    messages: [
      {
        role: "user",
        content: conversation
          .map((m) => `${m.role === "user" ? "사용자" : "탐정"}: ${m.content}`)
          .join("\n"),
      },
    ],
  });

  const raw = response.content[0].text.trim();
  return JSON.parse(raw);
}

/** 리뷰 텍스트에서 태그 추출 */
export async function extractReviewTags(reviewText: string): Promise<ReviewTags> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: REVIEW_EXTRACT_SYSTEM,
    messages: [{ role: "user", content: reviewText }],
  });

  const raw = response.content[0].text.trim();
  return JSON.parse(raw);
}

/** 공유 태그로 그룹 이름 생성 */
export async function generateGroupName(sharedTags: string[]): Promise<string> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 64,
    system: GROUP_NAME_SYSTEM,
    messages: [{ role: "user", content: `태그: ${sharedTags.join(", ")}` }],
  });

  return response.content[0].text.trim().replace(/["']/g, "");
}
