# Script dừng tất cả các Java services
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Dừng Banking System Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Hàm kiểm tra port có đang được sử dụng không
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Danh sách các service và port tương ứng
$services = @(
    @{Name="User Service"; Port=8081},
    @{Name="Account Service"; Port=8082},
    @{Name="Transaction Service"; Port=8083},
    @{Name="Admin Service"; Port=8084},
    @{Name="Log Service"; Port=8085},
    @{Name="Notification Service"; Port=8086},
    @{Name="API Gateway"; Port=8080}
)

Write-Host "Đang kiểm tra các service đang chạy..." -ForegroundColor Yellow
Write-Host ""

$runningServices = @()
foreach ($service in $services) {
    if (Test-Port -Port $service.Port) {
        $runningServices += $service
        Write-Host "  ✓ $($service.Name) đang chạy trên port $($service.Port)" -ForegroundColor Yellow
    }
}

if ($runningServices.Count -eq 0) {
    Write-Host "Không có service nào đang chạy." -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Tìm các process Java đang chạy..." -ForegroundColor Yellow

# Tìm tất cả process Java
$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue

if ($javaProcesses.Count -eq 0) {
    Write-Host "Không tìm thấy process Java nào đang chạy." -ForegroundColor Yellow
    Write-Host "Có thể các service đã được dừng hoặc đang chạy bằng cách khác." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Tìm thấy $($javaProcesses.Count) process Java:" -ForegroundColor Yellow
    $javaProcesses | ForEach-Object {
        Write-Host "  - PID: $($_.Id), StartTime: $($_.StartTime)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Đang dừng tất cả process Java..." -ForegroundColor Yellow
    
    try {
        $javaProcesses | Stop-Process -Force
        Write-Host "Đã dừng tất cả process Java." -ForegroundColor Green
    } catch {
        Write-Host "Lỗi khi dừng process Java: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Đợi 3 giây để các port được giải phóng..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Kiểm tra lại trạng thái các service..." -ForegroundColor Yellow
Write-Host ""

$stillRunning = @()
foreach ($service in $services) {
    if (Test-Port -Port $service.Port) {
        $stillRunning += $service
        Write-Host "  ✗ $($service.Name) vẫn đang chạy trên port $($service.Port)" -ForegroundColor Red
    } else {
        Write-Host "  ✓ $($service.Name) đã dừng" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kết quả" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($stillRunning.Count -eq 0) {
    Write-Host "✓ Tất cả các service đã được dừng thành công!" -ForegroundColor Green
} else {
    Write-Host "⚠ Cảnh báo: Một số service vẫn đang chạy:" -ForegroundColor Yellow
    foreach ($service in $stillRunning) {
        Write-Host "  - $($service.Name) (port $($service.Port))" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Bạn có thể thử dừng thủ công bằng Task Manager hoặc:" -ForegroundColor Yellow
    Write-Host "  Get-Process -Name java | Stop-Process -Force" -ForegroundColor White
}

Write-Host ""
Write-Host "Lưu ý: Để dừng databases và Kafka, chạy:" -ForegroundColor Cyan
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""

