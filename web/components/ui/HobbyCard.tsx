"use client";

import { cn } from "@/lib/cn";
import {
  BookOpen, Film, Music, Plane, Dumbbell, ChefHat, Gamepad2, Palette,
  type LucideIcon,
} from "lucide-react";
import type { Hobby } from "@/lib/types";

const ICONS: Record<Hobby, LucideIcon> = {
  독서: BookOpen,
  영화: Film,
  음악: Music,
  여행: Plane,
  운동: Dumbbell,
  요리: ChefHat,
  게임: Gamepad2,
  미술: Palette,
};

const DESCRIPTIONS: Record<Hobby, string> = {
  독서: "텍스트의 결을 좋아해요",
  영화: "장면의 호흡에 끌려요",
  음악: "공기를 채우는 소리를 좋아해요",
  여행: "낯선 풍경에서 자유로워요",
  운동: "몸을 움직일 때 살아 있어요",
  요리: "감각을 깨우는 맛이 좋아요",
  게임: "이야기 속 몰입을 즐겨요",
  미술: "색과 형태에 끌려요",
};

interface Props {
  hobby: Hobby;
  selected: boolean;
  onToggle: (h: Hobby) => void;
}

export function HobbyCard({ hobby, selected, onToggle }: Props) {
  const Icon = ICONS[hobby];
  return (
    <button
      type="button"
      onClick={() => onToggle(hobby)}
      className={cn(
        "relative text-left p-6 rounded-3xl border-2 transition transform hover:-translate-y-1",
        selected
          ? "border-brand-600 bg-brand-50 shadow-md"
          : "border-gray-200 bg-white hover:border-brand-300"
      )}
      aria-pressed={selected}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition",
          selected ? "bg-brand-600 text-white" : "bg-gray-50 text-gray-400"
        )}
      >
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{hobby}</h3>
      <p className="text-sm text-gray-500 font-medium leading-snug">{DESCRIPTIONS[hobby]}</p>
      {selected && (
        <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">
          ✓
        </span>
      )}
    </button>
  );
}
