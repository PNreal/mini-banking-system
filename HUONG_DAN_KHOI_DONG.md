# Hướng Dẫn Khởi Động Mini Banking System

> **Tài liệu đầy đủ để khởi động hệ thống - Đã kiểm chứng thành công**

---

## Yêu Cầu Hệ Thống

- Docker Desktop (đang chạy)
- Java 17+ (OpenJDK hoặc Temurin)
- Maven (hoặc dùng Maven Wrapper có sẵn)
- Node.js 16+ và npm (cho frontend)

### Kiểm Tra:
```powershell
docker --version
java -version
node --version
npm --version
```

---

## Khởi Động Backend (3 Bước)

### BƯỚC 1: Khởi Động Docker

```powershell
docker-compose up -d
Start-Sleep -Seconds 15
```

**Kiểm tra:**
```powershell
docker ps
```

Phải thấy 8 containers đang chạy (6 PostgreSQL + Kafka + Zookeeper).

---

### BƯỚC 2: Sửa API Gateway (Chỉ 1 Lần)

**QUAN TRỌNG**: Chỉ cần làm 1 lần duy nhất!

**File**: `api-gateway/api-gateway/pom.xml` (dòng ~46)

**Thay:**
```xml
<artifactId>spring-cloud-starter-gateway-server-webmvc</artifactId>
```

**Bằng:**
```xml
<artifactId>spring-cloud-starter-gateway-mvc</artifactId>
```

**Lý do**: Dependency cũ không tồn tại trong Spring Cloud 2023.0.3

---

### BƯỚC 3: Khởi Động 7 Services

**Mở 7 terminals riêng biệt** (PowerShell hoặc CMD) và chạy từng service:

#### Terminal 1: User Service (Port 8081)
```powershell
cd services\user-service\user-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 2: Account Service (Port 8082)
```powershell
cd services\account-service\account-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 3: Transaction Service (Port 8083)
```powershell
cd services\transaction-service\transaction-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 4: Admin Service (Port 8084)
```powershell
cd services\admin-service\admin-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 5: Log Service (Port 8085)
```powershell
cd services\log-service\log-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 6: Notification Service (Port 8086)
```powershell
cd services\notification-service\notification-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 7: API Gateway (Port 8080)
```powershell
cd api-gateway\api-gateway
.\mvnw.cmd spring-boot:run
```

**Đợi mỗi service hiển thị**: `Started ...Application in X.XXX seconds`

**Giữ tất cả 7 terminals mở để xem logs!**

---

## Kiểm Tra Trạng Thái

Mở terminal thứ 8 và chạy:

```powershell
# Kiểm tra tất cả ports
$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086)
$names = @("API Gateway", "User", "Account", "Transaction", "Admin", "Log", "Notification")

for ($i = 0; $i -lt $ports.Length; $i++) {
    $conn = Get-NetTCPConnection -LocalPort $ports[$i] -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "OK: $($names[$i]) Service (port $($ports[$i]))" -ForegroundColor Green
    } else {
        Write-Host "FAIL: $($names[$i]) Service (port $($ports[$i]))" -ForegroundColor Red
    }
}
```

**Kết quả mong đợi**: 7/7 services đang chạy

---

## Khởi Động Frontend (Tùy Chọn)

### Customer/Staff UI:
```powershell
cd frontend
npm start
```
Truy cập: http://localhost:3000

### Admin Panel:
```powershell
cd banking-admin-hub-main\banking-admin-hub-main
npm run dev
```
Truy cập: http://localhost:3001

---

## Dừng Hệ Thống

### Dừng Backend:
```powershell
# Đóng 7 terminals hoặc:
Get-Process -Name java | Stop-Process -Force
```

### Dừng Docker:
```powershell
docker-compose down
```

### Dừng Toàn Bộ:
```powershell
.\scripts\stop-all.ps1
```

---

## Điểm Truy Cập

| Service | URL | Mô tả |
|---------|-----|-------|
| **API Gateway** | http://localhost:8080 | **Điểm vào chính** |
| User Service | http://localhost:8081 | Quản lý người dùng |
| Account Service | http://localhost:8082 | Quản lý tài khoản |
| Transaction Service | http://localhost:8083 | Xử lý giao dịch |
| Admin Service | http://localhost:8084 | Quản trị hệ thống |
| Log Service | http://localhost:8085 | Ghi log |
| Notification Service | http://localhost:8086 | Thông báo |
| Customer UI | http://localhost:3000 | Giao diện khách hàng |
| Admin Panel | http://localhost:3001 | Giao diện admin |

