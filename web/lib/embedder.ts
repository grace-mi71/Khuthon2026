/**
 * 서버 사이드 임베딩 생성기.
 *
 * 방법 1 (권장): Python microservice 호출
 *   - scripts/embed_server.py 를 별도 프로세스로 실행
 *   - EMBED_SERVER_URL 환경변수에 URL 설정
 *
 * 방법 2 (fallback): Vercel Edge 에서는 불가하므로 무조건 외부 서비스 필요
 */

const EMBED_SERVER_URL = process.env.EMBED_SERVER_URL ?? "http://localhost:8765";

export const SentenceTransformerEmbedder = {
  async embed(text: string): Promise<number[]> {
    const resp = await fetch(`${EMBED_SERVER_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) throw new Error(`embed server error: ${resp.status}`);
    const { embedding } = await resp.json();
    return embedding as number[];
  },
};
