"""
딴길 — trends.json 을 contents.json 에 머지

웹의 web/lib/search.ts 가 perf.trend.trend_score 를 읽어 hidden gem 보너스를
적용합니다. 별도로 보관하면 매 검색마다 두 파일 join 이 필요해지므로
contents.json 에 trend 필드를 인라인으로 추가합니다.

실행:
    python scripts/merge_trends.py

전제 조건:
    data/contents.json, data/trends.json 모두 존재해야 함.
"""

import json
from pathlib import Path
from logger import get_logger

log = get_logger("merge_trends")

DATA = Path(__file__).parent.parent / "data"
CONTENTS_PATH = DATA / "contents.json"
TRENDS_PATH   = DATA / "trends.json"


def main():
    if not CONTENTS_PATH.exists():
        raise SystemExit(f"오류: {CONTENTS_PATH} 가 없습니다.")
    if not TRENDS_PATH.exists():
        raise SystemExit(f"오류: {TRENDS_PATH} 가 없습니다.")

    contents = json.loads(CONTENTS_PATH.read_text(encoding="utf-8"))
    trends   = json.loads(TRENDS_PATH.read_text(encoding="utf-8"))
    log.info("로드 완료 — contents %d건, trends %d건", len(contents), len(trends))

    merged = 0
    no_trend = 0
    for pid, perf in contents.items():
        if pid in trends:
            perf["trend"] = trends[pid]
            merged += 1
        else:
            no_trend += 1

    CONTENTS_PATH.write_text(
        json.dumps(contents, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    avg_trend = (
        sum(t["trend_score"] for t in trends.values()) / len(trends)
        if trends else 0.0
    )
    log.info("머지 완료 — %d건 갱신, %d건 트렌드 데이터 없음", merged, no_trend)
    log.info("trends.json 평균 trend_score: %.4f", avg_trend)


if __name__ == "__main__":
    main()
