# Mini Banking System - API Test Script
# Run: powershell -ExecutionPolicy Bypass -File scripts\test-api-simple.ps1

$BaseUrl = "http://localhost:8080/api/v1"
$Global:AccessToken = ""
$Global:RefreshToken = ""
$Global:UserId = ""
$Global:AdminToken = ""
$Global:AdminUserId = ""

function Write-TestHeader($title) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-TestResult($testName, $success, $message = "") {
    if ($success) {
        Write-Host "[PASS] $testName" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $testName" -ForegroundColor Red
        if ($message) { Write-Host "       $message" -ForegroundColor Yellow }
    }
}

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{},
        [switch]$UseAuth,
        [switch]$UseAdminAuth
    )
    
    $url = "$BaseUrl$Endpoint"
    $requestHeaders = @{ "Content-Type" = "application/json" }
    
    if ($UseAuth -and $Global:AccessToken) {
        $requestHeaders["Authorization"] = "Bearer $Global:AccessToken"
        $requestHeaders["X-User-Id"] = $Global:UserId
    }
    if ($UseAdminAuth -and $Global:AdminToken) {
        $requestHeaders["Authorization"] = "Bearer $Global:AdminToken"
        $requestHeaders["X-User-Id"] = $Global:AdminUserId
        $requestHeaders["X-User-Role"] = "ADMIN"
    }
    
    foreach ($key in $Headers.Keys) {
        $requestHeaders[$key] = $Headers[$key]
    }
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $requestHeaders
            ContentType = "application/json"
        }
        
        if ($Body.Count -gt 0 -and $Method -ne "GET") {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    }
    catch {
        $errorMessage = $_.Exception.Message
        return @{ Success = $false; Error = $errorMessage }
    }
}

# ============================================
# MAIN TEST EXECUTION
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  MINI BANKING SYSTEM - API TEST SUITE" -ForegroundColor Magenta
Write-Host "  Base URL: $BaseUrl" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

$startTime = Get-Date

# Check API Gateway
Write-Host ""
Write-Host "Checking API Gateway connectivity..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "API Gateway is running!" -ForegroundColor Green
} catch {
    Write-Host "WARNING: API Gateway may not be running. Tests may fail." -ForegroundColor Red
    Write-Host "Run 'docker compose up -d' to start services." -ForegroundColor Yellow
}


# ============================================
# 1. AUTHENTICATION TESTS
# ============================================
Write-TestHeader "1. AUTHENTICATION TESTS"

# Test 1.1: Register new user
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "testuser_$timestamp@example.com"

$result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/register" -Body @{
    email = $testEmail
    password = "TestPassword@123"
    fullName = "Test User $timestamp"
    phoneNumber = "090$($timestamp.Substring(0,7))"
}
Write-TestResult "1.1 Register new user" $result.Success $result.Error

# Test 1.2: Register duplicate email
$result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/register" -Body @{
    email = $testEmail
    password = "TestPassword@123"
    fullName = "Duplicate User"
    phoneNumber = "0901234567"
}
Write-TestResult "1.2 Register duplicate email (expect fail)" (-not $result.Success)

# Test 1.3: Customer login
$result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/login" -Body @{
    email = "test.user@example.com"
    password = "TestPassword#123"
}
if ($result.Success) {
    $Global:AccessToken = $result.Data.accessToken
    $Global:RefreshToken = $result.Data.refreshToken
    if ($result.Data.userId) { $Global:UserId = $result.Data.userId }
}
Write-TestResult "1.3 Customer login" $result.Success $result.Error

# Test 1.4: Wrong password
$result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/login" -Body @{
    email = "test.user@example.com"
    password = "WrongPassword123"
}
Write-TestResult "1.4 Login wrong password (expect fail)" (-not $result.Success)

# Test 1.5: Admin login
$result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/admin/login" -Body @{
    email = "admin@minibank.com"
    password = "Admin@123"
}
if ($result.Success) {
    $Global:AdminToken = $result.Data.accessToken
    if ($result.Data.userId) { $Global:AdminUserId = $result.Data.userId }
}
Write-TestResult "1.5 Admin login" $result.Success $result.Error

# Test 1.6: Refresh token
if ($Global:RefreshToken) {
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/refresh-token" -Body @{
        refreshToken = $Global:RefreshToken
    }
    if ($result.Success -and $result.Data.accessToken) {
        $Global:AccessToken = $result.Data.accessToken
    }
    Write-TestResult "1.6 Refresh token" $result.Success $result.Error
}

# Test 1.7: Get user info
$result = Invoke-ApiRequest -Method "GET" -Endpoint "/users/me" -UseAuth
if ($result.Success -and $result.Data.data.userId) {
    $Global:UserId = $result.Data.data.userId
}
Write-TestResult "1.7 Get user info (/me)" $result.Success $result.Error


# ============================================
# 2. ACCOUNT TESTS
# ============================================
Write-TestHeader "2. ACCOUNT TESTS"

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/account/me" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
}
$accountData = $null
if ($result.Success) { $accountData = $result.Data.data }
Write-TestResult "2.1 Get account info" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/account/status" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
}
Write-TestResult "2.2 Get account status" $result.Success $result.Error

# ============================================
# 3. TRANSACTION TESTS
# ============================================
Write-TestHeader "3. TRANSACTION TESTS"

$result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/deposit" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
} -Body @{ amount = 1000000 }
Write-TestResult "3.1 Deposit 1,000,000" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/deposit" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
} -Body @{ amount = -100 }
Write-TestResult "3.2 Deposit negative (expect fail)" (-not $result.Success)

