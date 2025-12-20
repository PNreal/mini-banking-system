# Start all services for Mini Banking System
Write-Host "Starting Mini Banking System..." -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker containers..." -ForegroundColor Yellow
docker ps > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Start databases if not running
$containers = docker ps --format "{{.Names}}"
if ($containers -notcontains "postgres-account-service") {
    Write-Host "Starting databases..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep -Seconds 10
}

Write-Host "Databases are running!" -ForegroundColor Green

# Function to start a service
function Start-JavaService {
    param($ServiceName, $ServicePath, $Port)
    
    Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Yellow
    
    $serviceDir = Join-Path $PSScriptRoot $ServicePath
    if (-not (Test-Path $serviceDir)) {
        Write-Host "Error: Directory $serviceDir not found" -ForegroundColor Red
        return $false
    }
    
    # Check if port is already in use
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "$ServiceName already running on port $Port" -ForegroundColor Green
        return $true
    }
    
    # Start the service
    Push-Location $serviceDir
    try {
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "mvnw.cmd spring-boot:run" -WindowStyle Minimized
        Start-Sleep -Seconds 5
        Pop-Location
        Write-Host "$ServiceName started" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Error starting $ServiceName" -ForegroundColor Red
        Pop-Location
        return $false
    }
}

# Start services
Write-Host "Starting Java services..." -ForegroundColor Cyan

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
    Start-JavaService -ServiceName $service.Name -ServicePath $service.Path -Port $service.Port
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "  - API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "  - Frontend Web: http://localhost:3002" -ForegroundColor White
Write-Host "  - Admin Panel: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "To stop services: Use Task Manager to kill Java processes" -ForegroundColor Yellow
Write-Host "To stop databases: docker-compose down" -ForegroundColor Yellow