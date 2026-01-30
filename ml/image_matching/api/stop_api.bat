@echo off
REM Stop FastAPI image search service (Windows)

echo ========================================
echo  Stopping Image Search API (FastAPI)
echo ========================================
echo.

REM Check if port 8000 is in use
netstat -ano | findstr ":8000" >nul 2>&1
if errorlevel 1 (
    echo No service found running on port 8000
    echo The service may already be stopped
    pause
    exit /b 0
)

echo Finding process using port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    set PID=%%a
    echo Found process ID: %%a
    echo Stopping process...
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Failed to stop process %%a
        echo You may need to run this script as Administrator
    ) else (
        echo Successfully stopped process %%a
    )
)

echo.
echo Checking if service is stopped...
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":8000" >nul 2>&1
if errorlevel 1 (
    echo Service successfully stopped!
) else (
    echo WARNING: Service may still be running. Please check manually.
)

pause