$result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/withdraw" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
} -Body @{ amount = 100000 }
Write-TestResult "3.3 Withdraw 100,000" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/withdraw" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
} -Body @{ amount = 999999999999 }
Write-TestResult "3.4 Withdraw exceeds balance (expect fail)" (-not $result.Success)

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/history?page=0&size=10" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
}
Write-TestResult "3.5 Get transaction history" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/history?type=DEPOSIT&page=0&size=10" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
}
Write-TestResult "3.6 Get history filtered by DEPOSIT" $result.Success $result.Error

# ============================================
# 4. KYC TESTS
# ============================================
Write-TestHeader "4. KYC TESTS"

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/kyc/my-status" -UseAuth
Write-TestResult "4.1 Get KYC status" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/kyc/my-history" -UseAuth
Write-TestResult "4.2 Get KYC history" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/kyc/admin/pending?page=0&size=20" -UseAdminAuth
Write-TestResult "4.3 Admin: Get pending KYC" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/kyc/admin/pending-count" -UseAdminAuth
Write-TestResult "4.4 Admin: Count pending KYC" $result.Success $result.Error


# ============================================
# 5. COUNTER TESTS
# ============================================
Write-TestHeader "5. COUNTER TESTS"

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/counters" -Headers @{
    "Authorization" = "Bearer $Global:AccessToken"
}
$counters = @()
if ($result.Success -and $result.Data.data) { $counters = $result.Data.data }
Write-TestResult "5.1 Get all counters" $result.Success $result.Error

if ($counters.Count -gt 0) {
    $counterId = $counters[0].counterId
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/counters/$counterId" -Headers @{
        "Authorization" = "Bearer $Global:AccessToken"
    }
    Write-TestResult "5.2 Get counter detail" $result.Success $result.Error
    
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/counters/$counterId/staff" -Headers @{
        "Authorization" = "Bearer $Global:AccessToken"
    }
    Write-TestResult "5.3 Get counter staff" $result.Success $result.Error
} else {
    Write-TestResult "5.2 Get counter detail" $false "No counters available"
    Write-TestResult "5.3 Get counter staff" $false "No counters available"
}

# ============================================
# 6. ADMIN TESTS
# ============================================
Write-TestHeader "6. ADMIN TESTS"

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/users" -UseAdminAuth
Write-TestResult "6.1 Admin: Get all users" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/report" -UseAdminAuth
Write-TestResult "6.2 Admin: Get system report" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/admin/dashboard?days=7" -UseAdminAuth
Write-TestResult "6.3 Admin: Get dashboard" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/admin/all?page=0&size=10" -UseAdminAuth
Write-TestResult "6.4 Admin: Get all transactions" $result.Success $result.Error

# ============================================
# 7. NOTIFICATION TESTS
# ============================================
Write-TestHeader "7. NOTIFICATION TESTS"

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/notifications/me?page=0&size=50" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
}
Write-TestResult "7.1 Get my notifications" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "PATCH" -Endpoint "/notifications/me/read-all" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
}
Write-TestResult "7.2 Mark all notifications read" $result.Success $result.Error

# ============================================
# 8. LOG TESTS
# ============================================
Write-TestHeader "8. LOG TESTS"

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/logs/me?page=0&size=20" -Headers @{ 
    "X-User-Id" = $Global:UserId
    "Authorization" = "Bearer $Global:AccessToken"
}
Write-TestResult "8.1 Get my logs" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/logs?page=0&size=20" -UseAdminAuth
Write-TestResult "8.2 Admin: Get all logs" $result.Success $result.Error

$result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/logs/statistics" -UseAdminAuth
Write-TestResult "8.3 Admin: Get log statistics" $result.Success $result.Error


# ============================================
# 9. SECURITY TESTS
# ============================================
Write-TestHeader "9. SECURITY TESTS"

# Access without token
$result = Invoke-ApiRequest -Method "GET" -Endpoint "/users/me"
Write-TestResult "9.1 Access /me without token (expect fail)" (-not $result.Success)

# Customer access admin endpoint
$result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/users" -UseAuth
Write-TestResult "9.2 Customer access admin (expect fail)" (-not $result.Success)

# Invalid token
$originalToken = $Global:AccessToken
$Global:AccessToken = "invalid.token.here"
$result = Invoke-ApiRequest -Method "GET" -Endpoint "/users/me" -UseAuth
$Global:AccessToken = $originalToken
Write-TestResult "9.3 Invalid token (expect fail)" (-not $result.Success)

# ============================================
# 10. TRANSFER TESTS
# ============================================
Write-TestHeader "10. TRANSFER TESTS"

# Get account data first if not available
if (-not $accountData) {
    $accResult = Invoke-ApiRequest -Method "GET" -Endpoint "/account/me" -Headers @{ 
        "X-User-Id" = $Global:UserId
        "Authorization" = "Bearer $Global:AccessToken"
    }
    if ($accResult.Success) { $accountData = $accResult.Data.data }
}

# Self transfer should fail
if ($accountData -and $accountData.accountId) {
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/transfer" -Headers @{ 
        "X-User-Id" = $Global:UserId
        "Authorization" = "Bearer $Global:AccessToken"
    } -Body @{
        amount = 1000
        toAccountId = $accountData.accountId
    }
    Write-TestResult "10.1 Transfer to self (expect fail)" (-not $result.Success)
} else {
    Write-TestResult "10.1 Transfer to self (expect fail)" $false "No account data"
}

# ============================================
# SUMMARY
# ============================================
$endTime = Get-Date
$duration = [math]::Round(($endTime - $startTime).TotalSeconds, 2)

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  TEST COMPLETED" -ForegroundColor Magenta
Write-Host "  Duration: $duration seconds" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
