"""
딴길 — 임베딩 마이크로서비스 (FastAPI)

Next.js /api/chat/finalize 에서 서버사이드 임베딩 생성 시 호출합니다.

실행:
    pip install fastapi uvicorn sentence-transformers torch
    python scripts/embed_server.py

기본 포트: 8765
환경변수 EMBED_SERVER_URL=http://localhost:8765 을 Next.js 에 설정하세요.
"""

import os
import time
import torch
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from logger import get_logger

log = get_logger("embed_server")

app = FastAPI(title="딴길 임베딩 서버")
device = "cuda" if torch.cuda.is_available() else "cpu"

log.info("모델 로딩 중 (device=%s)...", device)
model = SentenceTransformer("jhgan/ko-sroberta-multitask", device=device)
log.info("임베딩 서버 준비 완료 (device=%s)", device)


class EmbedRequest(BaseModel):
    text: str


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("처리되지 않은 예외 — path=%s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"error": str(exc)})


@app.post("/embed")
def embed(req: EmbedRequest):
    if not req.text or not req.text.strip():
        log.warning("빈 텍스트 요청 거부")
        raise HTTPException(status_code=400, detail="text 가 비어 있습니다")

    t0 = time.perf_counter()
    vec = model.encode(
        [req.text],
        normalize_embeddings=True,
        convert_to_numpy=True,
    )[0]
    elapsed = (time.perf_counter() - t0) * 1000
    log.debug("임베딩 생성 완료 — text_len=%d dim=%d elapsed=%.1fms",
              len(req.text), len(vec), elapsed)
    return {"embedding": vec.tolist(), "dim": len(vec)}


@app.get("/health")
def health():
    return {"status": "ok", "device": device}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("EMBED_PORT", 8765))
    uvicorn.run(app, host="0.0.0.0", port=port)
