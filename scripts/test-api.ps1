# Mini Banking System - API Test Script
# Chạy: .\scripts\test-api.ps1

$BaseUrl = "http://localhost:8080/api/v1"
$Global:AccessToken = ""
$Global:RefreshToken = ""
$Global:UserId = ""
$Global:AdminToken = ""
$Global:AdminUserId = ""

# ============================================
# HELPER FUNCTIONS
# ============================================

function Write-TestHeader($title) {
    Write-Host "`n========================================" -ForegroundColor Cyan
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
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errorMessage = $reader.ReadToEnd()
            } catch {}
        }
        return @{ Success = $false; Error = $errorMessage; StatusCode = $_.Exception.Response.StatusCode }
    }
}


# ============================================
# 1. AUTHENTICATION TESTS
# ============================================

function Test-Authentication {
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
    
    # Test 1.2: Register duplicate email (should fail)
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/register" -Body @{
        email = $testEmail
        password = "TestPassword@123"
        fullName = "Duplicate User"
        phoneNumber = "0901234567"
    }
    Write-TestResult "1.2 Register duplicate email (expect fail)" (-not $result.Success)
    
    # Test 1.3: Login with test account
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/login" -Body @{
        email = "test.user@example.com"
        password = "TestPassword#123"
    }
    if ($result.Success) {
        $Global:AccessToken = $result.Data.accessToken
        $Global:RefreshToken = $result.Data.refreshToken
        # Extract userId from token or response
        if ($result.Data.userId) {
            $Global:UserId = $result.Data.userId
        }
    }
    Write-TestResult "1.3 Customer login" $result.Success $result.Error
    
    # Test 1.4: Login with wrong password (should fail)
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
        if ($result.Data.userId) {
            $Global:AdminUserId = $result.Data.userId
        }
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
    
    # Test 1.7: Get current user info
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/users/me" -UseAuth
    if ($result.Success -and $result.Data.data.userId) {
        $Global:UserId = $result.Data.data.userId
    }
    Write-TestResult "1.7 Get user info (/me)" $result.Success $result.Error
}


# ============================================
# 2. ACCOUNT TESTS
# ============================================

function Test-Account {
    Write-TestHeader "2. ACCOUNT TESTS"
    
    # Test 2.1: Get account info
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $Global:UserId }
    $accountData = $null
    if ($result.Success) {
        $accountData = $result.Data.data
    }
    Write-TestResult "2.1 Get account info" $result.Success $result.Error
    
    # Test 2.2: Get account status
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/account/status" -Headers @{ "X-User-Id" = $Global:UserId }
    Write-TestResult "2.2 Get account status" $result.Success $result.Error
    
    return $accountData
}

# ============================================
# 3. TRANSACTION TESTS
# ============================================

function Test-Transactions {
    Write-TestHeader "3. TRANSACTION TESTS"
    
    # Test 3.1: Deposit
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/deposit" -Headers @{ "X-User-Id" = $Global:UserId } -Body @{
        amount = 1000000
    }
    Write-TestResult "3.1 Deposit 1,000,000" $result.Success $result.Error
    
    # Test 3.2: Deposit invalid amount (should fail)
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/deposit" -Headers @{ "X-User-Id" = $Global:UserId } -Body @{
        amount = -100
    }
    Write-TestResult "3.2 Deposit negative amount (expect fail)" (-not $result.Success)
    
    # Test 3.3: Withdraw
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/withdraw" -Headers @{ "X-User-Id" = $Global:UserId } -Body @{
        amount = 100000
    }
    Write-TestResult "3.3 Withdraw 100,000" $result.Success $result.Error
    
    # Test 3.4: Withdraw more than balance (should fail)
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/withdraw" -Headers @{ "X-User-Id" = $Global:UserId } -Body @{
        amount = 999999999999
    }
    Write-TestResult "3.4 Withdraw exceeds balance (expect fail)" (-not $result.Success)
    
    # Test 3.5: Get transaction history
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/history?page=0&size=10" -Headers @{ "X-User-Id" = $Global:UserId }
    Write-TestResult "3.5 Get transaction history" $result.Success $result.Error
    
    # Test 3.6: Get transaction history with filter
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/history?type=DEPOSIT&page=0&size=10" -Headers @{ "X-User-Id" = $Global:UserId }
    Write-TestResult "3.6 Get history filtered by DEPOSIT" $result.Success $result.Error
}


