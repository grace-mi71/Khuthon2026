// 딴길 — KV + Postgres 연결 핑
//
// 실행:
//   cd web && node --env-file=.env.local db/ping.mjs

import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";

let kvOk = false;
let pgOk = false;

// ── Vercel KV (Upstash) ─────────────────────────────────────────────
try {
  console.log("[KV] set/get 테스트...");
  const value = `hello-${Date.now()}`;
  await kv.set("ping:test", value);
  const got = await kv.get("ping:test");
  console.log(`  요청 값: ${value}`);
  console.log(`  응답 값: ${got}`);
  if (got === value) {
    console.log("  ✅ KV 정상");
    kvOk = true;
  } else {
    console.log("  ❌ KV 값 불일치");
  }
  await kv.del("ping:test");
} catch (e) {
  console.error(`  ❌ KV 오류: ${e.message}`);
}

// ── Vercel Postgres (Neon) ──────────────────────────────────────────
try {
  console.log("\n[Postgres] SELECT 1 + 테이블 확인...");
  const { rows: meta } = await sql`SELECT 1 as ok, NOW() as now`;
  console.log(`  서버 시간: ${meta[0].now}`);

  const { rows: tables } = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log(`  테이블 ${tables.length}개:`);
  for (const t of tables) console.log(`    • ${t.table_name}`);

  const expected = new Set(["groups", "group_members", "messages", "reviews"]);
  const have = new Set(tables.map((t) => t.table_name));
  const missing = [...expected].filter((t) => !have.has(t));
  if (missing.length === 0) {
    console.log("  ✅ Postgres 정상 (필수 테이블 모두 존재)");
    pgOk = true;
  } else {
    console.log(`  ❌ 누락 테이블: ${missing.join(", ")}`);
  }
} catch (e) {
  console.error(`  ❌ Postgres 오류: ${e.message}`);
}

console.log(`\n결과: KV=${kvOk ? "OK" : "FAIL"} / Postgres=${pgOk ? "OK" : "FAIL"}`);
process.exit(kvOk && pgOk ? 0 : 1);
