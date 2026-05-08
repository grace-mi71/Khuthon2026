"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, ChevronUp } from "lucide-react";
import { MessageBubble } from "@/components/ui/MessageBubble";
import {
  getGroupMessages,
  sendGroupMessage,
  type GroupMessageRow,
} from "@/lib/api-client";
import { loadSession } from "@/lib/storage";

const POLL_INTERVAL_MS = 5000;

export default function GroupChatPage() {
  const params = useParams<{ id: string }>();
  const groupId = params.id;
  const router = useRouter();

  const [messages, setMessages] = useState<GroupMessageRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const knownIds = useRef<Set<string>>(new Set());

  // 초기 로드
  useEffect(() => {
    const s = loadSession();
    if (!s?.userId) {
      router.replace("/start");
      return;
    }
    userIdRef.current = s.userId;
    (async () => {
      try {
        const r = await getGroupMessages(groupId);
        knownIds.current = new Set(r.messages.map((m) => m.id));
        setMessages(r.messages);
        setNextCursor(r.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "메시지를 불러오지 못했습니다");
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId, router]);

  // 폴링 — 5초마다 새 메시지 확인 (최신 페이지만)
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const r = await getGroupMessages(groupId);
        const fresh = r.messages.filter((m) => !knownIds.current.has(m.id));
        if (fresh.length > 0) {
          fresh.forEach((m) => knownIds.current.add(m.id));
          setMessages((prev) => mergeSorted(prev, fresh));
        }
      } catch {
        /* polling silent */
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [groupId]);

  // 새 메시지 수신 시 자동 스크롤 (사용자가 위쪽을 보고 있으면 skip)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (nearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const r = await getGroupMessages(groupId, nextCursor);
      const fresh = r.messages.filter((m) => !knownIds.current.has(m.id));
      fresh.forEach((m) => knownIds.current.add(m.id));
      setMessages((prev) => [...fresh, ...prev]);
      setNextCursor(r.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    } finally {
      setLoadingMore(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const userId = userIdRef.current;
    if (!userId) return;
    setSending(true);
    setError(null);
    try {
      const sent = await sendGroupMessage(groupId, userId, text);
      const row: GroupMessageRow = {
        id: sent.id,
        group_id: sent.groupId,
        user_id: sent.userId,
        content: sent.content,
        created_at: new Date().toISOString(),
      };
      knownIds.current.add(row.id);
      setMessages((prev) => [...prev, row]);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "전송 실패");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/20 to-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur z-40 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href="/groups"
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="뒤로"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-gray-900">취향 그룹</h1>
            <p className="text-xs text-gray-500 font-medium">5초마다 자동 동기화</p>
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-20 pb-32 px-4 max-w-3xl w-full mx-auto space-y-3"
      >
        {nextCursor && (
          <div className="text-center pt-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:bg-brand-50 px-4 py-2 rounded-full transition disabled:opacity-50"
            >
              <ChevronUp size={14} />
              {loadingMore ? "불러오는 중…" : "이전 메시지 더 보기"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-8">메시지를 불러오는 중…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            첫 메시지를 남겨 대화를 시작해보세요.
          </p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              role="user"
              isOwn={m.user_id === userIdRef.current}
              authorLabel={m.user_id.slice(0, 6)}
              content={m.content}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full pl-5 pr-2 py-1 focus-within:border-brand-600 focus-within:bg-white transition">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())
              }
              placeholder="메시지를 남겨보세요"
              disabled={sending}
              className="flex-1 bg-transparent outline-none py-3 text-gray-800 placeholder-gray-400 text-base"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              aria-label="전송"
              className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-700 disabled:bg-gray-300 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-center text-sm text-rose-600 font-semibold">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

function mergeSorted(prev: GroupMessageRow[], fresh: GroupMessageRow[]): GroupMessageRow[] {
  const all = [...prev, ...fresh];
  all.sort((a, b) => a.created_at.localeCompare(b.created_at));
  return all;
}
