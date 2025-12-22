@echo off
REM Mini Banking System - Quick API Test
REM Chạy: scripts\test-quick.bat

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:8080/api/v1

echo.
echo ========================================
echo   Mini Banking - Quick API Test
echo ========================================
echo.

REM Check if curl is available
where curl >nul 2>&1
if errorlevel 1 (
    echo [ERROR] curl is not installed
    exit /b 1
)

echo [1] Testing Customer Login...
curl -s -X POST "%BASE_URL%/users/login" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"test.user@example.com\",\"password\":\"TestPassword#123\"}" ^
    > temp_login.json

findstr /C:"accessToken" temp_login.json >nul
if errorlevel 1 (
    echo [FAIL] Customer login failed
) else (
    echo [PASS] Customer login successful
)

echo.
echo [2] Testing Admin Login...
curl -s -X POST "%BASE_URL%/users/admin/login" ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"admin@minibank.com\",\"password\":\"Admin@123\"}" ^
    > temp_admin.json

findstr /C:"accessToken" temp_admin.json >nul
if errorlevel 1 (
    echo [FAIL] Admin login failed
) else (
    echo [PASS] Admin login successful
)

echo.
echo [3] Testing Get Counters...
curl -s -X GET "%BASE_URL%/counters" > temp_counters.json
findstr /C:"success" temp_counters.json >nul
if errorlevel 1 (
    echo [FAIL] Get counters failed
) else (
    echo [PASS] Get counters successful
)

echo.
echo [4] Testing Health Check...
curl -s -X GET "http://localhost:8080/actuator/health" > temp_health.json
findstr /C:"UP" temp_health.json >nul
if errorlevel 1 (
    echo [FAIL] Health check failed - Services may not be running
) else (
    echo [PASS] Health check successful
)

REM Cleanup
del temp_*.json 2>nul

echo.
echo ========================================
echo   Quick Test Completed
echo ========================================
echo.
echo For full test suite, run:
echo   powershell -ExecutionPolicy Bypass -File scripts\test-api.ps1
echo.
pause
