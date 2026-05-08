"""
딴길 데이터 파이프라인 — 로컬 H100 서버용

실행:
    pip install anthropic sentence-transformers tqdm requests
    python scripts/run_pipeline.py

결과: data/ 폴더에 kopis_raw.json, profiles.json, embeddings.json, contents.json 생성
"""

import requests
import xml.etree.ElementTree as ET
import json
import time
import os
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter
from tqdm import tqdm
import anthropic
import torch
from sentence_transformers import SentenceTransformer
from logger import get_logger

log = get_logger("run_pipeline")

# ── 설정 ──────────────────────────────────────────────────────────────
KOPIS_KEY     = "여기에_KOPIS_API_키_입력"
ANTHROPIC_KEY = "여기에_ANTHROPIC_API_키_입력"

DATA_DIR  = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

KOPIS_RAW_PATH   = DATA_DIR / "kopis_raw.json"
PROFILES_PATH    = DATA_DIR / "profiles.json"
EMBEDDINGS_PATH  = DATA_DIR / "embeddings.json"
CONTENTS_PATH    = DATA_DIR / "contents.json"

BASE_URL = "http://kopis.or.kr/openApi/restful"

GENRE_CODES = {
    "뮤지컬":     "GGGA",
    "연극":       "AAAA",
    "음악":       "CCCA",
    "무용":       "BBBC",
    "국악":       "CCCC",
    "서커스/마술": "EEEB",
}

TARGETS = {
    "뮤지컬":     90,
    "연극":       75,
    "음악":       60,
    "무용":       30,
    "국악":       30,
    "서커스/마술": 15,
}

SAVE_INTERVAL = 50   # 프로파일링 중간 저장 간격
EMBED_BATCH   = 256  # H100 80GB 기준 배치 사이즈 (768차원 × 256 = 여유)


# ── 1. KOPIS 수집 ─────────────────────────────────────────────────────

def safe_xml_parse(content):
    try:
        return ET.fromstring(content)
    except ET.ParseError as e:
        log.warning("XML 파싱 실패 — %s (content 앞 200자: %s)", e, content[:200])
        return None

def fetch_list(genre_code, rows=100, page=1, stdate=None, eddate=None):
    params = {
        "service": KOPIS_KEY,
        "stdate":  stdate,
        "eddate":  eddate,
        "cpage":   page,
        "rows":    rows,
        "shcate":  genre_code,
    }
    try:
        resp = requests.get(f"{BASE_URL}/pblprfr", params=params, timeout=10)
        log.debug("fetch_list genre=%s page=%d status=%d", genre_code, page, resp.status_code)
        root = safe_xml_parse(resp.content)
        return root.findall(".//db") if root is not None else []
    except requests.exceptions.Timeout:
        log.error("fetch_list 타임아웃 — genre=%s page=%d", genre_code, page)
        return []
    except Exception as e:
        log.error("fetch_list 예외 — genre=%s page=%d: %s", genre_code, page, e, exc_info=True)
        return []

def fetch_detail(perf_id):
    try:
        resp = requests.get(
            f"{BASE_URL}/pblprfr/{perf_id}",
            params={"service": KOPIS_KEY},
            timeout=10
        )
        log.debug("fetch_detail perf_id=%s status=%d", perf_id, resp.status_code)
        root = safe_xml_parse(resp.content)
        if root is None:
            log.warning("fetch_detail XML 없음 — perf_id=%s", perf_id)
            return {}
        db = root.find(".//db")
        if db is None:
            log.warning("fetch_detail <db> 없음 — perf_id=%s", perf_id)
            return {}
        return {
            "description": db.findtext("sty", ""),
            "cast":        db.findtext("prfcast", ""),
            "price":       db.findtext("pcseguidance", ""),
            "age_rating":  db.findtext("prfage", ""),
            "runtime":     db.findtext("prfruntime", ""),
            "venue_id":    db.findtext("mt10id", ""),
        }
    except requests.exceptions.Timeout:
        log.error("fetch_detail 타임아웃 — perf_id=%s", perf_id)
        return {}
    except Exception as e:
        log.error("fetch_detail 예외 — perf_id=%s: %s", perf_id, e, exc_info=True)
        return {}

