"use client";

import { cn } from "@/lib/cn";
import type { TasteStep } from "@/lib/types";
import { STEP_LABELS } from "@/lib/types";

interface Props {
  step: TasteStep;
  onChange: (s: TasteStep) => void;
}

const STEPS: TasteStep[] = [1, 2, 3, 4, 5];

export function TasteSlider({ step, onChange }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3 text-sm font-semibold text-gray-500">
        <span>익숙함</span>
        <span>새로움</span>
      </div>
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-100 rounded-full -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-1.5 bg-brand-600 rounded-full -translate-y-1/2 transition-all"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {STEPS.map((s) => {
            const active = s === step;
            const reached = s <= step;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                className={cn(
                  "relative w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition",
                  reached ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-gray-200 text-gray-400",
                  active && "ring-4 ring-brand-100 scale-110"
                )}
                aria-label={`${s}단계 ${STEP_LABELS[s]}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-3 text-xs font-semibold text-gray-500">
        {STEPS.map((s) => (
          <span
            key={s}
            className={cn(
              "w-10 text-center transition",
              s === step ? "text-brand-600 font-extrabold" : ""
            )}
          >
            {STEP_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
