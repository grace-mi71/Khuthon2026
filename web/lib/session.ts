import { cookies } from "next/headers";
import { kv } from "@vercel/kv";
import type { UserProfile } from "./types";

export const SESSION_COOKIE = "tangil_session";
export const SESSION_TTL = 60 * 60 * 24 * 7; // 7일

export async function getSessionUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sess = await kv.get<{ userId: string }>(`session:${token}`);
  if (!sess) return null;
  return kv.get<UserProfile>(`user:${sess.userId}`);
}
