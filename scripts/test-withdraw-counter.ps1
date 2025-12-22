# Test Rút Tiền Tại Quầy - Mini Banking System
# Chạy: .\scripts\test-withdraw-counter.ps1

$BaseUrl = "http://localhost:8080/api/v1"

function Invoke-Api {
    param($Method, $Endpoint, $Body = $null, $Headers = @{})
    $url = "$BaseUrl$Endpoint"
    $reqHeaders = @{ "Content-Type" = "application/json" }
    foreach ($k in $Headers.Keys) { $reqHeaders[$k] = $Headers[$k] }
    try {
        $params = @{ Uri = $url; Method = $Method; Headers = $reqHeaders; ContentType = "application/json"; TimeoutSec = 30 }
        if ($Body -and $Method -ne "GET") { $params["Body"] = ($Body | ConvertTo-Json -Depth 10) }
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    } catch {
        $errorMsg = $_.Exception.Message
        try { 
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            if ($errorBody.message) { $errorMsg = $errorBody.message }
            elseif ($errorBody.error) { $errorMsg = $errorBody.error }
        } catch {}
        return @{ Success = $false; Error = $errorMsg }
    }
}

Write-Host "`n========== TEST RUT TIEN TAI QUAY ==========" -ForegroundColor Cyan

# 1. Login user có sẵn (customer1 - đã có KYC approved)
Write-Host "`n[1] Login user customer1..." -ForegroundColor Yellow
$testEmail = "customer1@example.com"
$testPassword = "customer123"

$userLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{ email = $testEmail; password = $testPassword }

if (-not $userLogin.Success) {
    Write-Host "  [FAIL] Login failed: $($userLogin.Error)" -ForegroundColor Red
    exit 1
}

$userToken = $userLogin.Data.accessToken
Write-Host "  [OK] Login thanh cong" -ForegroundColor Green

# 3. Lấy thông tin user
$userMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $userToken" }
$userId = $userMe.Data.data.userId
Write-Host "  UserId: $userId"

# 4. Kiểm tra account và số dư
Write-Host "`n[3] Kiểm tra tài khoản..." -ForegroundColor Yellow
$account = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $userId }

if (-not $account.Success) {
    Write-Host "  [FAIL] Không có tài khoản. Cần hoàn thành KYC trước." -ForegroundColor Red
    exit 1
}

$accountId = $account.Data.data.accountId
$balanceBefore = $account.Data.data.balance
$accountStatus = $account.Data.data.status

Write-Host "  AccountId: $accountId"
Write-Host "  Status: $accountStatus"
Write-Host "  Số dư hiện tại: $($balanceBefore.ToString('N0')) VND" -ForegroundColor Cyan

if ($balanceBefore -lt 100000) {
    Write-Host "  [WARN] Số dư quá thấp để test rút tiền. Cần nạp tiền trước." -ForegroundColor Yellow
    exit 1
}

# 5. Lấy danh sách quầy
Write-Host "`n[4] Lấy danh sách quầy..." -ForegroundColor Yellow
$counters = Invoke-Api -Method "GET" -Endpoint "/counters"

if (-not $counters.Success -or $counters.Data.data.Count -eq 0) {
    Write-Host "  [FAIL] Không có quầy giao dịch" -ForegroundColor Red
    exit 1
}

$counterId = $counters.Data.data[0].counterId
$counterName = $counters.Data.data[0].name
Write-Host "  [OK] Sử dụng quầy: $counterName ($counterId)" -ForegroundColor Green

# 6. Tạo yêu cầu rút tiền tại quầy
$withdrawAmount = 100000
Write-Host "`n[5] Tạo yêu cầu rút tiền: $($withdrawAmount.ToString('N0')) VND..." -ForegroundColor Yellow

$withdraw = Invoke-Api -Method "POST" -Endpoint "/transactions/withdraw-counter" -Headers @{
    "X-User-Id" = $userId
} -Body @{
    amount = $withdrawAmount
    counterId = $counterId
}

if (-not $withdraw.Success) {
    Write-Host "  [FAIL] Tạo yêu cầu rút tiền thất bại: $($withdraw.Error)" -ForegroundColor Red
    exit 1
}

$txId = $withdraw.Data.data.transactionId
$txCode = $withdraw.Data.data.transactionCode
$txStatus = $withdraw.Data.data.status
$staffId = $withdraw.Data.data.staffId

Write-Host "  [OK] Tạo giao dịch thành công" -ForegroundColor Green
Write-Host "  TransactionId: $txId"
Write-Host "  TransactionCode: $txCode"
Write-Host "  Status: $txStatus"
Write-Host "  StaffId được phân bổ: $staffId"

# Lưu transaction ID
$txId | Out-File -FilePath "temp_txid.txt" -NoNewline

# 7. Kiểm tra giao dịch pending
Write-Host "`n[6] Kiểm tra giao dịch pending..." -ForegroundColor Yellow
$pending = Invoke-Api -Method "GET" -Endpoint "/transactions/pending-counter" -Headers @{ "X-User-Id" = $userId }

if ($pending.Success) {
    $pendingCount = $pending.Data.data.Count
    Write-Host "  [OK] Số giao dịch pending: $pendingCount" -ForegroundColor Green
}

# 8. Staff xác nhận rút tiền
Write-Host "`n[7] Staff xác nhận rút tiền..." -ForegroundColor Yellow

$confirm = Invoke-Api -Method "POST" -Endpoint "/transactions/withdraw-counter/$txId/confirm" -Headers @{
    "X-User-Id" = $staffId
}

if (-not $confirm.Success) {
    Write-Host "  [FAIL] Staff xác nhận thất bại: $($confirm.Error)" -ForegroundColor Red
    exit 1
}

$confirmStatus = $confirm.Data.data.status
Write-Host "  [OK] Xác nhận thành công - Status: $confirmStatus" -ForegroundColor Green

# 9. Kiểm tra số dư sau khi rút
Write-Host "`n[8] Kiểm tra số dư sau khi rút..." -ForegroundColor Yellow
$accountAfter = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $userId }

$balanceAfter = $accountAfter.Data.data.balance
$expectedBalance = $balanceBefore - $withdrawAmount

Write-Host "  Số dư trước: $($balanceBefore.ToString('N0')) VND"
Write-Host "  Số tiền rút: $($withdrawAmount.ToString('N0')) VND"
Write-Host "  Số dư sau:   $($balanceAfter.ToString('N0')) VND"
Write-Host "  Số dư kỳ vọng: $($expectedBalance.ToString('N0')) VND"

if ($balanceAfter -eq $expectedBalance) {
    Write-Host "`n  [PASS] Số dư đã được trừ đúng!" -ForegroundColor Green
} else {
    Write-Host "`n  [FAIL] Số dư không khớp!" -ForegroundColor Red
}

Write-Host "`n========== KẾT THÚC TEST ==========" -ForegroundColor Cyan
