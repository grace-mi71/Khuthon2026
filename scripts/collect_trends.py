"""
딴길 — 트렌드 데이터 수집

Naver News/Blog API + YouTube Data API v3 를 사용해
공연별 트렌드 점수를 계산합니다.

실행:
    python scripts/collect_trends.py

API 키 설정: 프로젝트 루트의 .env 파일에 다음 항목을 추가하세요.
    NAVER_CLIENT_ID=...
    NAVER_CLIENT_SECRET=...
    YOUTUBE_API_KEY=...

결과:
    data/trends.json — { "perf_id": { "trend_score": 0.72, "news": 14, "blogs": 31, "yt_views": 18400 } }
"""

import json
import math
import os
import time
import requests
from datetime import datetime, timedelta
from pathlib import Path
from tqdm import tqdm
from dotenv import load_dotenv
from logger import get_logger

# 프로젝트 루트의 .env 로드 (scripts/ 한 단계 위)
load_dotenv(Path(__file__).parent.parent / ".env")

log = get_logger("collect_trends")

# ── 설정 ──────────────────────────────────────────────────────────────
NAVER_CLIENT_ID     = os.environ.get("NAVER_CLIENT_ID", "")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET", "")
YOUTUBE_API_KEY     = os.environ.get("YOUTUBE_API_KEY", "")

DATA_DIR       = Path(__file__).parent.parent / "data"
KOPIS_RAW_PATH = DATA_DIR / "kopis_raw.json"
TRENDS_PATH    = DATA_DIR / "trends.json"

NAVER_NEWS_URL = "https://openapi.naver.com/v1/search/news.json"
NAVER_BLOG_URL = "https://openapi.naver.com/v1/search/blog.json"
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

SEARCH_DAYS = 30  # 최근 30일 이내 결과만 집계


# ── 날짜 필터 헬퍼 ────────────────────────────────────────────────────

def is_recent(date_str: str) -> bool:
    """Naver API pubDate 또는 ISO 날짜가 최근 SEARCH_DAYS 이내인지 확인"""
    cutoff = datetime.now() - timedelta(days=SEARCH_DAYS)
    for fmt in ("%a, %d %b %Y %H:%M:%S +0900", "%Y-%m-%dT%H:%M:%S+09:00",
                "%Y-%m-%d", "%Y.%m.%d."):
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return dt >= cutoff
        except ValueError:
            continue
    return True  # 파싱 불가면 포함


# ── Naver 검색 ────────────────────────────────────────────────────────

def _naver_headers():
    return {
        "X-Naver-Client-Id":     NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    }

def naver_count(url: str, query: str) -> int:
    """Naver API 에서 최근 SEARCH_DAYS 이내 결과 수 반환"""
    count = 0
    try:
        resp = requests.get(
            url,
            headers=_naver_headers(),
            params={"query": query, "display": 100, "start": 1, "sort": "date"},
            timeout=10
        )
        log.debug("Naver API url=%s query=%r status=%d", url, query, resp.status_code)
        if resp.status_code != 200:
            log.warning("Naver API 오류 — url=%s query=%r status=%d body=%.200s",
                        url, query, resp.status_code, resp.text)
            return 0
        items = resp.json().get("items", [])
        for item in items:
            pub = item.get("pubDate", item.get("postdate", ""))
            if is_recent(pub):
                count += 1
    except requests.exceptions.Timeout:
        log.error("Naver API 타임아웃 — url=%s query=%r", url, query)
    except Exception as e:
        log.error("Naver API 예외 — url=%s query=%r: %s", url, query, e, exc_info=True)
    return count


# ── YouTube 검색 ──────────────────────────────────────────────────────

def youtube_stats(query: str) -> int:
    """YouTube에서 쿼리 관련 영상의 총 조회수 합산"""
    try:
        search_resp = requests.get(
            YOUTUBE_SEARCH_URL,
            params={
                "q":                 query,
                "type":              "video",
                "key":               YOUTUBE_API_KEY,
                "part":              "id",
                "maxResults":        5,
                "relevanceLanguage": "ko",
            },
            timeout=10
        )
        log.debug("YouTube search query=%r status=%d", query, search_resp.status_code)
        if search_resp.status_code != 200:
            log.warning("YouTube search 오류 — query=%r status=%d body=%.200s",
                        query, search_resp.status_code, search_resp.text)
            return 0

        items = search_resp.json().get("items", [])
        video_ids = [i["id"]["videoId"] for i in items if "videoId" in i.get("id", {})]
        if not video_ids:
            log.debug("YouTube 검색 결과 없음 — query=%r", query)
            return 0

        stats_resp = requests.get(
            YOUTUBE_VIDEOS_URL,
            params={
                "id":   ",".join(video_ids),
                "key":  YOUTUBE_API_KEY,
                "part": "statistics",
            },
            timeout=10
        )
        if stats_resp.status_code != 200:
            log.warning("YouTube stats 오류 — ids=%s status=%d", video_ids, stats_resp.status_code)
            return 0

        total_views = 0
        for item in stats_resp.json().get("items", []):
            views = item.get("statistics", {}).get("viewCount", "0")
            total_views += int(views)
        log.debug("YouTube 조회수 합산 query=%r total_views=%d", query, total_views)
        return total_views

    except requests.exceptions.Timeout:
        log.error("YouTube API 타임아웃 — query=%r", query)
        return 0
    except Exception as e:
        log.error("YouTube API 예외 — query=%r: %s", query, e, exc_info=True)
        return 0


