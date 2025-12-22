# Mini Banking System - Test Rút Tiền Tại Quầy (Full Scenario)
# Kịch bản: User có tiền trong tài khoản -> tạo yêu cầu rút tiền tại quầy -> Staff xác nhận -> Trừ tiền
# Chạy: .\scripts\test-withdraw-counter-full.ps1

$BaseUrl = "http://localhost:8080/api/v1"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# ============================================
# HELPER FUNCTIONS
# ============================================
function Invoke-Api {
    param($Method, $Endpoint, $Body = @{}, $Headers = @{})
    
    $url = "$BaseUrl$Endpoint"
    $reqHeaders = @{ "Content-Type" = "application/json" }
    foreach ($k in $Headers.Keys) { $reqHeaders[$k] = $Headers[$k] }
    
    try {
        $params = @{ Uri = $url; Method = $Method; Headers = $reqHeaders; ContentType = "application/json" }
        if ($Body.Count -gt 0 -and $Method -ne "GET") {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    } catch {
        $errorMsg = $_.Exception.Message
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            if ($errorBody.message) { $errorMsg = $errorBody.message }
            elseif ($errorBody.error) { $errorMsg = $errorBody.error }
        } catch {}
        return @{ Success = $false; Error = $errorMsg; StatusCode = $_.Exception.Response.StatusCode }
    }
}

function Write-Step($step, $msg) {
    Write-Host "`n[$step] $msg" -ForegroundColor Cyan
}

function Write-Result($name, $pass, $msg = "") {
    $color = if ($pass) { "Green" } else { "Red" }
    $status = if ($pass) { "PASS" } else { "FAIL" }
    Write-Host "  [$status] $name" -ForegroundColor $color
    if ($msg) { Write-Host "         $msg" -ForegroundColor $(if ($pass) { "Gray" } else { "Yellow" }) }
}

function Write-Info($msg) {
    Write-Host "  [INFO] $msg" -ForegroundColor Gray
}

# ============================================
# MAIN TEST SCRIPT
# ============================================
Write-Host "`n" + "="*60 -ForegroundColor Magenta
Write-Host "  TEST RÚT TIỀN TẠI QUẦY - FULL SCENARIO" -ForegroundColor Magenta
Write-Host "  User nạp tiền -> Rút tiền tại quầy -> Staff xác nhận" -ForegroundColor Magenta
Write-Host "="*60 -ForegroundColor Magenta

# ============================================
# STEP 1: Admin Login
# ============================================
Write-Step "1" "Admin đăng nhập"

$adminLogin = Invoke-Api -Method "POST" -Endpoint "/users/admin/login" -Body @{
    email = "admin@minibank.com"
    password = "Admin@123"
}

if (-not $adminLogin.Success) {
    Write-Result "Admin login" $false $adminLogin.Error
    exit 1
}

$adminToken = $adminLogin.Data.accessToken
Write-Result "Admin login" $true "Token received"

$adminMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $adminToken" }
$adminUserId = $adminMe.Data.data.userId
Write-Info "Admin userId: $adminUserId"

# ============================================
# STEP 2: Tạo user mới để test
# ============================================
Write-Step "2" "Tạo user mới để test rút tiền"

$userEmail = "user_withdraw_test_$timestamp@example.com"
$userPassword = "UserPass@123"
$userFullName = "Nguyen Van Withdraw Test"
$userPhone = "092$($timestamp.Substring(0,7))"
$citizenId = "0123456789$($timestamp.Substring(0,2))"

$register = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
    email = $userEmail
    password = $userPassword
    fullName = $userFullName
    phoneNumber = $userPhone
}

if (-not $register.Success) {
    Write-Result "Đăng ký user" $false $register.Error
    exit 1
}
Write-Result "Đăng ký user" $true "Email: $userEmail"

# Login để lấy userId
$userLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
    email = $userEmail
    password = $userPassword
}
$userToken = $userLogin.Data.accessToken
$userMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $userToken" }
$userId = $userMe.Data.data.userId
Write-Info "UserId: $userId"

# Lưu thông tin để debug
$userEmail | Out-File -FilePath "temp_withdraw_test_email.txt" -Encoding UTF8

