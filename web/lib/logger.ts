/**
 * 서버 사이드 로거.
 * Next.js Route Handler 에서 import해서 사용.
 * 로그는 stdout 에 JSON-line 형식으로 출력 → Vercel 대시보드에서 확인 가능.
 */

type Level = "debug" | "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: Level;
  module: string;
  msg: string;
  [key: string]: unknown;
}

const IS_PROD = process.env.NODE_ENV === "production";

function write(entry: LogEntry) {
  // prod: JSON 한 줄, dev: 가독성 있는 포맷
  if (IS_PROD) {
    process.stdout.write(JSON.stringify(entry) + "\n");
  } else {
    const { ts, level, module: mod, msg, ...rest } = entry;
    const extra = Object.keys(rest).length ? " " + JSON.stringify(rest) : "";
    const levelTag = level.toUpperCase().padEnd(5);
    console.log(`${ts} [${levelTag}] ${mod} — ${msg}${extra}`);
  }
}

export function createLogger(module: string) {
  const log = (level: Level, msg: string, extra?: Record<string, unknown>) => {
    write({
      ts: new Date().toISOString(),
      level,
      module,
      msg,
      ...extra,
    });
  };

  return {
    debug: (msg: string, extra?: Record<string, unknown>) => log("debug", msg, extra),
    info:  (msg: string, extra?: Record<string, unknown>) => log("info",  msg, extra),
    warn:  (msg: string, extra?: Record<string, unknown>) => log("warn",  msg, extra),
    error: (msg: string, extra?: Record<string, unknown>) => log("error", msg, extra),
  };
}
