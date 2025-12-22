# Mini Banking System - Full Test Scenario
# Kịch bản:
# 1. Admin đăng nhập
# 2. Admin tạo 5 nhân viên mới
# 3. Admin tạo 1 quầy mới và thêm 5 nhân viên vào
# 4. Đăng ký 3 user mới
# 5. Admin duyệt KYC cho 3 user
# 6. 3 user thực hiện nạp tiền tại quầy
# 7. Staff xác nhận giao dịch
#
# Chạy: .\scripts\test-full-scenario.ps1

$BaseUrl = "http://localhost:8080/api/v1"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# ============================================
# HELPER FUNCTIONS
# ============================================
function Invoke-Api {
    param($Method, $Endpoint, $Body = $null, $Headers = @{})
    
    $url = "$BaseUrl$Endpoint"
    $reqHeaders = @{ "Content-Type" = "application/json" }
    foreach ($k in $Headers.Keys) { $reqHeaders[$k] = $Headers[$k] }
    
    try {
        $params = @{ Uri = $url; Method = $Method; Headers = $reqHeaders; ContentType = "application/json" }
        if ($Body -and $Method -ne "GET") {
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
    Write-Host "`n" + "="*60 -ForegroundColor Cyan
    Write-Host "  STEP $step : $msg" -ForegroundColor Cyan
    Write-Host "="*60 -ForegroundColor Cyan
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

function Write-Section($msg) {
    Write-Host "`n  --- $msg ---" -ForegroundColor Yellow
}

# ============================================
# STORAGE VARIABLES
# ============================================
$adminToken = $null
$adminUserId = $null
$staffList = @()
$counterId = $null
$userList = @()
$kycList = @()
$depositTransactions = @()

# ============================================
# MAIN TEST SCRIPT
# ============================================
Write-Host "`n" + "#"*60 -ForegroundColor Magenta
Write-Host "#  MINI BANKING SYSTEM - FULL TEST SCENARIO" -ForegroundColor Magenta
Write-Host "#  Timestamp: $timestamp" -ForegroundColor Magenta
Write-Host "#"*60 -ForegroundColor Magenta


# ============================================
# STEP 1: Admin đăng nhập
# ============================================
Write-Step "1" "Admin đăng nhập"

$adminLogin = Invoke-Api -Method "POST" -Endpoint "/users/admin/login" -Body @{
    email = "admin@minibank.com"
    password = "Admin@123"
}

if (-not $adminLogin.Success) {
    Write-Result "Admin login" $false $adminLogin.Error
    Write-Host "`n[FATAL] Không thể đăng nhập Admin. Dừng test." -ForegroundColor Red
    exit 1
}

$adminToken = $adminLogin.Data.accessToken
Write-Result "Admin login" $true "Token received"

# Lấy Admin userId
$adminMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $adminToken" }
if ($adminMe.Success) {
    $adminUserId = $adminMe.Data.data.userId
    Write-Info "Admin userId: $adminUserId"
} else {
    Write-Result "Lấy thông tin Admin" $false $adminMe.Error
    exit 1
}

# ============================================
# STEP 2: Admin tạo 5 nhân viên mới
# ============================================
Write-Step "2" "Admin tạo 5 nhân viên mới"

for ($i = 1; $i -le 5; $i++) {
    $staffEmail = "staff_${timestamp}_$i@minibank.com"
    $staffPassword = "StaffPass@$i"
    $staffFullName = "Nhan Vien Test $i"
    $staffPhone = "090${i}${timestamp}".Substring(0, 10)
    
    Write-Section "Tạo nhân viên $i"
    
    # Đăng ký nhân viên
    $createStaff = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
        email = $staffEmail
        password = $staffPassword
        fullName = $staffFullName
        phoneNumber = $staffPhone
    }
    
    if ($createStaff.Success) {
        Write-Result "Đăng ký nhân viên $i" $true "Email: $staffEmail"
        
        # Login để lấy userId
        $staffLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
            email = $staffEmail
            password = $staffPassword
        }
        
        if ($staffLogin.Success) {
            $staffToken = $staffLogin.Data.accessToken
            $staffMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $staffToken" }
            
            if ($staffMe.Success) {
                $staffUserId = $staffMe.Data.data.userId
                
                $staffList += @{
                    index = $i
                    userId = $staffUserId
                    email = $staffEmail
                    password = $staffPassword
                    fullName = $staffFullName
                    token = $staffToken
                }
                
                Write-Result "Lấy thông tin nhân viên $i" $true "UserId: $staffUserId"
            } else {
                Write-Result "Lấy thông tin nhân viên $i" $false $staffMe.Error
            }
        } else {
            Write-Result "Login nhân viên $i" $false $staffLogin.Error
        }
    } else {
        Write-Result "Đăng ký nhân viên $i" $false $createStaff.Error
    }
}

Write-Host "`n  [SUMMARY] Đã tạo $($staffList.Count)/5 nhân viên" -ForegroundColor Cyan


# ============================================
# STEP 3: Admin tạo quầy mới và thêm 5 nhân viên
# ============================================
Write-Step "3" "Admin tạo quầy mới và thêm 5 nhân viên"

Write-Section "Tạo quầy giao dịch"

$counterCode = "Q$($timestamp.Substring(0,8))"
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
        Write-Host "`n[FATAL] Không thể tạo hoặc lấy quầy giao dịch. Dừng test." -ForegroundColor Red
        exit 1
    }
}

