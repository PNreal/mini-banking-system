# Script tao 2 user va thuc hien KYC
# Chay: powershell -ExecutionPolicy Bypass -File scripts\create-users-kyc.ps1

$BaseUrl = "http://localhost:8080/api/v1"

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
        $errorBody = ""
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
        } catch {}
        return @{ Success = $false; Error = $_.Exception.Message; Body = $errorBody }
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  TAO 2 USER VA THUC HIEN KYC" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# ============================================
# TAO USER 1
# ============================================
Write-Host ""
Write-Host "--- TAO USER 1 ---" -ForegroundColor Yellow

$user1Email = "user1_$timestamp@example.com"
$user1Password = "User1Password@123"

$result = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
    email = $user1Email
    password = $user1Password
    fullName = "Nguyen Van A"
    phoneNumber = "0901$($timestamp.Substring(0,6))"
}

if ($result.Success) {
    Write-Host "[OK] User 1 da duoc tao: $user1Email" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Khong the tao User 1: $($result.Error)" -ForegroundColor Red
    Write-Host $result.Body -ForegroundColor Gray
}

# Login User 1
$login1 = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
    email = $user1Email
    password = $user1Password
}

$user1Token = ""
$user1Id = ""
if ($login1.Success) {
    $user1Token = $login1.Data.accessToken
    Write-Host "[OK] User 1 dang nhap thanh cong" -ForegroundColor Green
    
    # Get user info
    $me1 = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $user1Token" }
    if ($me1.Success) {
        $user1Id = $me1.Data.data.userId
        Write-Host "     User ID: $user1Id" -ForegroundColor Gray
    }
} else {
    Write-Host "[FAIL] User 1 khong the dang nhap" -ForegroundColor Red
}


# ============================================
# TAO USER 2
# ============================================
Write-Host ""
Write-Host "--- TAO USER 2 ---" -ForegroundColor Yellow

$user2Email = "user2_$timestamp@example.com"
$user2Password = "User2Password@123"

$result = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
    email = $user2Email
    password = $user2Password
    fullName = "Tran Thi B"
    phoneNumber = "0902$($timestamp.Substring(0,6))"
}

if ($result.Success) {
    Write-Host "[OK] User 2 da duoc tao: $user2Email" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Khong the tao User 2: $($result.Error)" -ForegroundColor Red
}

# Login User 2
$login2 = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
    email = $user2Email
    password = $user2Password
}

$user2Token = ""
$user2Id = ""
if ($login2.Success) {
    $user2Token = $login2.Data.accessToken
    Write-Host "[OK] User 2 dang nhap thanh cong" -ForegroundColor Green
    
    $me2 = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $user2Token" }
    if ($me2.Success) {
        $user2Id = $me2.Data.data.userId
        Write-Host "     User ID: $user2Id" -ForegroundColor Gray
    }
} else {
    Write-Host "[FAIL] User 2 khong the dang nhap" -ForegroundColor Red
}

# ============================================
# SUBMIT KYC CHO USER 1
# ============================================
Write-Host ""
Write-Host "--- SUBMIT KYC CHO USER 1 ---" -ForegroundColor Yellow

$kyc1Result = Invoke-Api -Method "POST" -Endpoint "/kyc/submit" -Headers @{
    "Authorization" = "Bearer $user1Token"
} -Body @{
    citizenId = "012345678901"
    fullName = "Nguyen Van A"
    dateOfBirth = "1990-05-15"
    gender = "MALE"
    placeOfIssue = "Ha Noi"
    dateOfIssue = "2020-01-01"
    expiryDate = "2030-01-01"
    permanentAddress = "123 Pho Hue, Hai Ba Trung, Ha Noi"
    currentAddress = "456 Kim Ma, Ba Dinh, Ha Noi"
    phoneNumber = "0901$($timestamp.Substring(0,6))"
    email = $user1Email
    frontIdImageUrl = "https://example.com/front1.jpg"
    backIdImageUrl = "https://example.com/back1.jpg"
    selfieImageUrl = "https://example.com/selfie1.jpg"
}