# ============================================
# STEP 3: Submit và duyệt KYC
# ============================================
Write-Step "3" "Submit và duyệt KYC"

$submitKyc = Invoke-Api -Method "POST" -Endpoint "/kyc/submit" -Headers @{
    "Authorization" = "Bearer $userToken"
} -Body @{
    citizenId = $citizenId
    fullName = $userFullName
    dateOfBirth = "1990-01-15"
    gender = "MALE"
    placeOfIssue = "Ha Noi"
    dateOfIssue = "2020-01-01"
    expiryDate = "2030-01-01"
    permanentAddress = "123 Test Street, Ha Noi"
    currentAddress = "456 Current Street, Ha Noi"
    phoneNumber = $userPhone
    frontIdImageUrl = "http://example.com/front.jpg"
    backIdImageUrl = "http://example.com/back.jpg"
    selfieImageUrl = "http://example.com/selfie.jpg"
}

if (-not $submitKyc.Success) {
    Write-Result "Submit KYC" $false $submitKyc.Error
    exit 1
}
$kycId = $submitKyc.Data.data.kycId
Write-Result "Submit KYC" $true "KycId: $kycId"

# Admin duyệt KYC
$approveKyc = Invoke-Api -Method "POST" -Endpoint "/kyc/admin/$kycId/review" -Headers @{
    "Authorization" = "Bearer $adminToken"
    "X-User-Role" = "ADMIN"
} -Body @{
    status = "APPROVED"
    notes = "KYC approved for withdraw testing"
}

if ($approveKyc.Success) {
    Write-Result "Duyệt KYC" $true
} else {
    Write-Result "Duyệt KYC" $false $approveKyc.Error
    exit 1
}

Start-Sleep -Seconds 2

# Re-login để refresh token
$userLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
    email = $userEmail
    password = $userPassword
}
$userToken = $userLogin.Data.accessToken


# ============================================
# STEP 4: Nạp tiền vào tài khoản (để có tiền rút)
# ============================================
Write-Step "4" "Nạp tiền vào tài khoản (5,000,000 VND)"

$depositAmount = 5000000

$deposit = Invoke-Api -Method "POST" -Endpoint "/transactions/deposit" -Headers @{
    "X-User-Id" = $userId
    "Authorization" = "Bearer $userToken"
} -Body @{
    amount = $depositAmount
}

if ($deposit.Success) {
    Write-Result "Nạp tiền" $true "Amount: $($depositAmount.ToString('N0')) VND"
} else {
    Write-Result "Nạp tiền" $false $deposit.Error
    exit 1
}

# Kiểm tra số dư sau khi nạp
$accInfo = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ 
    "X-User-Id" = $userId 
    "Authorization" = "Bearer $userToken"
}
if ($accInfo.Success -and $accInfo.Data.data) {
    $balanceAfterDeposit = $accInfo.Data.data.balance
    $accountId = $accInfo.Data.data.accountId
    Write-Info "Số dư sau nạp: $($balanceAfterDeposit.ToString('N0')) VND"
    Write-Info "AccountId: $accountId"
} else {
    Write-Info "Không lấy được thông tin account, thử lại..."
    Start-Sleep -Seconds 1
    $accInfo = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ 
        "X-User-Id" = $userId 
        "Authorization" = "Bearer $userToken"
    }
    $balanceAfterDeposit = $accInfo.Data.data.balance
    $accountId = $accInfo.Data.data.accountId
    Write-Info "Số dư sau nạp: $($balanceAfterDeposit.ToString('N0')) VND"
}

# ============================================
# STEP 5: Lấy quầy giao dịch
# ============================================
Write-Step "5" "Lấy quầy giao dịch"

$counters = Invoke-Api -Method "GET" -Endpoint "/counters" -Headers @{ 
    "X-User-Role" = "ADMIN" 
    "Authorization" = "Bearer $adminToken"
}

