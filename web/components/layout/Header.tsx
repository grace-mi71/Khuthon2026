"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/storage";

export function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUserEmail(data?.email ?? null))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearSession();
    setUserEmail(null);
    router.push("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-brand-600 tracking-tighter">
          딴길
        </Link>
        <nav className="hidden md:flex gap-10 text-[15px] font-semibold text-gray-600">
          <Link href="/recommendations" className="hover:text-brand-600 transition">취향 탐색</Link>
          <Link href="/chat" className="hover:text-brand-600 transition">취향 탐정</Link>
          <Link href="/groups" className="hover:text-brand-600 transition">취향 그룹</Link>
        </nav>
        {userEmail ? (
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-500 font-medium truncate max-w-[180px]">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="text-[15px] font-bold bg-gray-100 text-gray-600 px-6 py-2.5 rounded-full hover:bg-gray-200 transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            href="/start"
            className="text-[15px] font-bold bg-brand-50 text-brand-600 px-6 py-2.5 rounded-full hover:bg-brand-100 transition"
          >
            시작하기
          </Link>
        )}
      </div>
    </header>
  );
}