$kyc1Id = ""
if ($kyc1Result.Success) {
    Write-Host "[OK] KYC User 1 da duoc submit" -ForegroundColor Green
    if ($kyc1Result.Data.data.kycId) {
        $kyc1Id = $kyc1Result.Data.data.kycId
        Write-Host "     KYC ID: $kyc1Id" -ForegroundColor Gray
    }
} else {
    Write-Host "[FAIL] Khong the submit KYC User 1: $($kyc1Result.Error)" -ForegroundColor Red
    Write-Host $kyc1Result.Body -ForegroundColor Gray
}


# ============================================
# SUBMIT KYC CHO USER 2
# ============================================
Write-Host ""
Write-Host "--- SUBMIT KYC CHO USER 2 ---" -ForegroundColor Yellow

$kyc2Result = Invoke-Api -Method "POST" -Endpoint "/kyc/submit" -Headers @{
    "Authorization" = "Bearer $user2Token"
} -Body @{
    citizenId = "098765432109"
    fullName = "Tran Thi B"
    dateOfBirth = "1995-08-20"
    gender = "FEMALE"
    placeOfIssue = "Ho Chi Minh"
    dateOfIssue = "2021-06-15"
    expiryDate = "2031-06-15"
    permanentAddress = "789 Nguyen Hue, Quan 1, TP HCM"
    currentAddress = "321 Le Loi, Quan 3, TP HCM"
    phoneNumber = "0902$($timestamp.Substring(0,6))"
    email = $user2Email
    frontIdImageUrl = "https://example.com/front2.jpg"
    backIdImageUrl = "https://example.com/back2.jpg"
    selfieImageUrl = "https://example.com/selfie2.jpg"
}

$kyc2Id = ""
if ($kyc2Result.Success) {
    Write-Host "[OK] KYC User 2 da duoc submit" -ForegroundColor Green
    if ($kyc2Result.Data.data.kycId) {
        $kyc2Id = $kyc2Result.Data.data.kycId
        Write-Host "     KYC ID: $kyc2Id" -ForegroundColor Gray
    }
} else {
    Write-Host "[FAIL] Khong the submit KYC User 2: $($kyc2Result.Error)" -ForegroundColor Red
    Write-Host $kyc2Result.Body -ForegroundColor Gray
}

# ============================================
# ADMIN DUYET KYC
# ============================================
Write-Host ""
Write-Host "--- ADMIN DANG NHAP ---" -ForegroundColor Yellow

$adminLogin = Invoke-Api -Method "POST" -Endpoint "/users/admin/login" -Body @{
    email = "admin@minibank.com"
    password = "Admin@123"
}

$adminToken = ""
if ($adminLogin.Success) {
    $adminToken = $adminLogin.Data.accessToken
    Write-Host "[OK] Admin dang nhap thanh cong" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Admin khong the dang nhap" -ForegroundColor Red
}

# Lay danh sach KYC pending
Write-Host ""
Write-Host "--- LAY DANH SACH KYC PENDING ---" -ForegroundColor Yellow

$pendingKyc = Invoke-Api -Method "GET" -Endpoint "/kyc/admin/pending?page=0&size=20" -Headers @{
    "Authorization" = "Bearer $adminToken"
    "X-User-Role" = "ADMIN"
}

if ($pendingKyc.Success) {
    $kycList = $pendingKyc.Data.data.content
    Write-Host "[OK] Tim thay $($kycList.Count) KYC pending" -ForegroundColor Green
    
    foreach ($kyc in $kycList) {
        Write-Host "     - KYC ID: $($kyc.kycId) | User: $($kyc.fullName)" -ForegroundColor Gray
    }
} else {
    Write-Host "[FAIL] Khong the lay danh sach KYC: $($pendingKyc.Error)" -ForegroundColor Red
}


# ============================================
# DUYET KYC USER 1
# ============================================
Write-Host ""
Write-Host "--- DUYET KYC USER 1 ---" -ForegroundColor Yellow

