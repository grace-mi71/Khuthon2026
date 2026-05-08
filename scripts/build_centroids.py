"""
딴길 — 장르 중심 벡터 생성

취미 기반 추천을 위해 장르별 임베딩 평균(centroid)을 계산합니다.

실행:
    python scripts/build_centroids.py

전제 조건:
    data/kopis_raw.json, data/embeddings.json 이 존재해야 합니다.

결과:
    data/genre_centroids.json — { "뮤지컬": [f32 × 768], "연극": [...], ... }
"""

import json
import numpy as np
from pathlib import Path
from collections import defaultdict
from logger import get_logger

log = get_logger("build_centroids")

DATA_DIR = Path(__file__).parent.parent / "data"

KOPIS_RAW_PATH    = DATA_DIR / "kopis_raw.json"
EMBEDDINGS_PATH   = DATA_DIR / "embeddings.json"
CENTROIDS_PATH    = DATA_DIR / "genre_centroids.json"


def build_centroids():
    log.info("performances 로드 중: %s", KOPIS_RAW_PATH)
    performances = json.loads(KOPIS_RAW_PATH.read_text(encoding="utf-8"))
    log.info("embeddings 로드 중: %s", EMBEDDINGS_PATH)
    embeddings   = json.loads(EMBEDDINGS_PATH.read_text(encoding="utf-8"))
    log.info("총 %d건 공연, %d건 임베딩 로드됨", len(performances), len(embeddings))

    genre_vecs = defaultdict(list)
    missing = 0
    for perf in performances:
        pid = perf["id"]
        vec = embeddings.get(pid)
        if vec is None:
            missing += 1
            log.debug("임베딩 없음 — perf_id=%s title=%.30s", pid, perf.get("title", ""))
            continue
        genre_vecs[perf["genre"]].append(vec)

    if missing:
        log.warning("임베딩 없는 공연 %d건 무시됨", missing)

    centroids = {}
    for genre, vecs in genre_vecs.items():
        arr = np.array(vecs, dtype=np.float32)
        centroid = arr.mean(axis=0)
        norm = np.linalg.norm(centroid)
        if norm > 0:
            centroid = centroid / norm
        else:
            log.warning("장르 %s: centroid norm=0 (L2 정규화 건너뜀)", genre)
        centroids[genre] = centroid.tolist()
        log.info("  %s: %d건 → centroid 생성 (dim=%d)", genre, len(vecs), len(centroid))

    CENTROIDS_PATH.write_text(
        json.dumps(centroids, ensure_ascii=False),
        encoding="utf-8"
    )
    log.info("✅ genre_centroids.json 생성 완료: %d개 장르 → %s", len(centroids), CENTROIDS_PATH)


if __name__ == "__main__":
    for path in [KOPIS_RAW_PATH, EMBEDDINGS_PATH]:
        if not path.exists():
            log.critical("필수 파일 없음: %s", path)
            raise SystemExit(1)

    log.info("=" * 50)
    log.info("딴길 — 장르 중심 벡터 생성")
    log.info("=" * 50)
    try:
        build_centroids()
    except Exception as e:
        log.critical("build_centroids 실패: %s", e, exc_info=True)
        raise
