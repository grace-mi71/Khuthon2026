@echo off
REM 딴길 — 임베딩 서버 watchdog (Windows 더블클릭으로 실행)
REM
REM 이 파일을 더블클릭하면 embed_server.py 가 자동 재시작 모드로 시작됩니다.
REM 종료하려면 콘솔 창에서 Ctrl+C 를 누르세요.
REM
REM 부팅 시 자동 시작하려면:
REM   Win+R → shell:startup → 이 .bat 파일 바로가기 만들기

cd /d "%~dp0\.."

REM Python 경로 (PATH 에 등록되어 있어야 함)
where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] python 이 PATH 에 없습니다.
    pause
    exit /b 1
)

echo === 딴길 임베딩 서버 watchdog ===
echo.
python scripts/embed_server_watchdog.py
echo.
echo watchdog 종료됨. 창을 닫으려면 아무 키나 누르세요...
pause >nul