# ── 트렌드 점수 계산 ──────────────────────────────────────────────────

def compute_trend_score(news: int, blogs: int, yt_views: int) -> float:
    """
    log-scale 조합으로 0~1 범위 trend_score 계산.
    가중치: 뉴스 40%, 블로그 30%, 유튜브 조회수 30%
    """
    score = (
        0.4 * math.log1p(news) +
        0.3 * math.log1p(blogs) +
        0.3 * math.log1p(yt_views / 1000)
    ) / 10.0
    return round(min(score, 1.0), 4)


# ── 메인 ──────────────────────────────────────────────────────────────

def collect_trends():
    log.info("공연 데이터 로드 중: %s", KOPIS_RAW_PATH)
    performances = json.loads(KOPIS_RAW_PATH.read_text(encoding="utf-8"))

    if TRENDS_PATH.exists():
        trends = json.loads(TRENDS_PATH.read_text(encoding="utf-8"))
        done_ids = set(trends.keys())
        log.info("재개 — 기완료 %d건, 잔여 %d건", len(done_ids), len(performances) - len(done_ids))
    else:
        trends = {}
        done_ids = set()
        log.info("신규 수집 시작 — 총 %d건", len(performances))

    remaining = [p for p in performances if p["id"] not in done_ids]

    use_naver   = NAVER_CLIENT_ID     != "여기에_네이버_CLIENT_ID_입력"
    use_youtube = YOUTUBE_API_KEY     != "여기에_유튜브_API_KEY_입력"

    if not use_naver:
        log.warning("Naver API 키 미설정 — news/blog 수집 생략 (trend_score 정확도 저하)")
    if not use_youtube:
        log.warning("YouTube API 키 미설정 — 조회수 수집 생략 (trend_score 정확도 저하)")

    for perf in tqdm(remaining, desc="  트렌드 수집", unit="건"):
        pid   = perf["id"]
        query = f"{perf['title']} 공연"

        news_count  = naver_count(NAVER_NEWS_URL, query) if use_naver   else 0
        blog_count  = naver_count(NAVER_BLOG_URL, query) if use_naver   else 0
        yt_views    = youtube_stats(query)                if use_youtube else 0

        score = compute_trend_score(news_count, blog_count, yt_views)
        trends[pid] = {
            "trend_score": score,
            "news":        news_count,
            "blogs":       blog_count,
            "yt_views":    yt_views,
        }
        log.debug("perf_id=%s query=%r news=%d blogs=%d yt_views=%d score=%.4f",
                  pid, query, news_count, blog_count, yt_views, score)

        time.sleep(0.5)

        if len(trends) % 50 == 0:
            TRENDS_PATH.write_text(
                json.dumps(trends, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )
            log.info("중간 저장 완료 (%d건)", len(trends))

    TRENDS_PATH.write_text(
        json.dumps(trends, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    scored = sum(1 for v in trends.values() if v["trend_score"] > 0)
    avg    = sum(v["trend_score"] for v in trends.values()) / len(trends) if trends else 0
    log.info("✅ 트렌드 수집 완료: %d건 (점수>0: %d건, 평균: %.3f) → %s",
             len(trends), scored, avg, TRENDS_PATH)


if __name__ == "__main__":
    if not KOPIS_RAW_PATH.exists():
        log.critical("필수 파일 없음: %s", KOPIS_RAW_PATH)
        raise SystemExit(1)

    log.info("=" * 50)
    log.info("딴길 — 트렌드 데이터 수집 (최근 %d일)", SEARCH_DAYS)
    log.info("=" * 50)
    try:
        collect_trends()
    except Exception as e:
        log.critical("collect_trends 실패: %s", e, exc_info=True)
        raise
