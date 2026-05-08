import { NextRequest } from "next/server";
import { streamChat } from "@/lib/claude";
import { createLogger } from "@/lib/logger";
import type { ChatMessage } from "@/lib/types";

const log = createLogger("api/chat/stream");

/**
 * POST /api/chat/stream
 * Body: { messages: ChatMessage[] }
 *
 * Claude Haiku 취향 탐정과의 대화를 SSE 로 스트리밍합니다.
 * 클라이언트는 EventSource 또는 fetch + ReadableStream 으로 수신합니다.
 *
 * SSE 이벤트 형식:
 *   data: {"delta": "텍스트 조각"}
 *   data: [DONE]
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.messages || !Array.isArray(body.messages)) {
    return new Response(JSON.stringify({ error: "messages 배열 필요" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages: ChatMessage[] = body.messages;
  log.info("채팅 스트림 시작", { messageCount: messages.length });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let chunkCount = 0;
      try {
        for await (const chunk of streamChat(messages)) {
          const data = `data: ${JSON.stringify({ delta: chunk })}\n\n`;
          controller.enqueue(encoder.encode(data));
          chunkCount++;
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        log.info("채팅 스트림 완료", { chunkCount });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "알 수 없는 오류";
        log.error("채팅 스트림 오류", { error: errMsg, chunkCount });
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
