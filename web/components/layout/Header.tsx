"use client";

import Link from "next/link";

export function Header() {
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
        <Link
          href="/start"
          className="text-[15px] font-bold bg-brand-50 text-brand-600 px-6 py-2.5 rounded-full hover:bg-brand-100 transition"
        >
          시작하기
        </Link>
      </div>
    </header>
  );
}
