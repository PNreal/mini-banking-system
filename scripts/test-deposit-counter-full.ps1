# Mini Banking System - Test Nạp Tiền Tại Quầy (Full Scenario)
# Kịch bản: 3 user mới đăng ký, 1 quầy mới với 5 nhân viên mới
# Chạy: .\scripts\test-deposit-counter-full.ps1

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
            $errorMsg = $errorBody.message ?? $errorBody.error ?? $errorMsg
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
Write-Host "  TEST NẠP TIỀN TẠI QUẦY - FULL SCENARIO" -ForegroundColor Magenta
Write-Host "  3 Users mới + 1 Quầy mới + 5 Nhân viên mới" -ForegroundColor Magenta
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
    Write-Host "`n[ERROR] Không thể đăng nhập Admin. Dừng test." -ForegroundColor Red
    exit 1
}

$adminToken = $adminLogin.Data.accessToken
Write-Result "Admin login" $true "Token received"

# Lấy Admin userId
$adminMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $adminToken" }
$adminUserId = $adminMe.Data.data.userId
Write-Info "Admin userId: $adminUserId"


# ============================================
# STEP 2: Admin tạo 5 nhân viên mới
# ============================================
Write-Step "2" "Admin tạo 5 nhân viên mới"

$staffList = @()
$staffEmails = @()
$staffPasswords = @()

for ($i = 1; $i -le 5; $i++) {
    $staffEmail = "staff_test_${timestamp}_$i@minibank.com"
    $staffPassword = "StaffPass@$i"
    $staffFullName = "Nhan Vien Test $i"
    $staffPhone = "090${timestamp}".Substring(0, 10) + $i
    
    # Tạo nhân viên qua internal API hoặc admin API
    # Sử dụng register endpoint với role STAFF
    $createStaff = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
        email = $staffEmail
        password = $staffPassword
        fullName = $staffFullName
        phoneNumber = $staffPhone
    }
    
    if ($createStaff.Success) {
        # Login để lấy userId
        $staffLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
            email = $staffEmail
            password = $staffPassword
        }
        
        if ($staffLogin.Success) {
            $staffToken = $staffLogin.Data.accessToken
            $staffMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $staffToken" }
            $staffUserId = $staffMe.Data.data.userId
            
            $staffList += @{
                userId = $staffUserId
                email = $staffEmail
                password = $staffPassword
                fullName = $staffFullName
                token = $staffToken
            }
            $staffEmails += $staffEmail
            $staffPasswords += $staffPassword
            
            Write-Result "Tạo nhân viên $i" $true "Email: $staffEmail, UserId: $staffUserId"
        } else {
            Write-Result "Tạo nhân viên $i" $false "Không thể login: $($staffLogin.Error)"
        }
    } else {
        Write-Result "Tạo nhân viên $i" $false $createStaff.Error
    }
}

Write-Info "Đã tạo $($staffList.Count)/5 nhân viên"

# ============================================
# STEP 3: Admin tạo quầy giao dịch mới
# ============================================
Write-Step "3" "Admin tạo quầy giao dịch mới"

$counterCode = "TEST$timestamp".Substring(0, 10)
$counterAdminEmail = "counter_admin_$timestamp@minibank.com"

$createCounter = Invoke-Api -Method "POST" -Endpoint "/counters" -Headers @{
    "X-User-Role" = "ADMIN"
    "Authorization" = "Bearer $adminToken"
} -Body @{
    counterCode = $counterCode
    name = "Quay Test $timestamp"
    address = "123 Test Street, Ha Noi"
    maxStaff = 10
    adminEmail = $counterAdminEmail
    adminFullName = "Counter Admin Test"
    adminPhoneNumber = "091$($timestamp.Substring(0,7))"
}