def fetch_venue(venue_id):
    if not venue_id:
        return {}
    try:
        resp = requests.get(
            f"{BASE_URL}/prfplc/{venue_id}",
            params={"service": KOPIS_KEY},
            timeout=10
        )
        log.debug("fetch_venue venue_id=%s status=%d", venue_id, resp.status_code)
        root = safe_xml_parse(resp.content)
        if root is None:
            log.warning("fetch_venue XML 없음 — venue_id=%s", venue_id)
            return {}
        db = root.find(".//db")
        if db is None:
            log.warning("fetch_venue <db> 없음 — venue_id=%s", venue_id)
            return {}
        seats_raw = db.findtext("seatscale", "0").replace(",", "")
        return {
            "venue_seats":   int(seats_raw) if seats_raw.isdigit() else 0,
            "venue_address": db.findtext("adres", ""),
            "venue_lat":     db.findtext("la", ""),
            "venue_lng":     db.findtext("lo", ""),
        }
    except requests.exceptions.Timeout:
        log.error("fetch_venue 타임아웃 — venue_id=%s", venue_id)
        return {}
    except Exception as e:
        log.error("fetch_venue 예외 — venue_id=%s: %s", venue_id, e, exc_info=True)
        return {}

def collect_kopis():
    if KOPIS_RAW_PATH.exists():
        log.info("[1/4] kopis_raw.json 이미 존재 — 건너뜀 (%s)", KOPIS_RAW_PATH)
        return

    log.info("[1/4] KOPIS 데이터 수집 시작")

    end_date   = datetime.today()
    start_date = end_date - timedelta(days=180)
    stdate = start_date.strftime("%Y%m%d")
    eddate = end_date.strftime("%Y%m%d")

    all_performances = []
    seen_ids = set()
    total_target = sum(TARGETS.values())
    overall_bar = tqdm(total=total_target, desc="  전체", unit="건")

    for genre_name, genre_code in GENRE_CODES.items():
        target    = TARGETS[genre_name]
        collected = 0
        page      = 1
        genre_bar = tqdm(total=target, desc=f"  {genre_name}", unit="건", leave=False)

        while collected < target:
            items = fetch_list(genre_code, rows=min(100, target - collected + 10),
                               page=page, stdate=stdate, eddate=eddate)
            if not items:
                break

            for item in items:
                if collected >= target:
                    break
                perf_id = item.findtext("mt20id", "")
                if not perf_id or perf_id in seen_ids:
                    continue

                title = item.findtext("prfnm", "")
                perf = {
                    "id":         perf_id,
                    "title":      title,
                    "genre":      genre_name,
                    "start_date": item.findtext("prfpdfrom", ""),
                    "end_date":   item.findtext("prfpdto", ""),
                    "venue_name": item.findtext("fcltynm", ""),
                    "poster_url": item.findtext("poster", ""),
                    "region":     item.findtext("area", ""),
                    "state":      item.findtext("prfstate", ""),
                }

                detail = fetch_detail(perf_id)
                perf.update(detail)
                venue = fetch_venue(detail.get("venue_id", ""))
                perf.update(venue)

                all_performances.append(perf)
                seen_ids.add(perf_id)
                collected += 1

                genre_bar.set_postfix_str(title[:20])
                genre_bar.update(1)
                overall_bar.update(1)
                time.sleep(0.3)

            page += 1
            if page > 10:
                break

        genre_bar.close()

    overall_bar.close()

    KOPIS_RAW_PATH.write_text(
        json.dumps(all_performances, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    log.info("  ✅ %d건 수집 완료 → %s", len(all_performances), KOPIS_RAW_PATH)


# ── 2. LLM 프로파일링 ─────────────────────────────────────────────────

PROFILING_SYSTEM = """당신은 공연예술 비평가이자 관객 심리 분석가입니다.
주어진 공연 정보를 분석하여 아래 JSON 형식으로 응답하세요.
JSON 외 다른 텍스트는 포함하지 마세요.

분석 원칙:
1. "장르"가 아니라 "이 공연이 관객에게 주는 감각 경험"을 서술하세요.
2. 이 공연과 감각적으로 연결되는 대중 콘텐츠를 2~3개 떠올리고,
   "같은 욕망이 다른 형식으로 충족되는 관계"를 설명하세요.
3. 대중성 스펙트럼 위치를 1(매우 대중적)~10(매우 실험적)으로 판단하세요.

{
  "desire_profile": {
    "core_desire": "이 공연이 만족시키는 핵심 욕망 (1문장)",
    "sensory_experience": "관객이 느끼는 감각적 경험 (1문장)",
    "emotional_payoff": "관람 후 남는 감정 (1문장)"
  },
  "mainstream_bridges": [
    {
      "mainstream_name": "연결 가능한 대중 콘텐츠명",
      "shared_desire": "공유하는 욕망 (1문장)",
      "key_difference": "형식적 차이 (1문장)"
    }
  ],
  "sensory_tags": ["감각 태그 5~8개"],
  "emotion_tags": ["감정 태그 2~4개"],
  "spectrum_position": 1,
  "entry_level": "쉬움/보통/어려움",
  "solo_friendly": true,
  "reason_hidden": "기존 플랫폼에서 덜 노출된 이유 (1문장)"
}"""

def profile_performance(client, perf):
    desc = perf.get("description", "").strip()  # strip으로 공백만 있는 경우 처리
    if not desc or len(desc) < 10:
        desc = f"{perf['genre']} 공연"

    user_msg = (
        f"공연명: {perf['title']}\n"
        f"장르: {perf['genre']}\n"
        f"소개: {desc[:500]}\n"
        f"공연장: {perf.get('venue_name', '')} ({perf.get('venue_seats', '정보없음')}석)\n"
        f"지역: {perf.get('region', '')}\n"
        f"가격: {perf.get('price', '정보없음')}"
    )

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2000,
        system=PROFILING_SYSTEM,
        messages=[{"role": "user", "content": user_msg}]
    )

    if not response.content:
        raise ValueError(f"빈 응답 (content 없음) — stop_reason: {response.stop_reason}")

    raw = response.content[0].text.strip()

    if not raw:
        log.error(
            "빈 응답 텍스트 — perf_id=%s stop_reason=%s usage=%s",
            perf.get("id"), response.stop_reason, response.usage
        )
        raise ValueError(f"빈 응답 텍스트 — stop_reason: {response.stop_reason}, usage: {response.usage}")

    if raw.startswith("```"):
        lines = raw.splitlines()
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        log.error(
            "JSON 파싱 실패 — perf_id=%s error=%s raw_length=%d raw_snippet=%.200s",
            perf.get("id"), e, len(raw), raw
        )
        raise

def profile_with_retry(client, perf, retries=2):
    for attempt in range(retries + 1):
        try:
            return profile_performance(client, perf)
        except Exception as e:
            log.warning(
                "프로파일링 실패 [%d/%d] perf_id=%s title=%.30s — %s",
                attempt + 1, retries + 1, perf.get("id"), perf.get("title", ""), e
            )
            if attempt < retries:
                wait = 2 ** attempt
                log.info("  재시도 대기 %ds...", wait)
                time.sleep(wait)
            else:
                log.error(
                    "프로파일링 최종 실패 perf_id=%s: %s",
                    perf.get("id"), e, exc_info=True
                )
                raise e

def run_profiling():
    performances = json.loads(KOPIS_RAW_PATH.read_text(encoding="utf-8"))
    log.info("[2/4] 프로파일링 준비 — 총 %d건", len(performances))

    if PROFILES_PATH.exists():
        profiles = json.loads(PROFILES_PATH.read_text(encoding="utf-8"))
        done_ids = {k for k, v in profiles.items() if v is not None}
        log.info("[2/4] 프로파일링 재개 — 기완료 %d건, 잔여 %d건", len(done_ids), len(performances) - len(done_ids))
    else:
        profiles = {}
        done_ids = set()
        log.info("[2/4] 프로파일링 시작 — %d건", len(performances))

    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    failed = []

    remaining = [p for p in performances if p["id"] not in done_ids]

    for i, perf in enumerate(tqdm(remaining, desc="  프로파일링", unit="건")):
        tqdm.write(f"  → {perf['title'][:35]}")
        try:
            profile = profile_with_retry(client, perf)
            profiles[perf["id"]] = profile
            log.debug("프로파일링 성공 perf_id=%s", perf["id"])
        except Exception as e:
            failed.append(perf["id"])
            profiles[perf["id"]] = None
            log.error("프로파일링 포기 perf_id=%s title=%.40s: %s", perf["id"], perf.get("title",""), e)
        time.sleep(0.5)

        if (i + 1) % SAVE_INTERVAL == 0:
            PROFILES_PATH.write_text(
                json.dumps(profiles, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )
            log.info("중간 저장 완료 (%d건)", len(profiles))

    PROFILES_PATH.write_text(
        json.dumps(profiles, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    success = len(performances) - len(failed)
    log.info("✅ 프로파일링 완료: %d/%d건 → %s", success, len(performances), PROFILES_PATH)
    if failed:
        log.warning("실패 %d건 (null 저장됨): %s", len(failed), failed)


# ── 3. 임베딩 생성 ────────────────────────────────────────────────────

def build_embedding_text(perf, profile):
    parts = [
        f"공연: {perf['title']}",
        f"장르: {perf['genre']}",
        f"소개: {perf.get('description', '')[:300]}",
    ]
    if profile:
        dp = profile.get("desire_profile", {})
        parts.extend([
            f"핵심 욕망: {dp.get('core_desire', '')}",
            f"감각 경험: {dp.get('sensory_experience', '')}",
            f"감정: {dp.get('emotional_payoff', '')}",
        ])
        for bridge in profile.get("mainstream_bridges", []):
            parts.append(
                f"대중 연결: {bridge.get('mainstream_name', '')} — "
                f"{bridge.get('shared_desire', '')}"
            )
        tags = profile.get("sensory_tags", [])
        if tags:
            parts.append(f"감각: {', '.join(tags)}")
    return " | ".join(parts)

def run_embedding():
    if EMBEDDINGS_PATH.exists():
        log.info("[3/4] embeddings.json 이미 존재 — 건너뜀 (%s)", EMBEDDINGS_PATH)
        return

    log.info("[3/4] 임베딩 생성 시작")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cuda":
        gpu_name = torch.cuda.get_device_name(0)
        log.info("  GPU: %s", gpu_name)
    else:
        log.warning("  GPU 없음 — CPU 모드로 실행 (속도 매우 느림)")

    embed_model = SentenceTransformer("jhgan/ko-sroberta-multitask", device=device)

    performances = json.loads(KOPIS_RAW_PATH.read_text(encoding="utf-8"))
    profiles     = json.loads(PROFILES_PATH.read_text(encoding="utf-8"))

    texts = []
    ids   = []
    for perf in performances:
        profile = profiles.get(perf["id"])
        texts.append(build_embedding_text(perf, profile))
        ids.append(perf["id"])

    log.info("  %d건 임베딩 생성 중 (batch=%d)...", len(texts), EMBED_BATCH)
    embeddings = embed_model.encode(
        texts,
        batch_size=EMBED_BATCH,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    embedding_map = {pid: emb.tolist() for pid, emb in zip(ids, embeddings)}

    EMBEDDINGS_PATH.write_text(json.dumps(embedding_map), encoding="utf-8")
    dim = len(next(iter(embedding_map.values())))
    log.info("  ✅ 임베딩 완료: %d건, %d차원 → %s", len(embedding_map), dim, EMBEDDINGS_PATH)


# ── 4. 통합 JSON 생성 ─────────────────────────────────────────────────

def calculate_popularity(venue_seats):
    seats = int(venue_seats) if str(venue_seats).isdigit() else 0
    if seats >= 1000:
        return min(90 + (seats - 1000) / 100, 100)
    elif seats >= 500:
        return 70 + (seats - 500) / 25
    elif seats >= 200:
        return 40 + (seats - 200) / 10
    elif seats >= 50:
        return 10 + (seats - 50) / 5
    else:
        return max(seats / 5, 1)

def build_contents():
    log.info("[4/4] 통합 JSON 생성")

    performances = json.loads(KOPIS_RAW_PATH.read_text(encoding="utf-8"))
    profiles     = json.loads(PROFILES_PATH.read_text(encoding="utf-8"))
    embeddings   = json.loads(EMBEDDINGS_PATH.read_text(encoding="utf-8"))

    contents = {}
    for perf in tqdm(performances, desc="  통합", unit="건"):
        pid       = perf["id"]
        profile   = profiles.get(pid)
        embedding = embeddings.get(pid)
        if not embedding:
            continue

        seats = perf.get("venue_seats", 0)
        contents[pid] = {
            "id":            pid,
            "title":         perf.get("title", ""),
            "genre":         perf.get("genre", ""),
            "description":   perf.get("description", ""),
            "venue_name":    perf.get("venue_name", ""),
            "venue_seats":   seats,
            "venue_address": perf.get("venue_address", ""),
            "venue_lat":     perf.get("venue_lat", ""),
            "venue_lng":     perf.get("venue_lng", ""),
            "region":        perf.get("region", ""),
            "start_date":    perf.get("start_date", ""),
            "end_date":      perf.get("end_date", ""),
            "price":         perf.get("price", ""),
            "age_rating":    perf.get("age_rating", ""),
            "poster_url":    perf.get("poster_url", ""),
            "state":         perf.get("state", ""),
            "popularity":    round(calculate_popularity(seats), 1),
            "profile":       profile,
            "embedding":     embedding,
        }

    CONTENTS_PATH.write_text(
        json.dumps(contents, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    log.info("  ✅ contents.json 생성 완료: %d건 → %s", len(contents), CONTENTS_PATH)

    for genre, cnt in Counter(v["genre"] for v in contents.values()).most_common():
        log.info("  장르 %s: %d건", genre, cnt)
    for region, cnt in Counter(v["region"] for v in contents.values()).most_common(10):
        log.info("  지역 %s: %d건", region, cnt)


# ── 진입점 ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    assert KOPIS_KEY     != "여기에_KOPIS_API_키_입력",     "KOPIS_KEY를 입력해주세요."
    assert ANTHROPIC_KEY != "여기에_ANTHROPIC_API_키_입력", "ANTHROPIC_KEY를 입력해주세요."

    log.info("=" * 50)
    log.info("딴길 데이터 파이프라인")
    log.info("저장 경로: %s", DATA_DIR.resolve())
    log.info("=" * 50)

    try:
        collect_kopis()   # → data/kopis_raw.json
        run_profiling()   # → data/profiles.json
        run_embedding()   # → data/embeddings.json
        build_contents()  # → data/contents.json
        log.info("✅ 파이프라인 완료. data/contents.json을 Next.js 프로젝트에 복사하세요.")
    except Exception as e:
        log.critical("파이프라인 치명적 오류: %s", e, exc_info=True)
        raise
