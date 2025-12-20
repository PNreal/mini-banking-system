# Mini Banking System - Status Check Script
# Kiểm tra trạng thái tất cả các services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mini Banking System - Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker Containers
Write-Host "[1/3] Docker Containers Status:" -ForegroundColor Yellow
Write-Host ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "postgres|kafka|zookeeper"
Write-Host ""

# Check Backend Services
Write-Host "[2/3] Backend Services Status:" -ForegroundColor Yellow
Write-Host ""

$ports = @(
    @{Port=8080; Name="API Gateway"},
    @{Port=8081; Name="User Service"},
    @{Port=8082; Name="Account Service"},
    @{Port=8083; Name="Transaction Service"},
    @{Port=8084; Name="Admin Service"},
    @{Port=8085; Name="Log Service"},
    @{Port=8086; Name="Notification Service"}
)

foreach ($service in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  ✓ $($service.Name) - Running on port $($service.Port)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($service.Name) - Not running on port $($service.Port)" -ForegroundColor Red
    }
}
Write-Host ""

# Check Frontend
Write-Host "[3/3] Frontend Status:" -ForegroundColor Yellow
Write-Host ""

$frontendPorts = @(
    @{Port=3001; Name="Admin Panel"},
    @{Port=3002; Name="Customer Web"}
)

foreach ($frontend in $frontendPorts) {
    $connection = Get-NetTCPConnection -LocalPort $frontend.Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  ✓ $($frontend.Name) - Running on port $($frontend.Port)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($frontend.Name) - Not running on port $($frontend.Port)" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Access URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Yellow
Write-Host "  - Customer Web: http://localhost:3002" -ForegroundColor White
Write-Host "  - Admin Panel: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Backend:" -ForegroundColor Yellow
Write-Host "  - API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Yellow
Write-Host "  - Admin: admin@minibank.com / Admin@123" -ForegroundColor White
Write-Host "  - Customer: test.user@example.com / TestPassword#123" -ForegroundColor White
Write-Host ""
