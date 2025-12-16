# Script kiem tra cac service API
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KIEM TRA CAC SERVICE API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$services = @{
    "API Gateway" = 8080
    "User Service" = 8081
    "Account Service" = 8082
    "Transaction Service" = 8083
    "Admin Service" = 8084
    "Log Service" = 8085
    "Notification Service" = 8086
}

$results = @{}

foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName]
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/actuator/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "[OK] $serviceName (Port $port): DANG CHAY - Status: $($response.StatusCode)" -ForegroundColor Green
        $results[$serviceName] = "RUNNING"
    } catch {
        Write-Host "[X] $serviceName (Port $port): KHONG CHAY" -ForegroundColor Red
        $results[$serviceName] = "NOT_RUNNING"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TOM TAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$running = ($results.Values | Where-Object { $_ -eq "RUNNING" }).Count
$total = $results.Count

Write-Host "Tong so service: $total" -ForegroundColor Yellow
Write-Host "Service dang chay: $running" -ForegroundColor Green
Write-Host "Service khong chay: $($total - $running)" -ForegroundColor Red

if ($running -eq 0) {
    Write-Host ""
    Write-Host "KHUYEN NGHI: Cac service chua duoc khoi dong." -ForegroundColor Yellow
    Write-Host "De khoi dong cac service, ban can:" -ForegroundColor Yellow
    Write-Host "1. Chay tung service bang Maven: cd services\<service-name>\<service-name> && .\mvnw.cmd spring-boot:run" -ForegroundColor Gray
    Write-Host "2. Hoac su dung Docker Compose neu da co cau hinh" -ForegroundColor Gray
}

