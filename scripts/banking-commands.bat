@echo off
REM Tạo các lệnh tắt cho Mini Banking System

setlocal enabledelayedexpansion

REM Lấy đường dẫn thư mục dự án
for %%I in ("%~dp0..") do set PROJECT_DIR=%%~fI

if "%1"=="" (
    echo.
    echo Mini Banking System - Commands
    echo.
    echo Usage: banking-commands [command]
    echo.
    echo Commands:
    echo   start       - Start all services
    echo   stop        - Stop all services
    echo   restart     - Restart all services
    echo   status      - Check services status
    echo   logs        - View logs (follow mode)
    echo   logs-all    - View all logs
    echo   reset       - Reset all data (remove volumes)
    echo   clean       - Remove all containers and volumes
    echo   build       - Build all images
    echo.
    exit /b 0
)

cd /d "%PROJECT_DIR%"

if "%1"=="start" (
    echo Starting services...
    docker compose up -d
    goto :end
)

if "%1"=="stop" (
    echo Stopping services...
    docker compose down
    goto :end
)

if "%1"=="restart" (
    echo Restarting services...
    docker compose restart
    goto :end
)

if "%1"=="status" (
    echo Checking services status...
    docker compose ps
    goto :end
)

if "%1"=="logs" (
    echo Viewing logs (press Ctrl+C to exit)...
    docker compose logs -f
    goto :end
)

if "%1"=="logs-all" (
    echo Viewing all logs...
    docker compose logs
    goto :end
)

if "%1"=="reset" (
    echo WARNING: This will remove all data!
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        echo Resetting system...
        docker compose down -v
        docker compose up -d
    ) else (
        echo Cancelled.
    )
    goto :end
)

if "%1"=="clean" (
    echo WARNING: This will remove all containers and volumes!
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        echo Cleaning up...
        docker compose down -v
        echo Cleanup complete.
    ) else (
        echo Cancelled.
    )
    goto :end
)

if "%1"=="build" (
    echo Building all images...
    docker compose build
    goto :end
)

echo Unknown command: %1
echo Run without arguments to see available commands.

:end
