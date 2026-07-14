@echo off
chcp 65001 >nul
title Ziddy Document Print System - One-Click Start

echo ========================================
echo   Ziddy Document Print System
echo   One-Click Startup
echo ========================================
echo.

echo [1/3] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js detected: %NODE_VERSION%
echo.

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)
echo Dependencies check passed.
echo.

echo [3/3] Starting services...
echo.

set "hasBackend=0"
if exist "backend" (
    if exist "backend/package.json" (
        set "hasBackend=1"
    )
)
if exist "server" (
    if exist "server/package.json" (
        set "hasBackend=1"
    )
)

if %hasBackend% equ 1 (
    echo Starting backend server...
    start "Backend Server" cmd /k "cd backend && npm run dev"
    timeout /t 3 /nobreak >nul
)

echo Starting frontend development server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   Services are starting...
echo ========================================
echo.
echo Frontend will be available at: http://localhost:5173
echo.
if %hasBackend% equ 1 (
    echo Backend will be available at: http://localhost:3000
    echo.
)
echo Press any key to open browser...
pause >nul
start http://localhost:5173