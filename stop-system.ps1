# Mini Banking System - Stop Script
# Dừng toàn bộ hệ thống

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mini Banking System - Shutdown" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop Java processes (Backend services)
Write-Host "[1/3] Stopping Backend Services..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "Found $($javaProcesses.Count) Java processes. Stopping..." -ForegroundColor Cyan
    $javaProcesses | Stop-Process -Force
    Write-Host "Backend services stopped!" -ForegroundColor Green
} else {
    Write-Host "No Java processes found." -ForegroundColor Yellow
}
Write-Host ""

# Stop Node processes (Frontend)
Write-Host "[2/3] Stopping Frontend..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node processes. Stopping..." -ForegroundColor Cyan
    $nodeProcesses | Stop-Process -Force
    Write-Host "Frontend stopped!" -ForegroundColor Green
} else {
    Write-Host "No Node processes found." -ForegroundColor Yellow
}
Write-Host ""

# Stop Docker containers
Write-Host "[3/3] Stopping Databases & Kafka..." -ForegroundColor Yellow
docker-compose down
Write-Host "Databases & Kafka stopped!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Shutdown Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All services have been stopped." -ForegroundColor Green
Write-Host "To start again, run: .\start-system.ps1" -ForegroundColor Cyan
Write-Host ""
