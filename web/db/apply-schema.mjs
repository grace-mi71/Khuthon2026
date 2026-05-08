// 딴길 — Postgres 스키마 적용
//
// 실행:
//   cd web && node --env-file=.env.local db/apply-schema.mjs
//
// schema.sql 을 세미콜론 단위로 split 해서 순차 실행합니다.
// CREATE TABLE / CREATE INDEX 모두 IF NOT EXISTS 라 멱등(여러 번 실행 안전).

import { sql } from "@vercel/postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "schema.sql");

console.log(`> 스키마 파일: ${schemaPath}`);
const schema = readFileSync(schemaPath, "utf-8");

// 1) 라인 단위 -- 주석 제거 → 2) 세미콜론 split → 3) 공백 trim → 4) 빈 문장 제거
const cleaned = schema
  .split("\n")
  .map((line) => line.replace(/--.*$/, ""))   // 인라인 주석 제거
  .join("\n");

const statements = cleaned
  .split(/;\s*$/m)
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`> ${statements.length} 개 문장 발견\n`);

let ok = 0;
let failed = 0;

for (const stmt of statements) {
  const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
  try {
    await sql.query(stmt);
    console.log(`  ✅ ${preview}...`);
    ok++;
  } catch (e) {
    console.error(`  ❌ ${preview}...`);
    console.error(`     ${e.message}`);
    failed++;
  }
}

console.log(`\n결과: 성공 ${ok}건 / 실패 ${failed}건`);

// 적용 확인 — 테이블 목록 조회
const { rows } = await sql.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`);
console.log(`\n현재 public 스키마 테이블:`);
for (const row of rows) console.log(`  • ${row.table_name}`);

if (failed > 0) process.exit(1);
