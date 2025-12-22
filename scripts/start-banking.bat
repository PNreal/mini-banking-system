@echo off
REM Script khởi động Mini Banking System
REM Chạy từ bất kỳ đâu

setlocal enabledelayedexpansion

REM Lấy đường dẫn thư mục dự án
for %%I in ("%~dp0..") do set PROJECT_DIR=%%~fI

echo.
echo ========================================
echo   Mini Banking System - Docker Startup
echo ========================================
echo.
echo Project Directory: %PROJECT_DIR%
echo.

REM Kiểm tra Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [INFO] Docker found. Starting services...
echo.

REM Chuyển đến thư mục dự án
cd /d "%PROJECT_DIR%"

REM Khởi động Docker Compose
docker compose up -d

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo Access URLs:
echo   - Customer Web:  http://localhost:3000
echo   - Admin Panel:   http://localhost:3001
echo   - API Gateway:   http://localhost:8080
echo.
echo Test Accounts:
echo   - Admin:    admin@minibank.com / Admin@123
echo   - Customer: test.user@example.com / TestPassword#123
echo.
echo Check status: docker compose ps
echo View logs:    docker compose logs -f
echo Stop all:     docker compose down
echo.
pause
