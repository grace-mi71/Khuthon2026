"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";
import { StepHeader } from "@/components/layout/StepHeader";
import { MessageBubble } from "@/components/ui/MessageBubble";
import { Button } from "@/components/ui/Button";
import { streamChat, finalize } from "@/lib/api-client";
import { loadSession, updateSession } from "@/lib/storage";
import type { ChatMessage } from "@/lib/types";

const SEED_GREETING: ChatMessage = {
  role: "assistant",
  content:
    "안녕하세요! 저는 당신의 취향을 함께 발견할 탐정이에요. 🎭\n최근에 인상 깊었던 영화나 음악, 공연이 있었나요? 어떤 점이 가장 좋았는지 들려주세요.",
};

const MIN_USER_TURNS = 5;
const MAX_USER_TURNS = 7;

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([SEED_GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 세션 가드
  useEffect(() => {
    const s = loadSession();
    if (!s?.userId) {
      router.replace("/start");
      return;
    }
    userIdRef.current = s.userId;
  }, [router]);

  // 자동 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // unmount 시 stream abort
  useEffect(() => () => abortRef.current?.abort(), []);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const canFinalize = userTurns >= MIN_USER_TURNS;

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // SSE 호출에는 빈 assistant placeholder 제외
      const reqMessages = next.slice(0, -1);
      await streamChat(
        reqMessages,
        (delta) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: last.content + delta };
            }
            return copy;
          });
        },
        controller.signal
      );
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(e instanceof Error ? e.message : "응답 수신 실패");
      // 빈 assistant 슬롯 제거
      setMessages((prev) => prev.filter((m, i) => !(i === prev.length - 1 && m.role === "assistant" && !m.content)));
    } finally {
      setStreaming(false);
    }
  }

  async function onFinalize() {
    if (!canFinalize || finalizing) return;
    const userId = userIdRef.current;
    if (!userId) return;
    setFinalizing(true);
    setError(null);
    try {
      const res = await finalize(userId, messages);
      updateSession({
        embedding: res.embedding,
        sensoryTags: res.sensory_tags,
      });
      router.push("/recommendations");
    } catch (e) {
      setError(e instanceof Error ? e.message : "취향 분석 실패");
      setFinalizing(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/30 to-white flex flex-col">
      <StepHeader step={2} />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 pt-28 pb-40 flex flex-col">
        <div className="text-center mb-8 px-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-snug mb-2">
            <span className="text-brand-600">취향 탐정</span>과 대화 중
          </h1>
          <p className="text-gray-500 text-base">
            5번 정도 솔직하게 답해주시면 취향의 결을 그려드릴게요.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-600 bg-brand-50 px-4 py-1.5 rounded-full">
            <Sparkles size={14} /> {userTurns} / {MAX_USER_TURNS} 턴
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto scrollbar-hide pr-1"
        >
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-600 font-semibold bg-rose-50 px-4 py-2 rounded-full text-center">
            {error}
          </p>
        )}
      </div>

      {/* Bottom input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full pl-5 pr-2 py-1 focus-within:border-brand-600 focus-within:bg-white transition">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={
                streaming ? "탐정이 답변 중…" : "어떤 순간이 가장 마음에 남았나요?"
              }
              disabled={streaming}
              className="flex-1 bg-transparent outline-none py-3 text-gray-800 placeholder-gray-400 text-base"
            />
            <button
              onClick={send}
              disabled={!input.trim() || streaming}
              aria-label="메시지 보내기"
              className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-700 disabled:bg-gray-300 transition"
            >
              <Send size={18} />
            </button>
          </div>
          <Button
            variant={canFinalize ? "primary" : "ghost"}
            disabled={!canFinalize || finalizing || streaming}
            onClick={onFinalize}
            className="hidden md:inline-flex whitespace-nowrap"
          >
            {finalizing ? "분석 중…" : "취향 분석 마치기"}
          </Button>
        </div>
        {/* 모바일: 전체폭 finalize 버튼 */}
        <div className="md:hidden max-w-3xl mx-auto mt-2">
          <Button
            variant={canFinalize ? "primary" : "ghost"}
            disabled={!canFinalize || finalizing || streaming}
            onClick={onFinalize}
            className="w-full"
          >
            {finalizing ? "분석 중…" : `취향 분석 마치기 (${userTurns}/${MIN_USER_TURNS})`}
          </Button>
        </div>
      </div>
    </main>
  );
}