if ($kyc1Id) {
    $approve1 = Invoke-Api -Method "POST" -Endpoint "/kyc/admin/$kyc1Id/review" -Headers @{
        "Authorization" = "Bearer $adminToken"
        "X-User-Role" = "ADMIN"
    } -Body @{
        status = "APPROVED"
        notes = "Thong tin hop le, da xac minh"
    }
    
    if ($approve1.Success) {
        Write-Host "[OK] KYC User 1 da duoc APPROVED" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Khong the duyet KYC User 1: $($approve1.Error)" -ForegroundColor Red
        Write-Host $approve1.Body -ForegroundColor Gray
    }
} else {
    Write-Host "[SKIP] Khong co KYC ID cho User 1" -ForegroundColor Yellow
}

# ============================================
# DUYET KYC USER 2
# ============================================
Write-Host ""
Write-Host "--- DUYET KYC USER 2 ---" -ForegroundColor Yellow

if ($kyc2Id) {
    $approve2 = Invoke-Api -Method "POST" -Endpoint "/kyc/admin/$kyc2Id/review" -Headers @{
        "Authorization" = "Bearer $adminToken"
        "X-User-Role" = "ADMIN"
    } -Body @{
        status = "APPROVED"
        notes = "Thong tin hop le, da xac minh"
    }
    
    if ($approve2.Success) {
        Write-Host "[OK] KYC User 2 da duoc APPROVED" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Khong the duyet KYC User 2: $($approve2.Error)" -ForegroundColor Red
        Write-Host $approve2.Body -ForegroundColor Gray
    }
} else {
    Write-Host "[SKIP] Khong co KYC ID cho User 2" -ForegroundColor Yellow
}

# ============================================
# KIEM TRA TRANG THAI SAU KYC
# ============================================
Write-Host ""
Write-Host "--- KIEM TRA TRANG THAI SAU KYC ---" -ForegroundColor Yellow

# Check User 1 KYC status
$status1 = Invoke-Api -Method "GET" -Endpoint "/kyc/my-status" -Headers @{
    "Authorization" = "Bearer $user1Token"
}
if ($status1.Success) {
    Write-Host "[OK] User 1 KYC Status: $($status1.Data.data.status)" -ForegroundColor Green
}

# Check User 2 KYC status
$status2 = Invoke-Api -Method "GET" -Endpoint "/kyc/my-status" -Headers @{
    "Authorization" = "Bearer $user2Token"
}
if ($status2.Success) {
    Write-Host "[OK] User 2 KYC Status: $($status2.Data.data.status)" -ForegroundColor Green
}

# Check Account status
Write-Host ""
Write-Host "--- KIEM TRA TAI KHOAN ---" -ForegroundColor Yellow

$acc1 = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{
    "Authorization" = "Bearer $user1Token"
    "X-User-Id" = $user1Id
}
if ($acc1.Success) {
    Write-Host "[OK] User 1 Account: $($acc1.Data.data.accountNumber) | Status: $($acc1.Data.data.status) | Balance: $($acc1.Data.data.balance)" -ForegroundColor Green
}

$acc2 = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{
    "Authorization" = "Bearer $user2Token"
    "X-User-Id" = $user2Id
}
if ($acc2.Success) {
    Write-Host "[OK] User 2 Account: $($acc2.Data.data.accountNumber) | Status: $($acc2.Data.data.status) | Balance: $($acc2.Data.data.balance)" -ForegroundColor Green
}

# ============================================
# TOM TAT
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  TOM TAT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "User 1:" -ForegroundColor White
Write-Host "  Email: $user1Email" -ForegroundColor Gray
Write-Host "  Password: $user1Password" -ForegroundColor Gray
Write-Host "  User ID: $user1Id" -ForegroundColor Gray
Write-Host ""
Write-Host "User 2:" -ForegroundColor White
Write-Host "  Email: $user2Email" -ForegroundColor Gray
Write-Host "  Password: $user2Password" -ForegroundColor Gray
Write-Host "  User ID: $user2Id" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
