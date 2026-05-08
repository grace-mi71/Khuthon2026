"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Mail } from "lucide-react";
import { StepHeader } from "@/components/layout/StepHeader";
import { HobbyCard } from "@/components/ui/HobbyCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Hobby } from "@/lib/types";

const HOBBIES: Hobby[] = ["독서", "영화", "음악", "여행", "운동", "요리", "게임", "미술"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StartPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미 로그인된 경우 추천 페이지로 이동
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.userId) router.replace("/recommendations");
      })
      .catch(() => {});
  }, [router]);

  const registerValid = EMAIL_RE.test(email) && selected.length > 0;
  const loginValid = EMAIL_RE.test(email);

  function toggle(h: Hobby) {
    setSelected((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  }

  function switchMode(next: "register" | "login") {
    setMode(next);
    setError(null);
  }

  async function onSubmit() {
    if (!registerValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hobbies: selected }),
      });
      if (res.status === 409) {
        setError("이미 가입된 이메일이에요. 로그인해보세요.");
        setMode("login");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "회원가입에 실패했습니다");
      }
      router.push("/chat");
    } catch (e) {
      setError(e instanceof Error ? e.message : "회원가입에 실패했습니다");
      setLoading(false);
    }
  }

  async function onLogin() {
    if (!loginValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "로그인에 실패했습니다");
      }
      router.push("/recommendations");
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인에 실패했습니다");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/30 via-white to-white pb-32">
      <StepHeader step={1} />

      <div className="pt-32 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-[36px] md:text-[48px] font-extrabold text-gray-900 leading-[1.3] mb-4">
            먼저, <span className="text-brand-600">당신을 알려주세요</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed">
            취향의 출발점을 함께 그려요. <br className="md:hidden" />
            마음 가는 영역을 자유롭게 골라주세요.
          </p>
        </div>

        {/* 탭 토글 */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-10 max-w-sm mx-auto">
          <button
            onClick={() => switchMode("register")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition",
              mode === "register"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            처음 오셨나요?
          </button>
          <button
            onClick={() => switchMode("login")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition",
              mode === "login"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            돌아오셨나요?
          </button>
        </div>

        {/* Email */}
        <section className="mb-12">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            이메일
          </label>
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-100 transition">
            <Mail size={20} className="text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="taste@tangil.app"
              className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-base bg-transparent"
              autoComplete="email"
            />
          </div>
        </section>

        {/* 관심 영역 — 회원가입 모드에서만 표시 */}
        {mode === "register" && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-gray-700">
                관심 영역 <span className="text-brand-600">(1개 이상)</span>
              </label>
              <span className="text-sm text-gray-400 font-semibold">
                {selected.length} / {HOBBIES.length} 선택
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {HOBBIES.map((h) => (
                <HobbyCard
                  key={h}
                  hobby={h}
                  selected={selected.includes(h)}
                  onToggle={toggle}
                />
              ))}
            </div>
          </section>
        )}

        {/* Submit */}
        <section className="flex flex-col items-center gap-4">
          {error && (
            <p className="text-sm text-rose-600 font-semibold bg-rose-50 px-4 py-2 rounded-full">
              {error}
            </p>
          )}
          {mode === "login" ? (
            <Button
              size="lg"
              onClick={onLogin}
              disabled={!loginValid || loading}
              className="flex items-center gap-3"
            >
              {loading ? "로그인 중…" : "이 이메일로 로그인하기"}
              <ChevronRight size={20} />
            </Button>
          ) : (
            <Button
              size="lg"
              disabled={!registerValid || loading}
              onClick={onSubmit}
              className="flex items-center gap-3"
            >
              {loading ? "취향 임베딩 생성 중…" : "취향 탐정과 대화하기"}
              <ChevronRight size={20} />
            </Button>
          )}
          <p className="text-xs text-gray-400">
            저장된 정보는 데모 목적으로만 사용됩니다.
          </p>
        </section>
      </div>
    </main>
  );
}
