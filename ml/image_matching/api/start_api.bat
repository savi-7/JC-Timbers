@echo off
REM Start FastAPI image search service (Windows)

echo Starting Image Search API...

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Load environment variables from parent .env if exists
if exist ..\.env (
    for /f "tokens=1,2 delims==" %%a in (..\.env) do (
        if not "%%a"=="" if not "%%a"=="#" (
            set "%%a=%%b"
        )
    )
)

REM Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause


