# Script khởi động tất cả các service (không dùng Docker, chỉ database dùng Docker)
# Chạy script này sau khi đã khởi động databases bằng: docker-compose up -d

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Khởi động Banking System Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Java và Maven
Write-Host "Kiểm tra Java và Maven..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "Lỗi: Java chưa được cài đặt hoặc chưa có trong PATH" -ForegroundColor Red
    exit 1
}

try {
    $mvnVersion = mvn -version 2>&1 | Select-String "Apache Maven"
    Write-Host "Maven: $mvnVersion" -ForegroundColor Green
} catch {
    Write-Host "Cảnh báo: Maven có thể chưa được cài đặt, sẽ dùng mvnw" -ForegroundColor Yellow
}

Write-Host ""

# Kiểm tra Docker đang chạy
Write-Host "Kiểm tra Docker containers..." -ForegroundColor Yellow
$dockerRunning = docker ps --format "{{.Names}}" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Cảnh báo: Docker có thể chưa chạy. Vui lòng khởi động Docker và chạy: docker-compose up -d" -ForegroundColor Yellow
} else {
    $dbContainers = docker ps --format "{{.Names}}" | Where-Object { $_ -like "*postgres*" -or $_ -like "*kafka*" -or $_ -like "*zookeeper*" }
    if ($dbContainers) {
        Write-Host "Databases và Kafka đang chạy:" -ForegroundColor Green
        $dbContainers | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
    } else {
        Write-Host "Cảnh báo: Không tìm thấy database containers. Chạy: docker-compose up -d" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Bắt đầu khởi động các service..." -ForegroundColor Cyan
Write-Host ""

# Hàm kiểm tra port có đang được sử dụng không
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Hàm khởi động service
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port
    )
    
    Write-Host "Khởi động $ServiceName..." -ForegroundColor Yellow
    
    $serviceDir = Join-Path $PSScriptRoot $ServicePath
    if (-not (Test-Path $serviceDir)) {
        Write-Host "Lỗi: Không tìm thấy thư mục $serviceDir" -ForegroundColor Red
        return $false
    }
    
    # Kiểm tra xem service đã chạy chưa
    if (Test-Port -Port $Port) {
        Write-Host "$ServiceName đã chạy trên port $Port" -ForegroundColor Green
        return $true
    }
    
    Push-Location $serviceDir
    
    try {
        # Kiểm tra xem có mvnw.cmd không
        $mvnwPath = Join-Path $serviceDir "mvnw.cmd"
        if (-not (Test-Path $mvnwPath)) {
            Write-Host "Lỗi: Không tìm thấy mvnw.cmd trong $serviceDir" -ForegroundColor Red
            Pop-Location
            return $false
        }
        
        # Khởi động service trong background với Start-Process
        $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "mvnw.cmd spring-boot:run" -PassThru -WindowStyle Hidden -WorkingDirectory $serviceDir
        
        # Đợi một chút để service khởi động
        Start-Sleep -Seconds 5
        
        # Kiểm tra xem port đã được sử dụng chưa
        $maxRetries = 30
        $retryCount = 0
        $started = $false
        
        while ($retryCount -lt $maxRetries -and -not $started) {
            if (Test-Port -Port $Port) {
                $started = $true
                Write-Host "$ServiceName đã khởi động thành công trên port $Port (PID: $($process.Id))" -ForegroundColor Green
            } else {
                Start-Sleep -Seconds 2
                $retryCount++
            }
        }
        
        if (-not $started) {
            Write-Host "Cảnh báo: $ServiceName có thể chưa khởi động hoàn toàn sau 60 giây" -ForegroundColor Yellow
        }
        
        Pop-Location
        return $started
    } catch {
        Write-Host "Lỗi khi khởi động $ServiceName : $_" -ForegroundColor Red
        Pop-Location
        return $false
    }
}

# Khởi động các service theo thứ tự
$services = @(
    @{Name="User Service"; Path="services\user-service\user-service"; Port=8081},
    @{Name="Account Service"; Path="services\account-service\account-service"; Port=8082},
    @{Name="Transaction Service"; Path="services\transaction-service\transaction-service"; Port=8083},
    @{Name="Admin Service"; Path="services\admin-service\admin-service"; Port=8084},
    @{Name="Log Service"; Path="services\log-service\log-service"; Port=8085},
    @{Name="Notification Service"; Path="services\notification-service\notification-service"; Port=8086},
    @{Name="API Gateway"; Path="api-gateway\api-gateway"; Port=8080}
)

$failedServices = @()
$startedServices = @()

foreach ($service in $services) {
    $result = Start-Service -ServiceName $service.Name -ServicePath $service.Path -Port $service.Port
    if ($result) {
        $startedServices += $service.Name
    } else {
        $failedServices += $service.Name
    }
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kết quả khởi động" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($startedServices.Count -gt 0) {
    Write-Host "Các service đã khởi động:" -ForegroundColor Green
    foreach ($service in $startedServices) {
        Write-Host "  ✓ $service" -ForegroundColor Green
    }
    Write-Host ""
}

if ($failedServices.Count -gt 0) {
    Write-Host "Các service không khởi động được:" -ForegroundColor Red
    foreach ($service in $failedServices) {
        Write-Host "  ✗ $service" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Các service đang chạy:" -ForegroundColor Cyan
Write-Host "  - User Service: http://localhost:8081" -ForegroundColor White
Write-Host "  - Account Service: http://localhost:8082" -ForegroundColor White
Write-Host "  - Transaction Service: http://localhost:8083" -ForegroundColor White
Write-Host "  - Admin Service: http://localhost:8084" -ForegroundColor White
Write-Host "  - Log Service: http://localhost:8085" -ForegroundColor White
Write-Host "  - Notification Service: http://localhost:8086" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "  - Customer/Staff UI: http://localhost:3000" -ForegroundColor White
Write-Host "  - Admin UI (mới): http://localhost:3001/admin" -ForegroundColor White
Write-Host ""
Write-Host "De dung cac service, dong cua so nay hoac dung Task Manager de kill cac process Java" -ForegroundColor Yellow
Write-Host "Để dừng databases: docker-compose down" -ForegroundColor Yellow
