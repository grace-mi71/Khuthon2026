"use client";

import { cn } from "@/lib/cn";

interface Props {
  role: "user" | "assistant" | "system";
  content: string;
  variant?: "detective" | "group";
  isOwn?: boolean;
  authorLabel?: string;
}

export function MessageBubble({ role, content, isOwn, authorLabel }: Props) {
  const own = isOwn ?? role === "user";
  return (
    <div className={cn("flex w-full", own ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] flex flex-col", own ? "items-end" : "items-start")}>
        {authorLabel && !own && (
          <span className="text-xs font-semibold text-gray-400 mb-1 px-2">{authorLabel}</span>
        )}
        <div
          className={cn(
            "px-5 py-3 rounded-3xl shadow-sm leading-relaxed text-[15px] whitespace-pre-wrap",
            own
              ? "bg-brand-600 text-white rounded-tr-sm"
              : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
          )}
        >
          {content || <span className="opacity-50 inline-block animate-pulse">…</span>}
        </div>
      </div>
    </div>
  );
}
