# Script khởi động Mini Banking System (PowerShell)
# Chạy từ bất kỳ đâu

param(
    [switch]$NoWait = $false
)

# Lấy đường dẫn thư mục dự án
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mini Banking System - Docker Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project Directory: $projectDir" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra Docker
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "[INFO] Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    if (-not $NoWait) { Read-Host "Press Enter to exit" }
    exit 1
}

Write-Host "[INFO] Starting services..." -ForegroundColor Yellow
Write-Host ""

# Chuyển đến thư mục dự án
Set-Location $projectDir

# Khởi động Docker Compose
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to start services" -ForegroundColor Red
    if (-not $NoWait) { Read-Host "Press Enter to exit" }
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  - Customer Web:  http://localhost:3000" -ForegroundColor White
Write-Host "  - Admin Panel:   http://localhost:3001" -ForegroundColor White
Write-Host "  - API Gateway:   http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "  - Admin:    admin@minibank.com / Admin@123" -ForegroundColor White
Write-Host "  - Customer: test.user@example.com / TestPassword#123" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  - Check status: docker compose ps" -ForegroundColor White
Write-Host "  - View logs:    docker compose logs -f" -ForegroundColor White
Write-Host "  - Stop all:     docker compose down" -ForegroundColor White
Write-Host ""

if (-not $NoWait) { Read-Host "Press Enter to exit" }
