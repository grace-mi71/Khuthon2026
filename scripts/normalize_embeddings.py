"""
딴길 — embeddings.json 및 contents.json 의 모든 임베딩을 L2 정규화합니다.

원인: 노트북 결과물의 임베딩이 정규화되지 않은 상태로 저장됨 (norm ~ 10).
search.ts 는 정규화된 unit vector 가정 하에 cosine distance = 1 - dot 계산하므로
정규화 안 된 값으로는 거리가 음수로 발산합니다.

실행:
    python scripts/normalize_embeddings.py

후속 작업:
    python scripts/build_centroids.py  # genre_centroids.json 재생성
    (next dev 재기동 권장 — fs cache 무효화)
"""

import json
import numpy as np
from pathlib import Path
from logger import get_logger

log = get_logger("normalize_embeddings")

DATA = Path(__file__).parent.parent / "data"


def normalize_dict(d: dict[str, list[float]]) -> dict[str, list[float]]:
    out = {}
    for k, v in d.items():
        arr = np.array(v, dtype=np.float32)
        norm = np.linalg.norm(arr)
        if norm > 0:
            arr = arr / norm
        out[k] = arr.tolist()
    return out


def main():
    # embeddings.json
    emb_path = DATA / "embeddings.json"
    embeddings = json.loads(emb_path.read_text(encoding="utf-8"))
    sample = list(embeddings.values())[0]
    log.info("embeddings.json — 정규화 전 norm = %.4f", np.linalg.norm(sample))

    embeddings = normalize_dict(embeddings)
    emb_path.write_text(json.dumps(embeddings), encoding="utf-8")
    sample = list(embeddings.values())[0]
    log.info("embeddings.json — 정규화 후 norm = %.4f", np.linalg.norm(sample))

    # contents.json (perf['embedding'] 인라인)
    cnt_path = DATA / "contents.json"
    contents = json.loads(cnt_path.read_text(encoding="utf-8"))
    fixed = 0
    for pid, perf in contents.items():
        emb = perf.get("embedding")
        if not emb:
            continue
        arr = np.array(emb, dtype=np.float32)
        norm = np.linalg.norm(arr)
        if norm > 0:
            perf["embedding"] = (arr / norm).tolist()
        fixed += 1

    cnt_path.write_text(
        json.dumps(contents, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    log.info("contents.json — %d 건 임베딩 정규화 완료", fixed)
    log.info("✅ 후속: python scripts/build_centroids.py 로 centroid 재생성 권장")


if __name__ == "__main__":
    main()
