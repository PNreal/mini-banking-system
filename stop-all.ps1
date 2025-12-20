# Script dung tat ca ung dung va giai phong cac cong
# Bao gom: Java Services, Docker Containers, Frontend (Node.js)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DUNG TAT CA UNG DUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buoc 1: Dung tat ca Java Services
Write-Host "Buoc 1: Dung tat ca Java Services..." -ForegroundColor Yellow
Write-Host ""

$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcesses.Count -gt 0) {
    Write-Host "Tim thay $($javaProcesses.Count) process Java dang chay" -ForegroundColor Yellow
    $javaProcesses | Stop-Process -Force
    Write-Host "Da dung tat ca process Java" -ForegroundColor Green
} else {
    Write-Host "Khong tim thay process Java nao dang chay" -ForegroundColor Green
}

Write-Host ""

# Buoc 2: Dung Frontend (Node.js)
Write-Host "Buoc 2: Dung Frontend (Node.js)..." -ForegroundColor Yellow
Write-Host ""

$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses.Count -gt 0) {
    Write-Host "Tim thay $($nodeProcesses.Count) process Node.js dang chay" -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Write-Host "Da dung tat ca process Node.js" -ForegroundColor Green
} else {
    Write-Host "Khong tim thay process Node.js nao dang chay" -ForegroundColor Green
}

Write-Host ""

# Buoc 3: Dung Docker Containers
Write-Host "Buoc 3: Dung Docker Containers..." -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose down 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Da dung tat ca Docker containers" -ForegroundColor Green
    } else {
        Write-Host "Khong co container nao dang chay hoac Docker chua chay" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Loi khi kiem tra Docker: $_" -ForegroundColor Red
}

Write-Host ""

# Doi mot chut de cac process duoc giai phong
Write-Host "Doi 3 giay de cac process duoc giai phong..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""

# Buoc 4: Kiem tra va giai phong cac cong con lai
Write-Host "Buoc 4: Kiem tra cac cong..." -ForegroundColor Yellow
Write-Host ""

$allPorts = @(8080,8081,8082,8083,8084,8085,8086,3000,3001,5432,5433,5434,5435,5436,5437,9092,9093,2181)
$stillOccupied = @()

foreach ($port in $allPorts) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn -and $conn.State -ne "TimeWait") {
        $pid = $conn.OwningProcess
        if ($pid -and $pid -ne 0) {
            Write-Host "Port $port dang duoc su dung boi PID: $pid" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            $stillOccupied += $port
        }
    }
}

Write-Host ""

# Buoc 5: Tom tat ket qua
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KET QUA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($stillOccupied.Count -eq 0) {
    Write-Host "Tat ca ung dung da duoc dung va cac cong da duoc giai phong!" -ForegroundColor Green
} else {
    Write-Host "Canh bao: Mot so cong van dang duoc su dung" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "De khoi dong lai ung dung:" -ForegroundColor Cyan
Write-Host "  1. docker-compose up -d" -ForegroundColor White
Write-Host "  2. .\start-services.ps1" -ForegroundColor White
Write-Host "  3. cd frontend roi chay npm start (Customer/Staff UI)" -ForegroundColor White
Write-Host "  4. cd banking-admin-hub-main\\banking-admin-hub-main roi chay npm run dev (Admin UI)" -ForegroundColor White
Write-Host ""
