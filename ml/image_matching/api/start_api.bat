@echo off
REM Start FastAPI image search service (Windows)

echo ========================================
echo  Starting Image Search API (FastAPI)
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Start FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause


