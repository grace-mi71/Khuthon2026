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

const TASTE_EXTRACT_SYSTEM = `당신은 대화에서 공연예술 취향을 추출하는 분석기입니다.
대화가 짧거나 명확하지 않더라도 반드시 아래 JSON 형식으로만 응답하세요.
절대 다른 텍스트를 포함하지 마세요. 거절하지 마세요. 항상 JSON을 반환하세요.

{
  "sensory_tags": ["감각 태그 3~8개 (예: 몰입감, 웅장함, 섬세함, 긴장감, 감동적, 화려함)"],
  "inferred_genres": ["추정 선호 장르 1~3개 (뮤지컬/연극/클래식/무용/국악 중)"],
  "embedding_hint": "사용자의 취향을 한 문장으로 요약"
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

/** Claude 응답에서 JSON 블록만 추출 (코드펜스 / 앞뒤 텍스트 제거) */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const braces = raw.match(/\{[\s\S]*\}/);
  if (braces) return braces[0];
  return raw.trim();
}

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

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Claude 응답이 텍스트가 아님");
  try {
    return JSON.parse(extractJson(block.text));
  } catch {
    // Claude가 JSON 거부 시 기본값 반환
    return {
      sensory_tags: ["몰입감", "감동적"],
      inferred_genres: ["뮤지컬"],
      embedding_delta: [],
      embedding_hint: "다양한 공연을 즐기는 관객",
    };
  }
}

/** 리뷰 텍스트에서 태그 추출 */
export async function extractReviewTags(reviewText: string): Promise<ReviewTags> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    system: REVIEW_EXTRACT_SYSTEM,
    messages: [{ role: "user", content: reviewText }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Claude 응답이 텍스트가 아님");
  return JSON.parse(extractJson(block.text));
}

/** 공유 태그로 그룹 이름 생성 (태그 비어있으면 기본 이름 반환) */
export async function generateGroupName(sharedTags: string[]): Promise<string> {
  if (!sharedTags.length) {
    return "취향 탐색가들";  // 채팅 finalize 전에 assign 된 경우 fallback
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 64,
    system: GROUP_NAME_SYSTEM,
    messages: [{ role: "user", content: `태그: ${sharedTags.join(", ")}` }],
  });

  // 멀티라인/특수문자 제거하고 첫 줄만 사용
  const block = response.content[0];
  if (block.type !== "text") return "취향 탐색가들";
  const raw = block.text.trim().split("\n")[0];
  const clean = raw.replace(/["'`]/g, "").slice(0, 30);
  return clean || "취향 탐색가들";
}