# ============================================
# 4. KYC TESTS
# ============================================

function Test-KYC {
    Write-TestHeader "4. KYC TESTS"
    
    # Test 4.1: Get KYC status
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/kyc/my-status" -UseAuth
    Write-TestResult "4.1 Get KYC status" $result.Success $result.Error
    
    # Test 4.2: Get KYC history
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/kyc/my-history" -UseAuth
    Write-TestResult "4.2 Get KYC history" $result.Success $result.Error
    
    # Test 4.3: Admin - Get pending KYC list
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/kyc/admin/pending?page=0&size=20" -UseAdminAuth
    Write-TestResult "4.3 Admin: Get pending KYC" $result.Success $result.Error
    
    # Test 4.4: Admin - Count pending KYC
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/kyc/admin/pending-count" -UseAdminAuth
    Write-TestResult "4.4 Admin: Count pending KYC" $result.Success $result.Error
}

# ============================================
# 5. COUNTER (QUẦY GIAO DỊCH) TESTS
# ============================================

function Test-Counter {
    Write-TestHeader "5. COUNTER TESTS"
    
    # Test 5.1: Get all counters
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/counters"
    $counters = @()
    if ($result.Success -and $result.Data.data) {
        $counters = $result.Data.data
    }
    Write-TestResult "5.1 Get all counters" $result.Success $result.Error
    
    # Test 5.2: Get counter detail (if exists)
    if ($counters.Count -gt 0) {
        $counterId = $counters[0].counterId
        $result = Invoke-ApiRequest -Method "GET" -Endpoint "/counters/$counterId"
        Write-TestResult "5.2 Get counter detail" $result.Success $result.Error
        
        # Test 5.3: Get counter staff
        $result = Invoke-ApiRequest -Method "GET" -Endpoint "/counters/$counterId/staff"
        Write-TestResult "5.3 Get counter staff" $result.Success $result.Error
    } else {
        Write-TestResult "5.2 Get counter detail" $false "No counters available"
        Write-TestResult "5.3 Get counter staff" $false "No counters available"
    }
    
    return $counters
}


# ============================================
# 6. ADMIN TESTS
# ============================================

function Test-Admin {
    Write-TestHeader "6. ADMIN TESTS"
    
    # Test 6.1: Get all users
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/users" -UseAdminAuth
    Write-TestResult "6.1 Admin: Get all users" $result.Success $result.Error
    
    # Test 6.2: Get system report
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/report" -UseAdminAuth
    Write-TestResult "6.2 Admin: Get system report" $result.Success $result.Error
    
    # Test 6.3: Get admin dashboard
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/admin/dashboard?days=7" -UseAdminAuth
    Write-TestResult "6.3 Admin: Get dashboard" $result.Success $result.Error
    
    # Test 6.4: Get all transactions (admin)
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/admin/all?page=0&size=10" -UseAdminAuth
    Write-TestResult "6.4 Admin: Get all transactions" $result.Success $result.Error
}

# ============================================
# 7. NOTIFICATION TESTS
# ============================================

function Test-Notifications {
    Write-TestHeader "7. NOTIFICATION TESTS"
    
    # Test 7.1: Get my notifications
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/notifications/me?page=0&size=50" -Headers @{ "X-User-Id" = $Global:UserId }
    Write-TestResult "7.1 Get my notifications" $result.Success $result.Error
    
    # Test 7.2: Mark all as read
    $result = Invoke-ApiRequest -Method "PATCH" -Endpoint "/notifications/me/read-all" -Headers @{ "X-User-Id" = $Global:UserId }
    Write-TestResult "7.2 Mark all notifications read" $result.Success $result.Error
}

