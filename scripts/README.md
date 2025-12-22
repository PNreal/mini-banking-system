# Scripts - Các Script Quản Lý Hệ Thống Docker

Thư mục này chứa các PowerShell scripts để quản lý Mini Banking System chạy bằng Docker.

## Danh Sách Scripts

### Dừng

#### `stop-all.ps1`
**Mục đích**: Dừng toàn bộ hệ thống Docker

**Cách dùng**:
```powershell
.\scripts\stop-all.ps1
```

**Chức năng**:
- Dừng tất cả Docker containers
- Dọn dẹp volumes (nếu cần)
- Giải phóng các port
- Hiển thị kết quả

---

### Kiểm Tra

#### `check-services.ps1`
**Mục đích**: Kiểm tra trạng thái tất cả services

**Cách dùng**:
```powershell
.\scripts\check-services.ps1
```

**Hiển thị**:
- Trạng thái 7 backend services (port 8080-8086)
- Trạng thái frontend applications (port 3001, 3002)
- Trạng thái Docker containers (databases, Kafka, Zookeeper)
- Danh sách containers đang chạy

---

### Testing

#### `run-tests.ps1`
**Mục đích**: Chạy unit tests cho các services

**Cách dùng**:
```powershell
# Chạy tests cho tất cả services
.\scripts\run-tests.ps1

# Chạy tests cho một service cụ thể
.\scripts\run-tests.ps1 log-service
.\scripts\run-tests.ps1 account-service
```

**Services hỗ trợ**:
- log-service
- account-service
- transaction-service
- admin-service
- user-service
- notification-service

**Chức năng**:
- Tự động detect JAVA_HOME
- Chạy Maven tests
- Hiển thị kết quả chi tiết
- Tổng hợp số tests passed/failed

---

#### `test-api.ps1`
**Mục đích**: Test toàn bộ API endpoints của hệ thống

**Cách dùng**:
```powershell
# Chạy tất cả tests
.\scripts\test-api.ps1

# Chạy test cho module cụ thể
.\scripts\test-api.ps1 auth          # Authentication tests
.\scripts\test-api.ps1 account       # Account tests
.\scripts\test-api.ps1 transaction   # Transaction tests
.\scripts\test-api.ps1 kyc           # KYC tests
.\scripts\test-api.ps1 counter       # Counter tests
.\scripts\test-api.ps1 admin         # Admin tests
.\scripts\test-api.ps1 notification  # Notification tests
.\scripts\test-api.ps1 log           # Log tests
.\scripts\test-api.ps1 transfer      # Transfer tests
.\scripts\test-api.ps1 security      # Security tests
.\scripts\test-api.ps1 staff         # Staff dashboard tests
```

**Test Suites (14 modules)**:
1. Authentication - Đăng ký, đăng nhập, refresh token
2. Account - Thông tin tài khoản, số dư
3. Transactions - Nạp/rút tiền, lịch sử giao dịch
4. KYC - Xác minh danh tính
5. Counter - Quầy giao dịch
6. Admin - Quản trị hệ thống
7. Notifications - Thông báo
8. Logs - Nhật ký hoạt động
9. Password Management - Đổi/quên mật khẩu
10. User Management - Quản lý user (admin)
11. Counter Transactions - Giao dịch tại quầy
12. Transfer - Chuyển tiền
13. Security - Bảo mật, phân quyền
14. Staff Dashboard - Dashboard nhân viên

---

#### `test-business-logic.ps1`
**Mục đích**: Test các business logic quan trọng

**Cách dùng**:
```powershell
.\scripts\test-business-logic.ps1
```

**Test Cases**:
1. Account Balance Consistency - Kiểm tra tính nhất quán số dư
2. Insufficient Balance Prevention - Ngăn rút quá số dư
3. Negative Amount Prevention - Ngăn số tiền âm
4. Self-Transfer Prevention - Ngăn chuyển tiền cho chính mình
5. Login Lock After Failed Attempts - Khóa sau 5 lần sai mật khẩu
6. Role-Based Access Control - Phân quyền truy cập
7. Transaction History Isolation - Cô lập lịch sử giao dịch
8. Frozen Account Restrictions - Hạn chế tài khoản bị đóng băng
9. Duplicate Email Prevention - Ngăn email trùng lặp
10. Token Validation - Xác thực token

---

#### `test-quick.bat`
**Mục đích**: Test nhanh các API cơ bản (dùng curl)

**Cách dùng**:
```cmd
scripts\test-quick.bat
```

**Kiểm tra**:
- Customer login
- Admin login
- Get counters
- Health check

---

## Quy Trình Làm Việc Hàng Ngày

### Khởi động hệ thống:
```powershell
# 1. Khởi động toàn bộ hệ thống bằng Docker
docker-compose up -d

# 2. Đợi 10-15 giây để services khởi động
Start-Sleep -Seconds 15

# 3. Kiểm tra trạng thái
.\scripts\check-services.ps1
```

### Kiểm tra trạng thái:
```powershell
.\scripts\check-services.ps1
```

### Dừng hệ thống:
```powershell
.\scripts\stop-all.ps1
```

### Chạy tests:
```powershell
.\scripts\run-tests.ps1
```

---

## Xử Lý Sự Cố

### Lỗi: Port đã được sử dụng
```powershell
# Kiểm tra port
netstat -ano | findstr "8080"

# Dừng tất cả
.\scripts\stop-all.ps1
```

### Lỗi: Service không khởi động
```powershell
# Kiểm tra trạng thái
.\scripts\check-services.ps1

# Xem logs của service cụ thể
docker-compose logs user-service

# Khởi động lại
docker-compose down
docker-compose up -d
```

### Lỗi: Docker không chạy
```powershell
# Khởi động Docker Desktop
# Sau đó:
docker-compose up -d
```

---

## Lưu Ý

- Tất cả scripts phải chạy từ thư mục gốc của project
- Scripts yêu cầu PowerShell 5.0 trở lên
- Cần quyền Administrator để dừng containers
- Logs của services có thể xem bằng lệnh `docker-compose logs -f [service-name]`

---

## Hỗ Trợ

Nếu gặp vấn đề:
1. Chạy `.\scripts\check-services.ps1` để kiểm tra trạng thái
2. Xem logs bằng `docker-compose logs -f`
3. Kiểm tra Docker containers: `docker ps`
4. Tham khảo tài liệu chi tiết trong thư mục `documentation/`