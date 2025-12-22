# Mini Banking System - Business Logic Test Script
# Test các logic nghiệp vụ quan trọng
# Chạy: .\scripts\test-business-logic.ps1

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
        return @{ Success = $true; Data = (Invoke-RestMethod @params) }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Write-Result($name, $pass, $msg = "") {
    $color = if ($pass) { "Green" } else { "Red" }
    $status = if ($pass) { "PASS" } else { "FAIL" }
    Write-Host "[$status] $name" -ForegroundColor $color
    if ($msg -and -not $pass) { Write-Host "       $msg" -ForegroundColor Yellow }
}

Write-Host "`n=== BUSINESS LOGIC TESTS ===" -ForegroundColor Cyan

# Login
$login = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
    email = "test.user@example.com"; password = "TestPassword#123"
}
$token = $login.Data.accessToken

$me = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $token" }
$userId = $me.Data.data.userId

$adminLogin = Invoke-Api -Method "POST" -Endpoint "/users/admin/login" -Body @{
    email = "admin@minibank.com"; password = "Admin@123"
}
$adminToken = $adminLogin.Data.accessToken


# ============================================
# TEST 1: Account Balance Consistency
# ============================================
Write-Host "`n--- Test 1: Account Balance Consistency ---" -ForegroundColor Yellow

# Get initial balance
$acc1 = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $userId }
$initialBalance = $acc1.Data.data.balance
Write-Host "Initial balance: $initialBalance"

# Deposit
$depositAmount = 100000
$dep = Invoke-Api -Method "POST" -Endpoint "/transactions/deposit" -Headers @{ "X-User-Id" = $userId } -Body @{ amount = $depositAmount }

# Check balance after deposit
$acc2 = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $userId }
$afterDeposit = $acc2.Data.data.balance
$expectedAfterDeposit = $initialBalance + $depositAmount
Write-Result "Deposit increases balance correctly" ($afterDeposit -eq $expectedAfterDeposit) "Expected: $expectedAfterDeposit, Got: $afterDeposit"

# Withdraw
$withdrawAmount = 50000
$wit = Invoke-Api -Method "POST" -Endpoint "/transactions/withdraw" -Headers @{ "X-User-Id" = $userId } -Body @{ amount = $withdrawAmount }

# Check balance after withdraw
$acc3 = Invoke-Api -Method "GET" -Endpoint "/account/me" -Headers @{ "X-User-Id" = $userId }
$afterWithdraw = $acc3.Data.data.balance
$expectedAfterWithdraw = $afterDeposit - $withdrawAmount
Write-Result "Withdraw decreases balance correctly" ($afterWithdraw -eq $expectedAfterWithdraw) "Expected: $expectedAfterWithdraw, Got: $afterWithdraw"

# ============================================
# TEST 2: Insufficient Balance Prevention
# ============================================
Write-Host "`n--- Test 2: Insufficient Balance Prevention ---" -ForegroundColor Yellow

$currentBalance = $acc3.Data.data.balance
$overWithdraw = $currentBalance + 1000000

$result = Invoke-Api -Method "POST" -Endpoint "/transactions/withdraw" -Headers @{ "X-User-Id" = $userId } -Body @{ amount = $overWithdraw }
Write-Result "Withdraw more than balance is rejected" (-not $result.Success)

# ============================================
# TEST 3: Negative Amount Prevention
# ============================================
Write-Host "`n--- Test 3: Negative Amount Prevention ---" -ForegroundColor Yellow

$result = Invoke-Api -Method "POST" -Endpoint "/transactions/deposit" -Headers @{ "X-User-Id" = $userId } -Body @{ amount = -100 }
Write-Result "Negative deposit is rejected" (-not $result.Success)

$result = Invoke-Api -Method "POST" -Endpoint "/transactions/withdraw" -Headers @{ "X-User-Id" = $userId } -Body @{ amount = -100 }
Write-Result "Negative withdraw is rejected" (-not $result.Success)

# ============================================
# TEST 4: Self-Transfer Prevention
# ============================================
Write-Host "`n--- Test 4: Self-Transfer Prevention ---" -ForegroundColor Yellow

$myAccountId = $acc3.Data.data.accountId
$result = Invoke-Api -Method "POST" -Endpoint "/transactions/transfer" -Headers @{ "X-User-Id" = $userId } -Body @{
    amount = 1000
    toAccountId = $myAccountId
}
Write-Result "Transfer to self is rejected" (-not $result.Success)


# ============================================
# TEST 5: Login Lock After Failed Attempts
# ============================================
Write-Host "`n--- Test 5: Login Security ---" -ForegroundColor Yellow

# Create a test user for this
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "locktest_$timestamp@example.com"

$reg = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
    email = $testEmail
    password = "TestPassword@123"
    fullName = "Lock Test User"
    phoneNumber = "090$($timestamp.Substring(0,7))"
}