Write-Section "Thêm 5 nhân viên vào quầy"

$assignedStaffCount = 0

foreach ($staff in $staffList) {
    # Thử thêm bằng userId trước
    $addStaff = Invoke-Api -Method "POST" -Endpoint "/counters/$counterId/staff" -Headers @{
        "X-User-Role" = "ADMIN"
        "Authorization" = "Bearer $adminToken"
    } -Body @{
        userId = $staff.userId
    }
    
    if ($addStaff.Success) {
        $assignedStaffCount++
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
            $assignedStaffCount++
            Write-Result "Thêm $($staff.fullName) vào quầy" $true "Email: $($staff.email)"
        } else {
            Write-Result "Thêm $($staff.fullName) vào quầy" $false $addStaff.Error
        }
    }
}

Write-Host "`n  [SUMMARY] Đã thêm $assignedStaffCount/5 nhân viên vào quầy" -ForegroundColor Cyan

# Kiểm tra danh sách nhân viên trong quầy
$counterStaff = Invoke-Api -Method "GET" -Endpoint "/counters/$counterId/staff"
if ($counterStaff.Success) {
    Write-Info "Tổng số nhân viên trong quầy: $($counterStaff.Data.data.Count)"
}


# ============================================
# STEP 4: Đăng ký 3 user mới
# ============================================
Write-Step "4" "Đăng ký 3 user mới"

for ($i = 1; $i -le 3; $i++) {
    $userEmail = "user_test_${timestamp}_$i@example.com"
    $userPassword = "UserPass@$i"
    $userFullName = "Nguyen Van User $i"
    $userPhone = "092${i}${timestamp}".Substring(0, 10)
    
    Write-Section "Đăng ký User $i"
    
    $register = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
        email = $userEmail
        password = $userPassword
        fullName = $userFullName
        phoneNumber = $userPhone
    }
    
    if ($register.Success) {
        Write-Result "Đăng ký user $i" $true "Email: $userEmail"
        
        # Login để lấy userId và token
        $userLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
            email = $userEmail
            password = $userPassword
        }
        
        if ($userLogin.Success) {
            $userToken = $userLogin.Data.accessToken
            $userMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $userToken" }
            
            if ($userMe.Success) {
                $userId = $userMe.Data.data.userId
                
                $userList += @{
                    index = $i
                    userId = $userId
                    email = $userEmail
                    password = $userPassword
                    fullName = $userFullName
                    phoneNumber = $userPhone
                    token = $userToken
                    citizenId = "0123456789" + ($i + 10).ToString("00")
                }
                
                Write-Result "Lấy thông tin user $i" $true "UserId: $userId"
            } else {
                Write-Result "Lấy thông tin user $i" $false $userMe.Error
            }
        } else {
            Write-Result "Login user $i" $false $userLogin.Error
        }
    } else {
        Write-Result "Đăng ký user $i" $false $register.Error
    }
}

