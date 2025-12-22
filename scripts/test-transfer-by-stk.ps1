# Test Transfer by Account Number (STK) with KYC validation
# Requires: 2 users with KYC APPROVED

$BASE_URL = "http://localhost:8080/api"

Write-Host "=== TEST TRANSFER BY ACCOUNT NUMBER (STK) ===" -ForegroundColor Cyan

# Step 1: Register User A (Sender)
Write-Host "`n[1] Registering User A (Sender)..." -ForegroundColor Yellow
$senderEmail = "sender_$(Get-Random)@test.com"
$senderBody = @{
    email = $senderEmail
    password = "Test@123456"
    fullName = "Nguyen Van A"
} | ConvertTo-Json

$senderReg = Invoke-RestMethod -Uri "$BASE_URL/v1/users/register" -Method POST -Body $senderBody -ContentType "application/json"
Write-Host "Sender registered: $senderEmail"

# Step 2: Login User A
Write-Host "`n[2] Login User A..." -ForegroundColor Yellow
$loginBody = @{
    email = $senderEmail
    password = "Test@123456"
} | ConvertTo-Json

$senderLogin = Invoke-RestMethod -Uri "$BASE_URL/v1/users/login" -Method POST -Body $loginBody -ContentType "application/json"
$senderToken = $senderLogin.data.accessToken
$senderUserId = $senderLogin.data.userId
Write-Host "Sender UserId: $senderUserId"

# Step 3: Register User B (Receiver)
Write-Host "`n[3] Registering User B (Receiver)..." -ForegroundColor Yellow
$receiverEmail = "receiver_$(Get-Random)@test.com"
$receiverBody = @{
    email = $receiverEmail
    password = "Test@123456"
    fullName = "Tran Van B"
} | ConvertTo-Json

$receiverReg = Invoke-RestMethod -Uri "$BASE_URL/v1/users/register" -Method POST -Body $receiverBody -ContentType "application/json"
Write-Host "Receiver registered: $receiverEmail"

# Step 4: Login User B
Write-Host "`n[4] Login User B..." -ForegroundColor Yellow
$loginBody = @{
    email = $receiverEmail
    password = "Test@123456"
} | ConvertTo-Json

$receiverLogin = Invoke-RestMethod -Uri "$BASE_URL/v1/users/login" -Method POST -Body $loginBody -ContentType "application/json"
$receiverToken = $receiverLogin.data.accessToken
$receiverUserId = $receiverLogin.data.userId
Write-Host "Receiver UserId: $receiverUserId"

# Step 5: Try transfer WITHOUT KYC (should fail)
Write-Host "`n[5] Try transfer WITHOUT KYC (should fail)..." -ForegroundColor Yellow
$transferBody = @{
    toAccountNumber = "000000000000"
    amount = 100000
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $senderToken"
        "Content-Type" = "application/json"
    }
    $transfer = Invoke-RestMethod -Uri "$BASE_URL/v1/transactions/transfer" -Method POST -Body $transferBody -Headers $headers
    Write-Host "ERROR: Transfer should have failed!" -ForegroundColor Red
} catch {
    $errorMsg = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Expected error: $($errorMsg.message)" -ForegroundColor Green
}

# Step 6: Submit KYC for User A
Write-Host "`n[6] Submit KYC for User A..." -ForegroundColor Yellow
$kycBody = @{
    fullName = "Nguyen Van A"
    dateOfBirth = "1990-01-15"
    citizenId = "012345678901"
    citizenIdIssuedDate = "2020-01-01"
    citizenIdIssuedPlace = "Ha Noi"
    address = "123 ABC Street, Ha Noi"
    frontIdImageUrl = "https://example.com/front.jpg"
    backIdImageUrl = "https://example.com/back.jpg"
    selfieImageUrl = "https://example.com/selfie.jpg"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $senderToken"
    "Content-Type" = "application/json"
}
$kycA = Invoke-RestMethod -Uri "$BASE_URL/v1/kyc/submit" -Method POST -Body $kycBody -Headers $headers
$kycIdA = $kycA.data.id
Write-Host "KYC submitted for User A, ID: $kycIdA"

