# Test Rut Tien Tai Quay - Dung user co san
$BaseUrl = "http://localhost:8080/api/v1"

Write-Host "`n=== TEST RUT TIEN TAI QUAY ===" -ForegroundColor Cyan

# 1. Admin login
Write-Host "`n[1] Admin dang nhap..." -ForegroundColor Yellow
$adminRes = Invoke-RestMethod -Uri "$BaseUrl/users/admin/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@minibank.com","password":"Admin@123"}'
$adminToken = $adminRes.accessToken
Write-Host "    OK" -ForegroundColor Green

# 2. Customer login (user da co KYC)
Write-Host "`n[2] Customer dang nhap..." -ForegroundColor Yellow
$custRes = Invoke-RestMethod -Uri "$BaseUrl/users/login" -Method POST -ContentType "application/json" -Body '{"email":"user_withdraw_test_20251223012003@example.com","password":"UserPass@123"}'
$userToken = $custRes.accessToken
$meRes = Invoke-RestMethod -Uri "$BaseUrl/users/me" -Method GET -Headers @{ "Authorization"="Bearer $userToken" }
$userId = $meRes.data.userId
Write-Host "    Email: user_withdraw_test_20251223012003@example.com" -ForegroundColor Green
Write-Host "    UserId: $userId" -ForegroundColor Gray

# 3. Kiem tra so du hien tai
Write-Host "`n[3] Kiem tra so du hien tai..." -ForegroundColor Yellow
$accRes = Invoke-RestMethod -Uri "$BaseUrl/account/me" -Method GET -Headers @{ "X-User-Id"=$userId; "Authorization"="Bearer $userToken" }
$balanceBefore = $accRes.data.balance
Write-Host "    So du hien tai: $balanceBefore VND" -ForegroundColor Green

# 4. Nap them tien neu can
if ($balanceBefore -lt 100000) {
    Write-Host "`n[4] Nap them tien (100,000 VND)..." -ForegroundColor Yellow
    $depositBody = '{"amount":100000}'
    Invoke-RestMethod -Uri "$BaseUrl/transactions/deposit" -Method POST -ContentType "application/json" -Body $depositBody -Headers @{ "X-User-Id"=$userId; "Authorization"="Bearer $userToken" } | Out-Null
    $accRes = Invoke-RestMethod -Uri "$BaseUrl/account/me" -Method GET -Headers @{ "X-User-Id"=$userId; "Authorization"="Bearer $userToken" }
    $balanceBefore = $accRes.data.balance
    Write-Host "    So du sau nap: $balanceBefore VND" -ForegroundColor Green
} else {
    Write-Host "`n[4] So du du ($balanceBefore VND), khong can nap them" -ForegroundColor Gray
}

# 5. Lay quay giao dich
Write-Host "`n[5] Lay quay giao dich..." -ForegroundColor Yellow
$countersRes = Invoke-RestMethod -Uri "$BaseUrl/counters" -Method GET -Headers @{ "X-User-Role"="ADMIN"; "Authorization"="Bearer $adminToken" }
$counterId = $countersRes.data[0].counterId
$counterName = $countersRes.data[0].name
Write-Host "    Quay: $counterName" -ForegroundColor Green
Write-Host "    CounterId: $counterId" -ForegroundColor Gray


# 6. User tao yeu cau rut tien 50,000 VND
Write-Host "`n[6] User tao yeu cau rut 50,000 VND tai quay..." -ForegroundColor Yellow
$withdrawBody = @{ amount=50000; counterId=$counterId } | ConvertTo-Json
$withdrawRes = Invoke-RestMethod -Uri "$BaseUrl/transactions/withdraw-counter" -Method POST -ContentType "application/json" -Body $withdrawBody -Headers @{ "X-User-Id"=$userId; "Authorization"="Bearer $userToken" }
$txId = $withdrawRes.data.transactionId
$txCode = $withdrawRes.data.transactionCode
$staffId = $withdrawRes.data.staffId
Write-Host "    TransactionId: $txId" -ForegroundColor Green
Write-Host "    TransactionCode: $txCode" -ForegroundColor Green
Write-Host "    StaffId duoc phan bo: $staffId" -ForegroundColor Green
Write-Host "    Status: $($withdrawRes.data.status)" -ForegroundColor Yellow

# Kiem tra so du chua bi tru
$acc2 = Invoke-RestMethod -Uri "$BaseUrl/account/me" -Method GET -Headers @{ "X-User-Id"=$userId; "Authorization"="Bearer $userToken" }
Write-Host "    So du (chua confirm): $($acc2.data.balance) VND" -ForegroundColor Gray

Write-Host "`n=== GIAO DICH DA TAO - CHO STAFF XAC NHAN ===" -ForegroundColor Magenta
Write-Host "    TransactionId: $txId"
Write-Host "    TransactionCode: $txCode"
Write-Host "    StaffId: $staffId"
Write-Host "    Amount: 50,000 VND"
Write-Host ""
Write-Host "    => Dang nhap Staff tren UI de xac nhan giao dich nay!" -ForegroundColor Yellow
Write-Host ""

# Luu thong tin de test
$txId | Out-File "temp_txid.txt" -Encoding UTF8

# Hoi nguoi dung co muon tu dong confirm khong
$confirm = Read-Host "Ban co muon tu dong confirm bang script? (y/n)"
if ($confirm -eq "y") {
    Write-Host "`n[7] Staff xac nhan giao dich..." -ForegroundColor Yellow
    try {
        $confirmRes = Invoke-RestMethod -Uri "$BaseUrl/transactions/withdraw-counter/$txId/confirm" -Method POST -Headers @{ "X-User-Id"=$staffId; "Authorization"="Bearer $adminToken" }
        Write-Host "    Status: $($confirmRes.data.status)" -ForegroundColor Green
        Write-Host "    So du moi: $($confirmRes.data.balance) VND" -ForegroundColor Green
        
        # Kiem tra so du cuoi
        $accFinal = Invoke-RestMethod -Uri "$BaseUrl/account/me" -Method GET -Headers @{ "X-User-Id"=$userId; "Authorization"="Bearer $userToken" }
        $balanceAfter = $accFinal.data.balance
        
        Write-Host "`n=== KET QUA ===" -ForegroundColor Cyan
        Write-Host "    So du truoc: $balanceBefore VND"
        Write-Host "    Rut: 50,000 VND"
        Write-Host "    So du sau: $balanceAfter VND"
        $expected = $balanceBefore - 50000
        if ($balanceAfter -eq $expected) {
            Write-Host "`n    [PASS] Rut tien thanh cong!" -ForegroundColor Green
        }
    } catch {
        Write-Host "    Confirm FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}