Write-Host "`n  [SUMMARY] Đã đăng ký $($userList.Count)/3 users" -ForegroundColor Cyan

# ============================================
# STEP 5: Submit và Admin duyệt KYC cho 3 users
# ============================================
Write-Step "5" "Submit và Admin duyệt KYC cho 3 users"

Write-Section "Submit KYC"

foreach ($user in $userList) {
    $submitKyc = Invoke-Api -Method "POST" -Endpoint "/kyc/submit" -Headers @{
        "Authorization" = "Bearer $($user.token)"
    } -Body @{
        citizenId = $user.citizenId
        fullName = $user.fullName
        dateOfBirth = "1990-01-$(($user.index).ToString('00'))"
        gender = "MALE"
        placeOfIssue = "Ha Noi"
        dateOfIssue = "2020-01-01"
        expiryDate = "2030-01-01"
        permanentAddress = "123 Test Street $($user.index), Ha Noi"
        currentAddress = "456 Current Street $($user.index), Ha Noi"
        phoneNumber = $user.phoneNumber
        frontIdImageUrl = "http://example.com/front_$($user.index).jpg"
        backIdImageUrl = "http://example.com/back_$($user.index).jpg"
        selfieImageUrl = "http://example.com/selfie_$($user.index).jpg"
    }
    
    if ($submitKyc.Success) {
        $kycId = $submitKyc.Data.data.kycId
        $kycList += @{
            kycId = $kycId
            userId = $user.userId
            email = $user.email
            citizenId = $user.citizenId
        }
        Write-Result "Submit KYC cho $($user.fullName)" $true "KycId: $kycId"
    } else {
        Write-Result "Submit KYC cho $($user.fullName)" $false $submitKyc.Error
    }
}

Write-Section "Admin duyệt KYC"

foreach ($kyc in $kycList) {
    $approveKyc = Invoke-Api -Method "POST" -Endpoint "/kyc/admin/$($kyc.kycId)/review" -Headers @{
        "Authorization" = "Bearer $adminToken"
        "X-User-Role" = "ADMIN"
    } -Body @{
        status = "APPROVED"
        notes = "KYC approved for testing - $timestamp"
    }
    
    if ($approveKyc.Success) {
        Write-Result "Duyệt KYC cho $($kyc.email)" $true
    } else {
        Write-Result "Duyệt KYC cho $($kyc.email)" $false $approveKyc.Error
    }
}

# Đợi hệ thống xử lý
Write-Info "Đợi hệ thống xử lý KYC..."
Start-Sleep -Seconds 2

Write-Section "Kiểm tra trạng thái account sau KYC"

foreach ($user in $userList) {
    # Re-login để refresh token
    $reLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
        email = $user.email
        password = $user.password
    }
    
    if ($reLogin.Success) {
        # Cập nhật token mới
        for ($j = 0; $j -lt $userList.Count; $j++) {
            if ($userList[$j].userId -eq $user.userId) {
                $userList[$j].token = $reLogin.Data.accessToken
                break
            }
        }
        
        $accStatus = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{
            "X-User-Id" = $user.userId
        }
        
        if ($accStatus.Success) {
            $status = $accStatus.Data.data.status
            $balance = $accStatus.Data.data.balance
            $accountId = $accStatus.Data.data.accountId
            
            # Cập nhật accountId
            for ($j = 0; $j -lt $userList.Count; $j++) {
                if ($userList[$j].userId -eq $user.userId) {
                    $userList[$j].accountId = $accountId
                    break
                }
            }
            
            Write-Result "Account $($user.email)" $true "Status: $status, Balance: $($balance.ToString('N0')) VND"
        } else {
            Write-Result "Account $($user.email)" $false $accStatus.Error
        }
    }
}

Write-Host "`n  [SUMMARY] Đã duyệt $($kycList.Count)/3 KYC requests" -ForegroundColor Cyan