if ($createCounter.Success) {
    $counterId = $createCounter.Data.data.counter.counterId
    $counterAdminUserId = $createCounter.Data.data.adminAccount.userId
    $counterAdminTempPass = $createCounter.Data.data.adminAccount.temporaryPassword
    
    Write-Result "Tạo quầy giao dịch" $true "CounterId: $counterId"
    Write-Info "Counter Code: $counterCode"
    Write-Info "Counter Admin Email: $counterAdminEmail"
    Write-Info "Counter Admin Temp Password: $counterAdminTempPass"
} else {
    Write-Result "Tạo quầy giao dịch" $false $createCounter.Error
    
    # Thử lấy quầy hiện có
    Write-Info "Thử lấy quầy giao dịch hiện có..."
    $counters = Invoke-Api -Method "GET" -Endpoint "/counters" -Headers @{ "X-User-Role" = "ADMIN" }
    if ($counters.Success -and $counters.Data.data.Count -gt 0) {
        $counterId = $counters.Data.data[0].counterId
        Write-Info "Sử dụng quầy hiện có: $counterId"
    } else {
        Write-Host "`n[ERROR] Không thể tạo hoặc lấy quầy giao dịch. Dừng test." -ForegroundColor Red
        exit 1
    }
}


# ============================================
# STEP 4: Admin thêm 5 nhân viên vào quầy
# ============================================
Write-Step "4" "Admin thêm 5 nhân viên vào quầy"

$assignedStaff = @()

foreach ($staff in $staffList) {
    $addStaff = Invoke-Api -Method "POST" -Endpoint "/counters/$counterId/staff" -Headers @{
        "X-User-Role" = "ADMIN"
        "Authorization" = "Bearer $adminToken"
    } -Body @{
        userId = $staff.userId
    }
    
    if ($addStaff.Success) {
        $assignedStaff += $staff
        Write-Result "Thêm $($staff.fullName) vào quầy" $true "UserId: $($staff.userId)"
    } else {
        # Thử thêm bằng email
        $addStaffByEmail = Invoke-Api -Method "POST" -Endpoint "/counters/$counterId/staff" -Headers @{
            "X-User-Role" = "ADMIN"
            "Authorization" = "Bearer $adminToken"
        } -Body @{
            email = $staff.email
        }
        
        if ($addStaffByEmail.Success) {
            $assignedStaff += $staff
            Write-Result "Thêm $($staff.fullName) vào quầy" $true "Email: $($staff.email)"
        } else {
            Write-Result "Thêm $($staff.fullName) vào quầy" $false $addStaff.Error
        }
    }
}

Write-Info "Đã thêm $($assignedStaff.Count)/5 nhân viên vào quầy"

# Kiểm tra danh sách nhân viên trong quầy
$counterStaff = Invoke-Api -Method "GET" -Endpoint "/counters/$counterId/staff"
if ($counterStaff.Success) {
    Write-Info "Số nhân viên trong quầy: $($counterStaff.Data.data.Count)"
}

# ============================================
# STEP 5: Đăng ký 3 user mới
# ============================================
Write-Step "5" "Đăng ký 3 user mới"

$userList = @()

for ($i = 1; $i -le 3; $i++) {
    $userEmail = "user_deposit_test_${timestamp}_$i@example.com"
    $userPassword = "UserPass@$i"
    $userFullName = "Nguyen Van User $i"
    $userPhone = "092${timestamp}".Substring(0, 10) + $i
    
    $register = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
        email = $userEmail
        password = $userPassword
        fullName = $userFullName
        phoneNumber = $userPhone
    }
    
    if ($register.Success) {
        # Login để lấy userId
        $userLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
            email = $userEmail
            password = $userPassword
        }
        
        if ($userLogin.Success) {
            $userToken = $userLogin.Data.accessToken
            $userMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $userToken" }
            $userId = $userMe.Data.data.userId
            
            $userList += @{
                userId = $userId
                email = $userEmail
                password = $userPassword
                fullName = $userFullName
                phoneNumber = $userPhone
                token = $userToken
            }
            
            Write-Result "Đăng ký user $i" $true "Email: $userEmail, UserId: $userId"
        } else {
            Write-Result "Đăng ký user $i" $false "Không thể login: $($userLogin.Error)"
        }
    } else {
        Write-Result "Đăng ký user $i" $false $register.Error
    }
}

Write-Info "Đã đăng ký $($userList.Count)/3 users"


# ============================================
# STEP 6: Submit KYC cho 3 users
# ============================================
Write-Step "6" "Submit KYC cho 3 users"

$kycList = @()

