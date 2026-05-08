"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { getMyGroups, type GroupSummary } from "@/lib/api-client";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sessRes = await fetch("/api/auth/session");
        if (!sessRes.ok) {
          router.replace("/start");
          return;
        }
        const sess = await sessRes.json();
        const r = await getMyGroups(sess.userId);
        setGroups(r.groups);
      } catch (e) {
        setError(e instanceof Error ? e.message : "그룹을 불러오지 못했습니다");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50/30 via-white to-white">
      <Header />

      <section className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-[36px] md:text-[48px] font-extrabold text-gray-900 leading-[1.3] mb-3">
            나의 <span className="text-brand-600">취향 그룹</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg font-medium">
            비슷한 결을 가진 사람들과 공연 이야기를 나눠보세요.
          </p>
        </div>

        {loading ? (
          <SkeletonList />
        ) : error ? (
          <p className="text-center text-rose-600 font-semibold bg-rose-50 px-4 py-3 rounded-full">
            {error}
          </p>
        ) : groups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <Users size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-bold text-gray-700 mb-2">아직 배정된 그룹이 없어요</p>
            <p className="text-gray-500 mb-8">취향 탐정과 대화를 마치면 자동으로 그룹이 만들어집니다.</p>
            <Link href="/chat">
              <Button>취향 탐정과 대화하기</Button>
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {groups.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/groups/${g.id}`}
                  className="block bg-white rounded-3xl border border-gray-100 p-6 hover:border-brand-300 hover:shadow-lg transition transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-brand-600">
                      <MessageCircle size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-extrabold text-gray-900 mb-1 truncate">
                        {g.name}
                      </h2>
                      <p className="text-sm text-gray-500 truncate">
                        {g.last_message ?? "아직 대화가 시작되지 않았어요"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end text-xs font-bold text-gray-400">
                      <span className="inline-flex items-center gap-1 text-brand-600">
                        <Users size={12} /> {g.member_count}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Footer />
    </main>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="bg-gray-50 rounded-3xl p-6 animate-pulse flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
