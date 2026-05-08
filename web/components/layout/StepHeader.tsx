"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

interface StepHeaderProps {
  step: 1 | 2 | 3;
}

const STEPS = [
  { idx: 1, label: "취미 선택" },
  { idx: 2, label: "취향 탐정" },
  { idx: 3, label: "딴길 추천" },
];

export function StepHeader({ step }: StepHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-brand-600 tracking-tighter">
          딴길
        </Link>
        <ol className="flex items-center gap-2 md:gap-3">
          {STEPS.map((s, i) => {
            const active = s.idx === step;
            const done = s.idx < step;
            return (
              <li key={s.idx} className="flex items-center gap-2 md:gap-3">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-sm font-semibold transition",
                    active && "bg-brand-600 text-white",
                    done && "bg-brand-100 text-brand-700",
                    !active && !done && "bg-gray-100 text-gray-400"
                  )}
                >
                  <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-white/30 text-xs">
                    {s.idx}
                  </span>
                  <span className="hidden md:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="w-4 md:w-8 h-px bg-gray-200" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