for ($i = 0; $i -lt $userList.Count; $i++) {
    $user = $userList[$i]
    $citizenId = "0123456789" + ($i + 10).ToString("00")
    
    $submitKyc = Invoke-Api -Method "POST" -Endpoint "/kyc/submit" -Headers @{
        "Authorization" = "Bearer $($user.token)"
    } -Body @{
        citizenId = $citizenId
        fullName = $user.fullName
        dateOfBirth = "1990-01-$(($i + 1).ToString('00'))"
        gender = "MALE"
        placeOfIssue = "Ha Noi"
        dateOfIssue = "2020-01-01"
        expiryDate = "2030-01-01"
        permanentAddress = "123 Test Street $($i + 1), Ha Noi"
        currentAddress = "456 Current Street $($i + 1), Ha Noi"
        phoneNumber = $user.phoneNumber
        frontIdImageUrl = "http://example.com/front_$($i + 1).jpg"
        backIdImageUrl = "http://example.com/back_$($i + 1).jpg"
        selfieImageUrl = "http://example.com/selfie_$($i + 1).jpg"
    }
    
    if ($submitKyc.Success) {
        $kycId = $submitKyc.Data.data.kycId
        $kycList += @{
            kycId = $kycId
            userId = $user.userId
            email = $user.email
            citizenId = $citizenId
        }
        Write-Result "Submit KYC cho $($user.fullName)" $true "KycId: $kycId"
    } else {
        Write-Result "Submit KYC cho $($user.fullName)" $false $submitKyc.Error
    }
}

Write-Info "Đã submit $($kycList.Count)/3 KYC requests"

# ============================================
# STEP 7: Admin duyệt KYC cho 3 users
# ============================================
Write-Step "7" "Admin duyệt KYC cho 3 users"

foreach ($kyc in $kycList) {
    $approveKyc = Invoke-Api -Method "POST" -Endpoint "/kyc/admin/$($kyc.kycId)/review" -Headers @{
        "Authorization" = "Bearer $adminToken"
        "X-User-Role" = "ADMIN"
    } -Body @{
        status = "APPROVED"
        notes = "KYC approved for testing"
    }
    
    if ($approveKyc.Success) {
        Write-Result "Duyệt KYC cho $($kyc.email)" $true
    } else {
        Write-Result "Duyệt KYC cho $($kyc.email)" $false $approveKyc.Error
    }
}

# Đợi một chút để hệ thống xử lý
Start-Sleep -Seconds 2

# Kiểm tra trạng thái account sau KYC
Write-Info "Kiểm tra trạng thái account sau khi duyệt KYC..."
foreach ($user in $userList) {
    # Re-login để refresh token
    $reLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
        email = $user.email
        password = $user.password
    }
    
    if ($reLogin.Success) {
        $user.token = $reLogin.Data.accessToken
        
        $accStatus = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{
            "X-User-Id" = $user.userId
        }
        
        if ($accStatus.Success) {
            $status = $accStatus.Data.data.status
            $balance = $accStatus.Data.data.balance
            $accountId = $accStatus.Data.data.accountId
            
            # Cập nhật accountId vào user
            for ($j = 0; $j -lt $userList.Count; $j++) {
                if ($userList[$j].userId -eq $user.userId) {
                    $userList[$j].accountId = $accountId
                    $userList[$j].token = $user.token
                    break
                }
            }
            
            Write-Info "$($user.email): Status=$status, Balance=$balance, AccountId=$accountId"
        }
    }
}


# ============================================
# STEP 8: 3 Users nạp tiền tại quầy
# ============================================
Write-Step "8" "3 Users nạp tiền tại quầy"

$depositTransactions = @()
$depositAmounts = @(1000000, 2000000, 3000000)  # 1M, 2M, 3M VND

