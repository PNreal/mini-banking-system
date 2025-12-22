# Script kiem tra cac tai khoan trong database
# Yeu cau: Docker dang chay va PostgreSQL containers dang hoat dong

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KIEM TRA TAI KHOAN TRONG DATABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiem tra Docker dang chay
Write-Host "Dang kiem tra Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker khong chay hoac chua cai dat!" -ForegroundColor Red
    Write-Host "Vui long khoi dong Docker Desktop va thu lai." -ForegroundColor Yellow
    exit 1
}

# Kiem tra container postgres-user dang chay
Write-Host "Dang kiem tra PostgreSQL User Service..." -ForegroundColor Yellow
$userDbContainer = docker ps --filter "name=postgres-user-service" --format "{{.Names}}" 2>$null
if (-not $userDbContainer) {
    Write-Host "[X] Container postgres-user-service khong chay!" -ForegroundColor Red
    Write-Host "Vui long chay: docker-compose up -d postgres-user" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] PostgreSQL dang chay" -ForegroundColor Green
Write-Host ""

# Query để lấy danh sách users
$query = @"
SELECT 
    user_id,
    email,
    full_name,
    role,
    status,
    citizen_id,
    employee_code,
    email_verified,
    failed_login_attempts,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
FROM users
ORDER BY 
    CASE role 
        WHEN 'ADMIN' THEN 1 
        WHEN 'STAFF' THEN 2 
        WHEN 'CUSTOMER' THEN 3 
    END,
    created_at;
"@

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DANH SÁCH TÀI KHOẢN NGƯỜI DÙNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Thực thi query
$result = docker exec -i postgres-user-service psql -U user_user -d user_db -c "$query" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host $result
    Write-Host ""
    
    # Dem so luong theo role
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "THONG KE THEO VAI TRO" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $countQuery = @"
SELECT 
    role,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active,
    SUM(CASE WHEN status = 'LOCKED' THEN 1 ELSE 0 END) as locked,
    SUM(CASE WHEN status = 'FROZEN' THEN 1 ELSE 0 END) as frozen
FROM users
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'ADMIN' THEN 1 
        WHEN 'STAFF' THEN 2 
        WHEN 'CUSTOMER' THEN 3 
    END;
"@
    
    $countResult = docker exec -i postgres-user-service psql -U user_user -d user_db -c "$countQuery" 2>&1
    Write-Host $countResult
    Write-Host ""
    
    # Kiem tra KYC requests
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "YEU CAU XAC MINH KYC" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $kycQuery = @"
SELECT 
    k.kyc_id,
    u.email as user_email,
    k.full_name,
    k.citizen_id,
    k.status,
    TO_CHAR(k.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
    CASE 
        WHEN k.verified_by IS NOT NULL THEN (SELECT email FROM users WHERE user_id = k.verified_by)
        ELSE NULL
    END as verified_by_email
FROM kyc_requests k
JOIN users u ON k.user_id = u.user_id
ORDER BY k.created_at DESC;
"@
    
    $kycResult = docker exec -i postgres-user-service psql -U user_user -d user_db -c "$kycQuery" 2>&1
    Write-Host $kycResult
    Write-Host ""
    
    # Thong tin dang nhap
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "THONG TIN DANG NHAP MAU" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ADMIN:" -ForegroundColor Green
    Write-Host "  Email: admin@minibank.com" -ForegroundColor White
    Write-Host "  Password: Admin@123" -ForegroundColor White
    Write-Host ""
    Write-Host "STAFF:" -ForegroundColor Green
    Write-Host "  Email: staff1@minibank.com / staff2@minibank.com" -ForegroundColor White
    Write-Host "  Password: staff123" -ForegroundColor White
    Write-Host ""
    Write-Host "CUSTOMER:" -ForegroundColor Green
    Write-Host "  Email: customer1@example.com (ACTIVE)" -ForegroundColor White
    Write-Host "  Email: customer2@example.com (ACTIVE)" -ForegroundColor White
    Write-Host "  Email: customer3@example.com (LOCKED)" -ForegroundColor White
    Write-Host "  Email: customer4@example.com (FROZEN)" -ForegroundColor White
    Write-Host "  Password: customer123" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "[X] Loi khi truy van database!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hoan thanh!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
