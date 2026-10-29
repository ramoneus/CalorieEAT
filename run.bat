@echo off
rem Double-click to run Calorie Tracker. First run installs dependencies.
setlocal
cd /d "%~dp0"

where node >nul 2>&1 || set "PATH=%PATH%;%ProgramFiles%\nodejs"

where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo Node.js was not found. Install the LTS version from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies, this only happens once...
    call npm install
    if errorlevel 1 (
        echo.
        echo Installing dependencies failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
)

echo Starting Calorie Tracker on http://localhost:5173 ...
call npm run dev -- --open
pause
