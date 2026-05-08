"""
딴길 — embed_server.py 감독 (auto-restart watchdog)

embed_server.py 를 subprocess 로 띄우고, 죽으면 자동으로 재시작합니다.
주기적으로 /health 엔드포인트를 핑해 응답 없으면 강제 재시작합니다.

사용:
    python scripts/embed_server_watchdog.py
    또는 (Windows) scripts/start_embed_server.bat 더블클릭

종료:
    Ctrl+C 한 번 → 자식 프로세스도 같이 종료

환경변수:
    EMBED_PORT          (기본 8765)
    HEALTH_INTERVAL     (기본 30초, 0 이면 health check 비활성)
    HEALTH_TIMEOUT      (기본 5초)
    MAX_FAST_FAILS      (기본 3회) 30초 내 N번 죽으면 backoff 5분
"""

import os
import signal
import subprocess
import sys
import time
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

from logger import get_logger

log = get_logger("embed_watchdog")

PORT             = int(os.environ.get("EMBED_PORT", 8765))
HEALTH_URL       = f"http://localhost:{PORT}/health"
HEALTH_INTERVAL  = int(os.environ.get("HEALTH_INTERVAL", 30))
HEALTH_TIMEOUT   = int(os.environ.get("HEALTH_TIMEOUT", 5))
MAX_FAST_FAILS   = int(os.environ.get("MAX_FAST_FAILS", 3))
FAST_FAIL_WINDOW = 30   # 초
BACKOFF_SECONDS  = 300  # 5분
RESTART_DELAY    = 3    # 정상 재시작 시 딜레이

EMBED_SERVER_PATH = Path(__file__).parent / "embed_server.py"


def is_healthy() -> bool:
    """embed_server /health 핑 — 응답 200 + status=ok 면 정상"""
    try:
        with urlopen(HEALTH_URL, timeout=HEALTH_TIMEOUT) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return resp.status == 200 and '"status":"ok"' in body.replace(" ", "")
    except (URLError, OSError, TimeoutError):
        return False


def spawn_server() -> subprocess.Popen:
    """embed_server.py 를 자식 프로세스로 띄움. 자식 stdout/stderr 는 부모로 상속"""
    log.info("임베딩 서버 시작 → %s", EMBED_SERVER_PATH)
    return subprocess.Popen(
        [sys.executable, str(EMBED_SERVER_PATH)],
        # Windows 에서 Ctrl+C 가 자식에게도 전달되도록
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
    )


def main():
    log.info("=" * 60)
    log.info("embed_server watchdog 시작 (port=%d)", PORT)
    log.info("Ctrl+C 로 종료. health check 간격: %ds", HEALTH_INTERVAL)
    log.info("=" * 60)

    fast_fail_times = []
    proc: subprocess.Popen | None = None

    def shutdown(signum, frame):
        log.info("Ctrl+C 수신 — 자식 프로세스 종료 중")
        if proc and proc.poll() is None:
            try:
                proc.terminate()
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    if sys.platform != "win32":
        signal.signal(signal.SIGTERM, shutdown)

    while True:
        proc = spawn_server()
        last_health_check = time.time() + 60  # 기동 직후엔 1분 유예 (모델 로딩)

        while proc.poll() is None:
            time.sleep(1)

            # 주기적 헬스 체크 (포트 응답 없으면 강제 재시작)
            now = time.time()
            if HEALTH_INTERVAL > 0 and now - last_health_check >= HEALTH_INTERVAL:
                last_health_check = now
                if not is_healthy():
                    log.warning("health 실패 — 응답 없음. 강제 재시작")
                    try:
                        proc.terminate()
                        proc.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                    break
                else:
                    log.debug("health OK (PID=%d)", proc.pid)

        exit_code = proc.returncode
        log.warning("임베딩 서버 종료 — exit_code=%s", exit_code)

        # fast-fail 감지 (30초 내 3번 이상 죽으면 5분 backoff)
        now = time.time()
        fast_fail_times = [t for t in fast_fail_times if now - t < FAST_FAIL_WINDOW]
        fast_fail_times.append(now)

        if len(fast_fail_times) >= MAX_FAST_FAILS:
            log.error(
                "%d초 내 %d번 종료 — %d초 backoff",
                FAST_FAIL_WINDOW, len(fast_fail_times), BACKOFF_SECONDS,
            )
            time.sleep(BACKOFF_SECONDS)
            fast_fail_times = []
        else:
            log.info("%d초 후 재시작", RESTART_DELAY)
            time.sleep(RESTART_DELAY)


if __name__ == "__main__":
    main()