if (-not $counters.Success -or -not $counters.Data.data -or $counters.Data.data.Count -eq 0) {
    Write-Result "Lấy quầy giao dịch" $false "Không có quầy nào, tạo quầy mới..."
    
    # Tạo quầy mới
    $createCounter = Invoke-Api -Method "POST" -Endpoint "/counters" -Headers @{
        "X-User-Role" = "ADMIN"
        "Authorization" = "Bearer $adminToken"
    } -Body @{
        counterCode = "TEST$($timestamp.Substring(0,6))"
        name = "Quay Test Withdraw"
        address = "123 Test Street"
        maxStaff = 10
        adminEmail = "counter_admin_$timestamp@minibank.com"
        adminFullName = "Counter Admin Test"
        adminPhoneNumber = "091$($timestamp.Substring(0,7))"
    }
    
    if ($createCounter.Success) {
        $counterId = $createCounter.Data.data.counter.counterId
        $counterName = $createCounter.Data.data.counter.name
        Write-Result "Tạo quầy mới" $true "CounterId: $counterId"
    } else {
        Write-Result "Tạo quầy mới" $false $createCounter.Error
        exit 1
    }
} else {
    $counterId = $counters.Data.data[0].counterId
    $counterName = $counters.Data.data[0].name
    Write-Result "Lấy quầy giao dịch" $true "CounterId: $counterId"
    Write-Info "Tên quầy: $counterName"
}

# Lấy danh sách nhân viên trong quầy
$counterStaff = Invoke-Api -Method "GET" -Endpoint "/counters/$counterId/staff"
if ($counterStaff.Success) {
    Write-Info "Số nhân viên trong quầy: $($counterStaff.Data.data.Count)"
}


# ============================================
# STEP 6: User tạo yêu cầu rút tiền tại quầy
# ============================================
Write-Step "6" "User tạo yêu cầu rút tiền tại quầy"

$withdrawAmount = 2000000

Write-Info "Số dư hiện tại: $($balanceAfterDeposit.ToString('N0')) VND"
Write-Info "Số tiền muốn rút: $($withdrawAmount.ToString('N0')) VND"

$withdraw = Invoke-Api -Method "POST" -Endpoint "/transactions/withdraw-counter" -Headers @{
    "X-User-Id" = $userId
    "Authorization" = "Bearer $userToken"
} -Body @{
    amount = $withdrawAmount
    counterId = $counterId
}

if ($withdraw.Success) {
    $txId = $withdraw.Data.data.transactionId
    $txCode = $withdraw.Data.data.transactionCode
    $txStatus = $withdraw.Data.data.status
    $staffId = $withdraw.Data.data.staffId
    
    Write-Result "Tạo yêu cầu rút tiền" $true "Amount: $($withdrawAmount.ToString('N0')) VND"
    Write-Info "TransactionId: $txId"
    Write-Info "TransactionCode: $txCode"
    Write-Info "Status: $txStatus"
    Write-Info "StaffId được phân bổ: $staffId"
} else {
    Write-Result "Tạo yêu cầu rút tiền" $false $withdraw.Error
    exit 1
}

# Kiểm tra số dư chưa bị trừ (vì chưa confirm)
$accInfoPending = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $userId }
$balancePending = $accInfoPending.Data.data.balance
Write-Info "Số dư sau tạo yêu cầu (chưa confirm): $($balancePending.ToString('N0')) VND"

if ($balancePending -eq $balanceAfterDeposit) {
    Write-Result "Số dư chưa bị trừ" $true "Đúng logic - chờ staff confirm"
} else {
    Write-Result "Số dư chưa bị trừ" $false "Số dư đã bị thay đổi trước khi confirm!"
}


# ============================================
# STEP 7: Kiểm tra giao dịch pending
# ============================================
Write-Step "7" "Kiểm tra giao dịch pending của user"

$pending = Invoke-Api -Method "GET" -Endpoint "/transactions/pending-counter" -Headers @{
    "X-User-Id" = $userId
}

if ($pending.Success) {
    $pendingCount = $pending.Data.data.Count
    Write-Result "Lấy giao dịch pending" $true "Số lượng: $pendingCount"
    
    foreach ($p in $pending.Data.data) {
        Write-Info "  - $($p.type): $($p.amount.ToString('N0')) VND - Status: $($p.status)"
    }
} else {
    Write-Result "Lấy giao dịch pending" $false $pending.Error
}

# ============================================
# STEP 8: Staff xác nhận giao dịch rút tiền
# ============================================
Write-Step "8" "Staff xác nhận giao dịch rút tiền"