# ============================================
# 8. LOG TESTS
# ============================================

function Test-Logs {
    Write-TestHeader "8. LOG TESTS"
    
    # Test 8.1: Get my logs
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/logs/me?page=0&size=20" -Headers @{ "X-User-Id" = $Global:UserId }
    Write-TestResult "8.1 Get my logs" $result.Success $result.Error
    
    # Test 8.2: Admin - Get all logs
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/logs?page=0&size=20" -UseAdminAuth
    Write-TestResult "8.2 Admin: Get all logs" $result.Success $result.Error
    
    # Test 8.3: Admin - Get log statistics
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/logs/statistics" -UseAdminAuth
    Write-TestResult "8.3 Admin: Get log statistics" $result.Success $result.Error
}


# ============================================
# 9. PASSWORD MANAGEMENT TESTS
# ============================================

function Test-PasswordManagement {
    Write-TestHeader "9. PASSWORD MANAGEMENT TESTS"
    
    # Test 9.1: Change password (will skip actual change to not break test account)
    # This test just validates the endpoint exists
    $result = Invoke-ApiRequest -Method "PUT" -Endpoint "/users/change-password" -UseAuth -Body @{
        currentPassword = "TestPassword#123"
        newPassword = "TestPassword#123"  # Same password to avoid breaking account
    }
    # This might fail due to same password validation, which is expected
    Write-TestResult "9.1 Change password endpoint" ($result.Success -or $result.Error -match "same|identical") $result.Error
    
    # Test 9.2: Forgot password request
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/forgot-password" -Body @{
        email = "test.user@example.com"
    }
    Write-TestResult "9.2 Forgot password request" $result.Success $result.Error
}

# ============================================
# 10. USER MANAGEMENT (ADMIN) TESTS
# ============================================

function Test-UserManagement {
    Write-TestHeader "10. USER MANAGEMENT (ADMIN) TESTS"
    
    # Get a test user first
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/users/admin/users" -UseAdminAuth
    $testUserId = $null
    if ($result.Success -and $result.Data.data) {
        # Find a non-admin user to test with
        foreach ($user in $result.Data.data) {
            if ($user.role -eq "CUSTOMER" -and $user.userId -ne $Global:UserId) {
                $testUserId = $user.userId
                break
            }
        }
    }
    Write-TestResult "10.1 Get users list" $result.Success $result.Error
    
    if ($testUserId) {
        # Test freeze/unfreeze (be careful not to lock the test account)
        Write-Host "       Using test user: $testUserId" -ForegroundColor Gray
        
        # Test 10.2: Freeze user
        $result = Invoke-ApiRequest -Method "PUT" -Endpoint "/users/admin/users/$testUserId/freeze" -UseAdminAuth
        Write-TestResult "10.2 Freeze user" $result.Success $result.Error
        
        # Test 10.3: Unfreeze user
        $result = Invoke-ApiRequest -Method "PUT" -Endpoint "/users/admin/users/$testUserId/unfreeze" -UseAdminAuth
        Write-TestResult "10.3 Unfreeze user" $result.Success $result.Error
    } else {
        Write-TestResult "10.2 Freeze user" $false "No test user available"
        Write-TestResult "10.3 Unfreeze user" $false "No test user available"
    }
}


# ============================================
# 11. COUNTER TRANSACTION TESTS
# ============================================