---

## Tài Khoản Test

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@minibank.com | Admin@123 |
| Customer | test.user@example.com | TestPassword#123 |
| Staff | staff@minibank.com | Staff@123 |
| Counter Admin | counter.admin@minibank.com | CounterAdmin@123 |

---

## Thời Gian Khởi Động

| Bước | Thời gian |
|------|-----------|
| Docker | ~15 giây |
| Mỗi Service | ~30-60 giây |
| **Tổng** | **~5-7 phút** |

---

## Xử Lý Lỗi Thường Gặp

### 1. Port đã được sử dụng
```powershell
Get-Process -Name java | Stop-Process -Force
```

### 2. Database không kết nối
```powershell
docker-compose down
docker-compose up -d
Start-Sleep -Seconds 15
```

### 3. API Gateway lỗi dependency
Xem BƯỚC 2 (sửa pom.xml)

### 4. Service không khởi động
- Xem logs trong terminal của service đó
- Kiểm tra Docker containers: `docker ps`
- Khởi động lại từ đầu

---

## Tips Hữu Ích

### 1. Sử Dụng Windows Terminal
Mở Windows Terminal và tạo 7 tabs (Ctrl + Shift + T) cho 7 services. Dễ quản lý hơn nhiều cửa sổ riêng lẻ.

### 2. Đặt Tên Terminal
```powershell
$host.UI.RawUI.WindowTitle = "User Service - Port 8081"
```

### 3. Copy-Paste Nhanh
Tạo file `commands.txt`:
```
cd services\user-service\user-service && .\mvnw.cmd spring-boot:run
cd services\account-service\account-service && .\mvnw.cmd spring-boot:run
cd services\transaction-service\transaction-service && .\mvnw.cmd spring-boot:run
cd services\admin-service\admin-service && .\mvnw.cmd spring-boot:run
cd services\log-service\log-service && .\mvnw.cmd spring-boot:run
cd services\notification-service\notification-service && .\mvnw.cmd spring-boot:run
cd api-gateway\api-gateway && .\mvnw.cmd spring-boot:run
```

### 4. Bookmark URLs
- http://localhost:8080 (API Gateway)
- http://localhost:3000 (Customer UI)
- http://localhost:3001 (Admin Panel)

---

## Checklist Khởi Động

- [ ] Docker Desktop đang chạy
- [ ] Chạy `docker-compose up -d`
- [ ] Đợi 15 giây
- [ ] Kiểm tra 8 containers (`docker ps`)
- [ ] Sửa API Gateway pom.xml (nếu chưa sửa)
- [ ] Mở Terminal 1 - User Service - Thấy "Started"
- [ ] Mở Terminal 2 - Account Service - Thấy "Started"
- [ ] Mở Terminal 3 - Transaction Service - Thấy "Started"
- [ ] Mở Terminal 4 - Admin Service - Thấy "Started"
- [ ] Mở Terminal 5 - Log Service - Thấy "Started"
- [ ] Mở Terminal 6 - Notification Service - Thấy "Started"
- [ ] Mở Terminal 7 - API Gateway - Thấy "Started"
- [ ] Kiểm tra 7/7 ports đang chạy
- [ ] Truy cập http://localhost:8080

---

## Quy Trình Hàng Ngày

### Bắt đầu làm việc:
```powershell
# 1. Docker
docker-compose up -d
Start-Sleep -Seconds 15

# 2. Backend (mở 7 terminals - xem BƯỚC 3)

# 3. Frontend (terminal mới)
cd frontend
npm start
```

### Kết thúc làm việc:
```powershell
.\scripts\stop-all.ps1
```

---

## Tài Liệu Liên Quan

- [README.md](README.md) - Tổng quan hệ thống
- [CHANGELOG.md](CHANGELOG.md) - Lịch sử thay đổi
- [documentation/DATABASE_OVERVIEW.md](documentation/DATABASE_OVERVIEW.md) - Database
- [documentation/README.md](documentation/README.md) - Tài liệu kỹ thuật
- [scripts/README.md](scripts/README.md) - Scripts

---

## Xác Nhận Thành Công

Hệ thống đã sẵn sàng khi:

1. 8 Docker containers đang chạy
2. 7 backend services đang chạy (ports 8080-8086)
3. Không có lỗi trong logs
4. Truy cập được http://localhost:8080

---

**Phương pháp này đã được kiểm chứng thành công vào 2025-12-20**

**Cập nhật lần cuối**: 2025-12-20