# Sử dụng staffId được phân bổ từ giao dịch
Write-Info "Staff xác nhận: $staffId"

$confirm = Invoke-Api -Method "POST" -Endpoint "/transactions/withdraw-counter/$txId/confirm" -Headers @{
    "X-User-Id" = $staffId
}

if ($confirm.Success) {
    $confirmedStatus = $confirm.Data.data.status
    $newBalance = $confirm.Data.data.balance
    
    Write-Result "Staff xác nhận rút tiền" $true "Status: $confirmedStatus"
    Write-Info "Số dư mới sau confirm: $($newBalance.ToString('N0')) VND"
} else {
    Write-Result "Staff xác nhận rút tiền" $false $confirm.Error
    
    # Thử với staff mặc định
    Write-Info "Thử với staff mặc định..."
    $defaultStaffLogin = Invoke-Api -Method "POST" -Endpoint "/users/staff/login" -Body @{
        email = "staff@minibank.com"
        password = "Staff@123"
    }
    
    if ($defaultStaffLogin.Success) {
        $defaultStaffMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ 
            "Authorization" = "Bearer $($defaultStaffLogin.Data.accessToken)" 
        }
        $defaultStaffId = $defaultStaffMe.Data.data.userId
        
        $confirm2 = Invoke-Api -Method "POST" -Endpoint "/transactions/withdraw-counter/$txId/confirm" -Headers @{
            "X-User-Id" = $defaultStaffId
        }
        
        if ($confirm2.Success) {
            Write-Result "Staff mặc định xác nhận" $true
        } else {
            Write-Result "Staff mặc định xác nhận" $false $confirm2.Error
        }
    }
}


# ============================================
# STEP 9: Kiểm tra số dư sau khi rút tiền
# ============================================
Write-Step "9" "Kiểm tra số dư sau khi rút tiền"

$accInfoAfter = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $userId }
$balanceAfterWithdraw = $accInfoAfter.Data.data.balance

$expectedBalance = $balanceAfterDeposit - $withdrawAmount

Write-Info "Số dư trước rút: $($balanceAfterDeposit.ToString('N0')) VND"
Write-Info "Số tiền rút: $($withdrawAmount.ToString('N0')) VND"
Write-Info "Số dư sau rút: $($balanceAfterWithdraw.ToString('N0')) VND"
Write-Info "Số dư kỳ vọng: $($expectedBalance.ToString('N0')) VND"

if ($balanceAfterWithdraw -eq $expectedBalance) {
    Write-Result "Kiểm tra số dư" $true "Số dư đúng sau khi rút tiền"
} else {
    Write-Result "Kiểm tra số dư" $false "Số dư không khớp! Expected: $expectedBalance, Actual: $balanceAfterWithdraw"
}

# ============================================
# STEP 10: Kiểm tra lịch sử giao dịch
# ============================================
Write-Step "10" "Kiểm tra lịch sử giao dịch"

$history = Invoke-Api -Method "GET" -Endpoint "/transactions/history?type=COUNTER_WITHDRAW" -Headers @{
    "X-User-Id" = $userId
}

if ($history.Success) {
    $withdrawTxs = $history.Data.data.content
    Write-Result "Lấy lịch sử giao dịch" $true "Số giao dịch COUNTER_WITHDRAW: $($withdrawTxs.Count)"
    
    foreach ($tx in $withdrawTxs) {
        Write-Info "  - $($tx.transactionCode): $($tx.amount.ToString('N0')) VND - $($tx.status)"
    }
} else {
    Write-Result "Lấy lịch sử giao dịch" $false $history.Error
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n" + "="*60 -ForegroundColor Green
Write-Host "  TEST RÚT TIỀN TẠI QUẦY - HOÀN TẤT" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Green
Write-Host "  User Email: $userEmail" -ForegroundColor White
Write-Host "  Số tiền nạp ban đầu: $($depositAmount.ToString('N0')) VND" -ForegroundColor White
Write-Host "  Số tiền rút: $($withdrawAmount.ToString('N0')) VND" -ForegroundColor White
Write-Host "  Số dư cuối: $($balanceAfterWithdraw.ToString('N0')) VND" -ForegroundColor White
Write-Host "="*60 -ForegroundColor Green
