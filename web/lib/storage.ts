import type { Hobby } from "./types";

export interface SessionData {
  userId: string;
  embedding: string;          // base64
  email: string;
  hobbies: Hobby[];
  sensoryTags?: string[];
}

const KEY = "tangil:session";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveSession(data: SessionData): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function loadSession(): SessionData | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function updateSession(patch: Partial<SessionData>): SessionData | null {
  const cur = loadSession();
  if (!cur) return null;
  const next = { ...cur, ...patch };
  saveSession(next);
  return next;
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}