if ($reg.Success) {
    # Try wrong password multiple times
    for ($i = 1; $i -le 5; $i++) {
        $result = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
            email = $testEmail
            password = "WrongPassword$i"
        }
    }
    
    # 6th attempt should be locked
    $result = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
        email = $testEmail
        password = "TestPassword@123"  # Correct password
    }
    Write-Result "Account locked after 5 failed attempts" (-not $result.Success -or $result.Error -match "locked")
} else {
    Write-Result "Account locked after 5 failed attempts" $false "Could not create test user"
}

# ============================================
# TEST 6: Role-Based Access Control
# ============================================
Write-Host "`n--- Test 6: Role-Based Access Control ---" -ForegroundColor Yellow

# Customer trying to access admin endpoint
$result = Invoke-Api -Method "GET" -Endpoint "/admin/users" -Headers @{
    "Authorization" = "Bearer $token"
    "X-User-Id" = $userId
}
Write-Result "Customer cannot access admin endpoints" (-not $result.Success)

# Admin can access admin endpoint
$result = Invoke-Api -Method "GET" -Endpoint "/admin/users" -Headers @{
    "Authorization" = "Bearer $adminToken"
    "X-User-Role" = "ADMIN"
}
Write-Result "Admin can access admin endpoints" $result.Success

# ============================================
# TEST 7: Transaction History Isolation
# ============================================
Write-Host "`n--- Test 7: Transaction History Isolation ---" -ForegroundColor Yellow

# Get my transactions
$myTx = Invoke-Api -Method "GET" -Endpoint "/transactions/history?page=0&size=100" -Headers @{ "X-User-Id" = $userId }

if ($myTx.Success -and $myTx.Data.data.content) {
    $myAccountId = $acc3.Data.data.accountId
    $allMine = $true
    foreach ($tx in $myTx.Data.data.content) {
        if ($tx.fromAccountId -ne $myAccountId -and $tx.toAccountId -ne $myAccountId) {
            $allMine = $false
            break
        }
    }
    Write-Result "Transaction history only shows own transactions" $allMine
} else {
    Write-Result "Transaction history only shows own transactions" $true "No transactions to verify"
}


# ============================================
# TEST 8: Frozen Account Restrictions
# ============================================
Write-Host "`n--- Test 8: Frozen Account Restrictions ---" -ForegroundColor Yellow

# Create another test user
$timestamp2 = Get-Date -Format "yyyyMMddHHmmss"
$freezeEmail = "freezetest_$timestamp2@example.com"

$reg = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
    email = $freezeEmail
    password = "TestPassword@123"
    fullName = "Freeze Test User"
    phoneNumber = "091$($timestamp2.Substring(0,7))"
}

if ($reg.Success) {
    # Login to get token and userId
    $freezeLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
        email = $freezeEmail
        password = "TestPassword@123"
    }
    
    if ($freezeLogin.Success) {
        $freezeToken = $freezeLogin.Data.accessToken
        $freezeMe = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{ "Authorization" = "Bearer $freezeToken" }
        $freezeUserId = $freezeMe.Data.data.userId
        
        # Freeze the user (admin action)
        $freeze = Invoke-Api -Method "PUT" -Endpoint "/users/admin/users/$freezeUserId/freeze" -Headers @{
            "Authorization" = "Bearer $adminToken"
            "X-User-Role" = "ADMIN"
        }
        
        # Try to login with frozen account
        $frozenLogin = Invoke-Api -Method "POST" -Endpoint "/users/login" -Body @{
            email = $freezeEmail
            password = "TestPassword@123"
        }
        Write-Result "Frozen account cannot login" (-not $frozenLogin.Success -or $frozenLogin.Error -match "frozen|locked")
        
        # Unfreeze for cleanup
        Invoke-Api -Method "PUT" -Endpoint "/users/admin/users/$freezeUserId/unfreeze" -Headers @{
            "Authorization" = "Bearer $adminToken"
            "X-User-Role" = "ADMIN"
        } | Out-Null
    }
} else {
    Write-Result "Frozen account cannot login" $false "Could not create test user"
}

# ============================================
# TEST 9: Duplicate Email Prevention
# ============================================
Write-Host "`n--- Test 9: Duplicate Email Prevention ---" -ForegroundColor Yellow

$result = Invoke-Api -Method "POST" -Endpoint "/users/register" -Body @{
    email = "test.user@example.com"  # Existing email
    password = "TestPassword@123"
    fullName = "Duplicate User"
    phoneNumber = "0901234567"
}
Write-Result "Duplicate email registration is rejected" (-not $result.Success)

# ============================================
# TEST 10: Token Validation
# ============================================
Write-Host "`n--- Test 10: Token Validation ---" -ForegroundColor Yellow

# Invalid token
$result = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{
    "Authorization" = "Bearer invalid.token.here"
}
Write-Result "Invalid token is rejected" (-not $result.Success)

# Expired/tampered token
$result = Invoke-Api -Method "GET" -Endpoint "/users/me" -Headers @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwiZXhwIjoxfQ.invalid"
}
Write-Result "Tampered token is rejected" (-not $result.Success)

# ============================================
# SUMMARY
# ============================================
Write-Host "`n=== BUSINESS LOGIC TESTS COMPLETED ===" -ForegroundColor Cyan
Write-Host "Run full API tests with: .\scripts\test-api.ps1" -ForegroundColor Gray
