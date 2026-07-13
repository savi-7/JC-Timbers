@echo off
REM Improved FastAPI startup script for Windows
REM This script starts the FastAPI image search service

echo ========================================
echo  Starting Image Search API (FastAPI)
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if virtual environment exists and activate it
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Check if requirements are installed
echo Checking dependencies...
python -c "import fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo WARNING: FastAPI dependencies not found
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if port 8000 is already in use
netstat -ano | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo WARNING: Port 8000 is already in use
    echo Please stop the existing service or use a different port
    echo.
    echo Press any key to continue anyway, or Ctrl+C to cancel...
    pause >nul
)

echo.
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
echo API Documentation will be available at:
echo   - Swagger UI: http://localhost:8000/docs
echo   - ReDoc: http://localhost:8000/redoc
echo   - Health Check: http://localhost:8000/health
echo.

REM Start FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