for ($i = 0; $i -lt $userList.Count; $i++) {
    $user = $userList[$i]
    $amount = $depositAmounts[$i]
    
    # Lấy số dư trước khi nạp
    $beforeDeposit = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{
        "X-User-Id" = $user.userId
    }
    $balanceBefore = if ($beforeDeposit.Success) { $beforeDeposit.Data.data.balance } else { 0 }
    
    # Tạo giao dịch nạp tiền tại quầy
    $deposit = Invoke-Api -Method "POST" -Endpoint "/transactions/deposit-counter" -Headers @{
        "X-User-Id" = $user.userId
    } -Body @{
        amount = $amount
        counterId = $counterId
    }
    
    if ($deposit.Success) {
        $txId = $deposit.Data.data.transactionId
        $txCode = $deposit.Data.data.transactionCode
        $txStatus = $deposit.Data.data.status
        
        $depositTransactions += @{
            transactionId = $txId
            transactionCode = $txCode
            userId = $user.userId
            userEmail = $user.email
            amount = $amount
            status = $txStatus
            balanceBefore = $balanceBefore
        }
        
        Write-Result "User $($i + 1) tạo giao dịch nạp tiền" $true "Amount: $($amount.ToString('N0')) VND"
        Write-Info "  TransactionId: $txId"
        Write-Info "  TransactionCode: $txCode"
        Write-Info "  Status: $txStatus"
    } else {
        Write-Result "User $($i + 1) tạo giao dịch nạp tiền" $false $deposit.Error
    }
}

Write-Info "Đã tạo $($depositTransactions.Count)/3 giao dịch nạp tiền"

# ============================================
# STEP 9: Kiểm tra giao dịch pending tại quầy
# ============================================
Write-Step "9" "Kiểm tra giao dịch pending tại quầy"

foreach ($user in $userList) {
    $pending = Invoke-Api -Method "GET" -Endpoint "/transactions/pending-counter" -Headers @{
        "X-User-Id" = $user.userId
    }
    
    if ($pending.Success) {
        $pendingCount = $pending.Data.data.Count
        Write-Result "Giao dịch pending của $($user.email)" $true "Số lượng: $pendingCount"
    } else {
        Write-Result "Giao dịch pending của $($user.email)" $false $pending.Error
    }
}

# ============================================
# STEP 10: Staff xác nhận giao dịch
# ============================================
Write-Step "10" "Staff xác nhận giao dịch nạp tiền"

# Sử dụng nhân viên đầu tiên trong danh sách để xác nhận
if ($assignedStaff.Count -gt 0) {
    $confirmStaff = $assignedStaff[0]
    
    # Re-login staff để lấy token mới
    $staffReLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
        email = $confirmStaff.email
        password = $confirmStaff.password
    }
    
    if ($staffReLogin.Success) {
        $confirmStaff.token = $staffReLogin.Data.accessToken
    }
    
    Write-Info "Staff xác nhận: $($confirmStaff.email)"
    
    foreach ($tx in $depositTransactions) {
        $confirm = Invoke-Api -Method "POST" -Endpoint "/transactions/deposit-counter/$($tx.transactionId)/confirm" -Headers @{
            "X-User-Id" = $confirmStaff.userId
        }
        
        if ($confirm.Success) {
            Write-Result "Xác nhận giao dịch $($tx.transactionCode)" $true "Amount: $($tx.amount.ToString('N0')) VND"
        } else {
            Write-Result "Xác nhận giao dịch $($tx.transactionCode)" $false $confirm.Error
        }
    }
} else {
    Write-Host "  [WARN] Không có nhân viên để xác nhận giao dịch" -ForegroundColor Yellow
    
    # Thử dùng staff mặc định
    Write-Info "Thử dùng staff mặc định..."
    $defaultStaffLogin = Invoke-Api -Method "POST" -Endpoint "/users/staff/login" -Body @{
        email = "staff@minibank.com"
        password = "Staff@123"
    }
    
    if ($defaultStaffLogin.Success) {
        $defaultStaffToken = $defaultStaffLogin.Data.accessToken
        $defaultStaffMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $defaultStaffToken" }
        $defaultStaffId = $defaultStaffMe.Data.data.userId
        
        foreach ($tx in $depositTransactions) {
            $confirm = Invoke-Api -Method "POST" -Endpoint "/transactions/deposit-counter/$($tx.transactionId)/confirm" -Headers @{
                "X-User-Id" = $defaultStaffId
            }
            
            if ($confirm.Success) {
                Write-Result "Xác nhận giao dịch $($tx.transactionCode)" $true
            } else {
                Write-Result "Xác nhận giao dịch $($tx.transactionCode)" $false $confirm.Error
            }
        }
    }
}

