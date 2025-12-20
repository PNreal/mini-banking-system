# Mini Banking System - Startup Script
# Khởi động toàn bộ hệ thống theo đúng thứ tự

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mini Banking System - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/4] Checking Docker..." -ForegroundColor Yellow
docker ps > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is running!" -ForegroundColor Green
Write-Host ""

# Step 2: Start Databases & Kafka
Write-Host "[2/4] Starting Databases & Kafka..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 10

# Check if Kafka is running, if not start it
$kafka = docker ps --format "{{.Names}}" | Where-Object { $_ -eq "kafka" }
if (-not $kafka) {
    Write-Host "Starting Kafka..." -ForegroundColor Yellow
    docker start kafka
    Start-Sleep -Seconds 5
}

Write-Host "Databases & Kafka started!" -ForegroundColor Green
Write-Host ""

# Step 3: Start Backend Services
Write-Host "[3/4] Starting Backend Services..." -ForegroundColor Yellow
Write-Host "This will open 7 new terminal windows for each service." -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="User Service"; Path="services\user-service\user-service"; Port=8081},
    @{Name="Account Service"; Path="services\account-service\account-service"; Port=8082},
    @{Name="Transaction Service"; Path="services\transaction-service\transaction-service"; Port=8083},
    @{Name="Admin Service"; Path="services\admin-service\admin-service"; Port=8084},
    @{Name="Log Service"; Path="services\log-service\log-service"; Port=8085},
    @{Name="Notification Service"; Path="services\notification-service\notification-service"; Port=8086},
    @{Name="API Gateway"; Path="api-gateway\api-gateway"; Port=8080}
)

foreach ($service in $services) {
    $servicePath = Join-Path $PSScriptRoot $service.Path
    Write-Host "Starting $($service.Name) on port $($service.Port)..." -ForegroundColor Cyan
    
    # Start in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$servicePath'; .\mvnw.cmd spring-boot:run"
    
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Backend services are starting..." -ForegroundColor Green
Write-Host "Please wait 2-3 minutes for all services to fully start." -ForegroundColor Yellow
Write-Host ""

# Step 4: Instructions for Frontend
Write-Host "[4/4] Frontend Instructions" -ForegroundColor Yellow
Write-Host "To start frontend, open a new terminal and run:" -ForegroundColor Cyan
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Or use the script:" -ForegroundColor Cyan
Write-Host "  .\start-frontend.ps1" -ForegroundColor White
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Startup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services Status:" -ForegroundColor Yellow
Write-Host "  - Databases & Kafka: Running" -ForegroundColor Green
Write-Host "  - Backend Services: Starting (check terminal windows)" -ForegroundColor Yellow
Write-Host "  - Frontend: Not started (run manually)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  - Customer Web: http://localhost:3002" -ForegroundColor White
Write-Host "  - Admin Panel: http://localhost:3001" -ForegroundColor White
Write-Host "  - API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Yellow
Write-Host "  Admin: admin@minibank.com / Admin@123" -ForegroundColor White
Write-Host "  Customer: test.user@example.com / TestPassword#123" -ForegroundColor White
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  1. Close all service terminal windows" -ForegroundColor White
Write-Host "  2. Run: docker-compose down" -ForegroundColor White
Write-Host ""
