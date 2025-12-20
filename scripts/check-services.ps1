# Script kiểm tra trạng thái các service
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kiểm tra trạng thái các Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086)
$serviceNames = @{
    8080 = "API Gateway"
    8081 = "User Service"
    8082 = "Account Service"
    8083 = "Transaction Service"
    8084 = "Admin Service"
    8085 = "Log Service"
    8086 = "Notification Service"
}

Write-Host "Kiểm tra các port đang listen:" -ForegroundColor Yellow
Write-Host ""

$listeningPorts = Get-NetTCPConnection -ErrorAction SilentlyContinue | 
    Where-Object {$_.LocalPort -in $ports -and $_.State -eq 'Listen'} | 
    Select-Object LocalPort

foreach ($port in $ports) {
    $isListening = $listeningPorts | Where-Object {$_.LocalPort -eq $port}
    $serviceName = $serviceNames[$port]
    
    if ($isListening) {
        Write-Host "  ✓ $serviceName (port $port) - Đang chạy" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $serviceName (port $port) - Chưa chạy" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Số lượng process Java đang chạy: $((Get-Process -Name java -ErrorAction SilentlyContinue).Count)" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra databases
Write-Host "Kiểm tra Docker containers (databases):" -ForegroundColor Yellow
$dbContainers = docker ps --format "{{.Names}}" 2>&1 | Where-Object {$_ -like "*postgres*" -or $_ -like "*kafka*" -or $_ -like "*zookeeper*"}
if ($dbContainers) {
    Write-Host "  ✓ Databases và Kafka đang chạy" -ForegroundColor Green
    $dbContainers | ForEach-Object { Write-Host "    - $_" -ForegroundColor White }
} else {
    Write-Host "  ✗ Không tìm thấy database containers" -ForegroundColor Red
    Write-Host "    Chạy: docker-compose up -d" -ForegroundColor Yellow
}