function Test-CounterTransactions {
    param($counters)
    
    Write-TestHeader "11. COUNTER TRANSACTION TESTS"
    
    if ($counters.Count -eq 0) {
        Write-Host "       Skipping - No counters available" -ForegroundColor Yellow
        return
    }
    
    $counterId = $counters[0].counterId
    
    # Test 11.1: Create counter deposit request
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/deposit-counter" -Headers @{ "X-User-Id" = $Global:UserId } -Body @{
        amount = 500000
        counterId = $counterId
    }
    $depositTxId = $null
    if ($result.Success -and $result.Data.data) {
        $depositTxId = $result.Data.data.transactionId
    }
    Write-TestResult "11.1 Create counter deposit request" $result.Success $result.Error
    
    # Test 11.2: Get pending counter transactions
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/pending-counter" -Headers @{ "X-User-Id" = $Global:UserId }
    Write-TestResult "11.2 Get pending counter transactions" $result.Success $result.Error
    
    # Test 11.3: Cancel counter deposit (if created)
    if ($depositTxId) {
        $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/deposit-counter/$depositTxId/cancel" -Headers @{ "X-User-Id" = $Global:UserId }
        Write-TestResult "11.3 Cancel counter deposit" $result.Success $result.Error
    } else {
        Write-TestResult "11.3 Cancel counter deposit" $false "No transaction to cancel"
    }
}

# ============================================
# 12. TRANSFER TESTS
# ============================================

function Test-Transfer {
    Write-TestHeader "12. TRANSFER TESTS"
    
    # Get another account to transfer to
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/users/admin/users" -UseAdminAuth
    $targetAccountId = $null
    
    if ($result.Success -and $result.Data.data) {
        foreach ($user in $result.Data.data) {
            if ($user.userId -ne $Global:UserId -and $user.role -eq "CUSTOMER") {
                # Try to get their account
                $accResult = Invoke-ApiRequest -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $user.userId }
                if ($accResult.Success -and $accResult.Data.data.accountId) {
                    $targetAccountId = $accResult.Data.data.accountId
                    break
                }
            }
        }
    }
    
    if ($targetAccountId) {
        # Test 12.1: Transfer money
        $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/transfer" -Headers @{ "X-User-Id" = $Global:UserId } -Body @{
            amount = 10000
            toAccountId = $targetAccountId
        }
        Write-TestResult "12.1 Transfer to another account" $result.Success $result.Error
        
        # Test 12.2: Transfer to self (should fail)
        $myAccount = Invoke-ApiRequest -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $Global:UserId }
        if ($myAccount.Success -and $myAccount.Data.data.accountId) {
            $result = Invoke-ApiRequest -Method "POST" -Endpoint "/transactions/transfer" -Headers @{ "X-User-Id" = $Global:UserId } -Body @{
                amount = 10000
                toAccountId = $myAccount.Data.data.accountId
            }
            Write-TestResult "12.2 Transfer to self (expect fail)" (-not $result.Success)
        }
    } else {
        Write-TestResult "12.1 Transfer to another account" $false "No target account available"
        Write-TestResult "12.2 Transfer to self (expect fail)" $false "Skipped"
    }
}


# ============================================
# 13. SECURITY TESTS
# ============================================

function Test-Security {
    Write-TestHeader "13. SECURITY TESTS"
    
    # Test 13.1: Access protected endpoint without token
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/users/me"
    Write-TestResult "13.1 Access /me without token (expect fail)" (-not $result.Success)
    
    # Test 13.2: Access admin endpoint with customer token
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/admin/users" -UseAuth
    Write-TestResult "13.2 Customer access admin endpoint (expect fail)" (-not $result.Success)
    
    # Test 13.3: Invalid token
    $originalToken = $Global:AccessToken
    $Global:AccessToken = "invalid.token.here"
    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/users/me" -UseAuth
    $Global:AccessToken = $originalToken
    Write-TestResult "13.3 Access with invalid token (expect fail)" (-not $result.Success)
}

# ============================================
# 14. STAFF DASHBOARD TESTS
# ============================================

