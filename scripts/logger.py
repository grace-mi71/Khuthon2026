"""공통 로거 설정 - 모든 스크립트에서 import해서 사용

Windows cp949 콘솔 인코딩 문제를 피하기 위해 UTF-8 강제 출력합니다.
"""

import io
import logging
import sys
from datetime import datetime
from pathlib import Path

LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)


def _utf8_stream(stream):
    """Windows에서 stdout/stderr를 UTF-8로 래핑 (cp949 인코딩 오류 방지)"""
    try:
        # Python 3.7+ reconfigure 사용 가능하면 사용
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
            return stream
    except Exception:
        pass
    # fallback: TextIOWrapper로 감싸기
    try:
        return io.TextIOWrapper(stream.buffer, encoding="utf-8", errors="replace", line_buffering=True)
    except Exception:
        return stream


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger  # 이미 설정된 경우 재사용

    logger.setLevel(logging.DEBUG)
    logger.propagate = False  # 루트 로거 중복 출력 방지

    fmt = logging.Formatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # 콘솔 핸들러 (INFO 이상, UTF-8 강제)
    stream = _utf8_stream(sys.stdout)
    console = logging.StreamHandler(stream)
    console.setLevel(logging.INFO)
    console.setFormatter(fmt)
    logger.addHandler(console)

    # 파일 핸들러 (DEBUG 이상, 날짜별, UTF-8)
    log_file = LOG_DIR / f"{name}_{datetime.now():%Y%m%d}.log"
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(fmt)
    logger.addHandler(file_handler)

    return logger
