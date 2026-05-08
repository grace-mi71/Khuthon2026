import path from "path";
import fs from "fs";
import type { Performance } from "./types";

// contents.json 은 빌드 타임에 읽어서 메모리에 캐시
let _cache: Performance[] | null = null;

export function loadContents(): Performance[] {
  if (_cache) return _cache;

  const filePath = path.join(process.cwd(), "..", "data", "contents.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const map: Record<string, Performance> = JSON.parse(raw);
  _cache = Object.values(map);
  return _cache;
}

/** L2 정규화된 두 벡터의 코사인 거리 (0=동일, 2=정반대) */
export function cosineDist(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  // normalize_embeddings=True 로 생성했으므로 |a|=|b|=1 → dist = 1 - dot
  return 1 - dot;
}

/** 768차원 벡터를 base64 문자열로 인코딩 (Float32 little-endian) */
export function encodeEmbedding(vec: number[]): string {
  const buf = Buffer.allocUnsafe(vec.length * 4);
  for (let i = 0; i < vec.length; i++) buf.writeFloatLE(vec[i], i * 4);
  return buf.toString("base64");
}

/** base64 → Float32 벡터 디코딩 */
export function decodeEmbedding(b64: string): number[] {
  const buf = Buffer.from(b64, "base64");
  const out: number[] = new Array(buf.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = buf.readFloatLE(i * 4);
  return out;
}

/** 두 벡터의 가중 평균 (tasteEmbedding 업데이트에 사용) */
export function blendEmbeddings(
  current: number[],
  delta: number[],
  newWeight = 0.3
): number[] {
  const blended = current.map((v, i) => v * (1 - newWeight) + delta[i] * newWeight);
  // L2 정규화
  const norm = Math.sqrt(blended.reduce((s, v) => s + v * v, 0));
  return norm > 0 ? blended.map((v) => v / norm) : blended;
}
