# Script khởi động tất cả các dịch vụ của Mini Banking System
# Chạy script này với quyền Administrator

Write-Host "Đang khởi động Mini Banking System..." -ForegroundColor Green

# Khởi động User Service
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\services\user-service\user-service'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Khởi động Account Service
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\services\account-service\account-service'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Khởi động Transaction Service
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\services\transaction-service\transaction-service'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Khởi động Admin Service
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\services\admin-service\admin-service'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Khởi động Log Service
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\services\log-service\log-service'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Khởi động Notification Service
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\services\notification-service\notification-service'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Khởi động API Gateway
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\api-gateway\api-gateway'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Khởi động Frontend (Customer Web)
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\frontend'; npm run start:web" -WindowStyle Normal

# Khởi động Admin Panel
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd 'X:\mini-banking-system\banking-admin-hub-main\banking-admin-hub-main'; npm run dev" -WindowStyle Normal

Write-Host "Đã khởi động tất cả các dịch vụ. Vui lòng đợi 2-3 phút để các dịch vụ khởi động hoàn tất." -ForegroundColor Green
Write-Host "Truy cập ứng dụng:" -ForegroundColor Yellow
Write-Host "- Customer Web: http://localhost:3002" -ForegroundColor White
Write-Host "- Admin Panel: http://localhost:3001" -ForegroundColor White
Write-Host "- API Gateway: http://localhost:8080" -ForegroundColor White