function Test-StaffDashboard {
    Write-TestHeader "14. STAFF DASHBOARD TESTS"
    
    # Login as staff first
    $result = Invoke-ApiRequest -Method "POST" -Endpoint "/users/staff/login" -Body @{
        email = "staff@minibank.com"
        password = "Staff@123"
    }
    
    if ($result.Success) {
        $staffToken = $result.Data.accessToken
        $staffId = $result.Data.userId
        
        # Test 14.1: Get staff dashboard
        $result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/staff/dashboard?pendingLimit=10&recentCustomersLimit=5" -Headers @{
            "Authorization" = "Bearer $staffToken"
            "X-User-Id" = $staffId
        }
        Write-TestResult "14.1 Staff dashboard" $result.Success $result.Error
        
        # Test 14.2: Get recent customers
        $result = Invoke-ApiRequest -Method "GET" -Endpoint "/transactions/staff/recent-customers?limit=5" -Headers @{
            "Authorization" = "Bearer $staffToken"
            "X-User-Id" = $staffId
        }
        Write-TestResult "14.2 Staff recent customers" $result.Success $result.Error
    } else {
        Write-TestResult "14.1 Staff dashboard" $false "Staff login failed"
        Write-TestResult "14.2 Staff recent customers" $false "Staff login failed"
    }
}


# ============================================
# MAIN EXECUTION
# ============================================

function Run-AllTests {
    Write-Host "`n" -NoNewline
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║     MINI BANKING SYSTEM - API TEST SUITE                   ║" -ForegroundColor Magenta
    Write-Host "║     Base URL: $BaseUrl                        ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    
    $startTime = Get-Date
    
    # Check if services are running
    Write-Host "`nChecking API Gateway connectivity..." -ForegroundColor Yellow
    try {
        $healthCheck = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "API Gateway is running!" -ForegroundColor Green
    } catch {
        Write-Host "WARNING: API Gateway may not be running. Tests may fail." -ForegroundColor Red
        Write-Host "Run 'docker compose up -d' to start services." -ForegroundColor Yellow
    }
    
    # Run all test suites
    Test-Authentication
    Test-Account
    Test-Transactions
    Test-KYC
    $counters = Test-Counter
    Test-Admin
    Test-Notifications
    Test-Logs
    Test-PasswordManagement
    Test-UserManagement
    Test-CounterTransactions -counters $counters
    Test-Transfer
    Test-Security
    Test-StaffDashboard
    
    # Summary
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "`n" -NoNewline
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                    TEST COMPLETED                          ║" -ForegroundColor Magenta
    Write-Host "║     Duration: $([math]::Round($duration, 2)) seconds                               ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
}

# Run specific test suite
function Run-Test {
    param([string]$TestName)
    
    switch ($TestName.ToLower()) {
        "auth" { Test-Authentication }
        "account" { Test-Account }
        "transaction" { Test-Transactions }
        "kyc" { Test-KYC }
        "counter" { Test-Counter }
        "admin" { Test-Admin }
        "notification" { Test-Notifications }
        "log" { Test-Logs }
        "password" { Test-PasswordManagement }
        "user" { Test-UserManagement }
        "transfer" { Test-Transfer }
        "security" { Test-Security }
        "staff" { Test-StaffDashboard }
        default { 
            Write-Host "Unknown test: $TestName" -ForegroundColor Red
            Write-Host "Available: auth, account, transaction, kyc, counter, admin, notification, log, password, user, transfer, security, staff" -ForegroundColor Yellow
        }
    }
}

# Execute
if ($args.Count -gt 0) {
    # Login first for any test
    $loginResult = Invoke-ApiRequest -Method "POST" -Endpoint "/users/login" -Body @{
        email = "test.user@example.com"
        password = "TestPassword#123"
    }
    if ($loginResult.Success) {
        $Global:AccessToken = $loginResult.Data.accessToken
        $Global:RefreshToken = $loginResult.Data.refreshToken
    }
    
    $adminResult = Invoke-ApiRequest -Method "POST" -Endpoint "/users/admin/login" -Body @{
        email = "admin@minibank.com"
        password = "Admin@123"
    }
    if ($adminResult.Success) {
        $Global:AdminToken = $adminResult.Data.accessToken
    }
    
    # Get user ID
    $meResult = Invoke-ApiRequest -Method "GET" -Endpoint "/users/me" -UseAuth
    if ($meResult.Success) {
        $Global:UserId = $meResult.Data.data.userId
    }
    
    Run-Test -TestName $args[0]
} else {
    Run-AllTests
}