# Step 7: Submit KYC for User B
Write-Host "`n[7] Submit KYC for User B..." -ForegroundColor Yellow
$kycBody = @{
    fullName = "Tran Van B"
    dateOfBirth = "1992-05-20"
    citizenId = "098765432109"
    citizenIdIssuedDate = "2021-06-15"
    citizenIdIssuedPlace = "Ho Chi Minh"
    address = "456 XYZ Street, HCM"
    frontIdImageUrl = "https://example.com/front2.jpg"
    backIdImageUrl = "https://example.com/back2.jpg"
    selfieImageUrl = "https://example.com/selfie2.jpg"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $receiverToken"
    "Content-Type" = "application/json"
}
$kycB = Invoke-RestMethod -Uri "$BASE_URL/v1/kyc/submit" -Method POST -Body $kycBody -Headers $headers
$kycIdB = $kycB.data.id
Write-Host "KYC submitted for User B, ID: $kycIdB"

# Step 8: Admin approves KYC (need admin token)
Write-Host "`n[8] Admin login and approve KYC..." -ForegroundColor Yellow
$adminLogin = @{
    email = "admin@minibank.com"
    password = "Admin@123456"
} | ConvertTo-Json

try {
    $adminAuth = Invoke-RestMethod -Uri "$BASE_URL/v1/users/admin/login" -Method POST -Body $adminLogin -ContentType "application/json"
    $adminToken = $adminAuth.data.accessToken
    
    # Approve KYC A
    $approveBody = @{
        status = "APPROVED"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    Invoke-RestMethod -Uri "$BASE_URL/v1/kyc/$kycIdA/review" -Method POST -Body $approveBody -Headers $headers
    Write-Host "KYC A approved"
    
    # Approve KYC B
    Invoke-RestMethod -Uri "$BASE_URL/v1/kyc/$kycIdB/review" -Method POST -Body $approveBody -Headers $headers
    Write-Host "KYC B approved"
} catch {
    Write-Host "Admin login/approve failed: $_" -ForegroundColor Red
    Write-Host "Please manually approve KYC requests" -ForegroundColor Yellow
}

# Step 9: Get User B's account number
Write-Host "`n[9] Get User B's account info..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $receiverToken"
}
$accountB = Invoke-RestMethod -Uri "$BASE_URL/v1/accounts/me" -Method GET -Headers $headers
$receiverAccountNumber = $accountB.data.accountNumber
Write-Host "Receiver Account Number: $receiverAccountNumber"

# Step 10: Deposit money to User A
Write-Host "`n[10] Deposit 1,000,000 VND to User A..." -ForegroundColor Yellow
$depositBody = @{
    amount = 1000000
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $senderToken"
    "Content-Type" = "application/json"
}
$deposit = Invoke-RestMethod -Uri "$BASE_URL/v1/transactions/deposit" -Method POST -Body $depositBody -Headers $headers
Write-Host "Deposited. New balance: $($deposit.data.balance)"

# Step 11: Transfer by Account Number
Write-Host "`n[11] Transfer 100,000 VND to User B by Account Number..." -ForegroundColor Yellow
$transferBody = @{
    toAccountNumber = $receiverAccountNumber
    amount = 100000
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $senderToken"
    "Content-Type" = "application/json"
}

try {
    $transfer = Invoke-RestMethod -Uri "$BASE_URL/v1/transactions/transfer" -Method POST -Body $transferBody -Headers $headers
    Write-Host "Transfer SUCCESS!" -ForegroundColor Green
    Write-Host "Transaction ID: $($transfer.data.id)"
    Write-Host "Sender new balance: $($transfer.data.balance)"
} catch {
    $errorMsg = $_.ErrorDetails.Message
    Write-Host "Transfer failed: $errorMsg" -ForegroundColor Red
}

# Step 12: Check User B's balance
Write-Host "`n[12] Check User B's balance..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $receiverToken"
}
$accountB = Invoke-RestMethod -Uri "$BASE_URL/v1/accounts/me" -Method GET -Headers $headers
Write-Host "Receiver balance: $($accountB.data.balance)"

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Cyan
