# 🚀 Hướng Dẫn Khởi Động Backend - Phương Pháp Đã Kiểm Chứng

> **Tài liệu này mô tả phương pháp khởi động backend đã được kiểm chứng thành công vào ngày 2025-12-20**

---

## 📋 Yêu Cầu Trước Khi Bắt Đầu

### Phần Mềm Cần Thiết:
- ✅ Docker Desktop (đang chạy)
- ✅ Java 17+ (OpenJDK hoặc Temurin)
- ✅ Maven (hoặc sử dụng Maven Wrapper có sẵn)

### Kiểm Tra:
```powershell
# Kiểm tra Docker
docker --version
docker ps

# Kiểm tra Java
java -version

# Kết quả mong đợi: Java 17.x.x
```

---

## 🎯 Phương Pháp Khởi Động (Đã Kiểm Chứng)

### BƯỚC 1: Khởi Động Databases và Kafka

```powershell
# Chạy từ thư mục gốc của project
docker-compose up -d
```

**Kết quả mong đợi:**
```
✔ Container postgres-admin-service             Started
✔ Container postgres-log-service               Started
✔ Container postgres-user-service              Started
✔ Container postgres-notification-service      Started
✔ Container zookeeper                          Healthy
✔ Container postgres-account-service           Started
✔ Container postgres-transaction-service       Started
✔ Container kafka                              Started
```

**Đợi databases khởi động:**
```powershell
Start-Sleep -Seconds 15
```

**Kiểm tra containers:**
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Phải thấy 8 containers với status "Up" và "healthy".

---

### BƯỚC 2: Sửa Lỗi API Gateway (Chỉ Cần Làm 1 Lần)

**⚠️ QUAN TRỌNG**: API Gateway có lỗi trong file `pom.xml` cần sửa trước khi khởi động.

**File cần sửa:** `api-gateway/api-gateway/pom.xml`

**Tìm dòng (khoảng dòng 46-48):**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway-server-webmvc</artifactId>
</dependency>
```

**Thay thế bằng:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway-mvc</artifactId>
</dependency>
```

**Lý do**: Dependency `spring-cloud-starter-gateway-server-webmvc` không tồn tại trong Spring Cloud version 2023.0.3. Phải dùng `spring-cloud-starter-gateway-mvc`.

---

### BƯỚC 3: Khởi Động Backend Services Thủ Công

**Phương pháp khuyến nghị**: Khởi động từng service trong terminal riêng biệt để dễ theo dõi logs.

**Lưu ý**: Mở 7 cửa sổ terminal (PowerShell hoặc CMD) riêng biệt.

#### 3.1. User Service (Port 8081)

**Mở Terminal 1** (PowerShell hoặc CMD):
```powershell
cd services\user-service\user-service
.\mvnw.cmd spring-boot:run
```

**Đợi thấy dòng:**
```
Started UserServiceApplication in X.XXX seconds
```

**Lưu ý**: Giữ terminal này mở, không đóng!

---

#### 3.2. Account Service (Port 8082)

**Mở Terminal 2 mới** (không đóng Terminal 1):
```powershell
cd services\account-service\account-service
.\mvnw.cmd spring-boot:run
```

**Đợi thấy dòng:**
```
Started AccountServiceApplication in X.XXX seconds
```

---

#### 3.3. Transaction Service (Port 8083)

**Mở Terminal 3 mới**:
```powershell
cd services\transaction-service\transaction-service
.\mvnw.cmd spring-boot:run
```

**Đợi thấy dòng:**
```
Started TransactionServiceApplication in X.XXX seconds
```

---

#### 3.4. Admin Service (Port 8084)

**Mở Terminal 4 mới**:
```powershell
cd services\admin-service\admin-service
.\mvnw.cmd spring-boot:run
```

**Đợi thấy dòng:**
```
Started AdminServiceApplication in X.XXX seconds
```

---

#### 3.5. Log Service (Port 8085)

**Mở Terminal 5 mới**:
```powershell
cd services\log-service\log-service
.\mvnw.cmd spring-boot:run
```

**Đợi thấy dòng:**
```
Started LogServiceApplication in X.XXX seconds
```

---

#### 3.6. Notification Service (Port 8086)

**Mở Terminal 6 mới**:
```powershell
cd services\notification-service\notification-service
.\mvnw.cmd spring-boot:run
```

**Đợi thấy dòng:**
```
Started NotificationServiceApplication in X.XXX seconds
```

---

#### 3.7. API Gateway (Port 8080)

**Mở Terminal 7 mới** (terminal cuối cùng):
```powershell
cd api-gateway\api-gateway
.\mvnw.cmd spring-boot:run
```

**Đợi thấy dòng:**
```
Started ApiGatewayApplication in X.XXX seconds
```

**Hoàn tất!** Bây giờ bạn có 7 terminals đang chạy 7 services.

---

### BƯỚC 4: Kiểm Tra Trạng Thái

Mở **Terminal 8** (terminal mới):

```powershell
# Kiểm tra tất cả ports
$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086)
$serviceNames = @{
    8080 = "API Gateway"
    8081 = "User Service"
    8082 = "Account Service"
    8083 = "Transaction Service"
    8084 = "Admin Service"
    8085 = "Log Service"
    8086 = "Notification Service"
}

Write-Host "=== TRẠNG THÁI BACKEND SERVICES ===" -ForegroundColor Cyan
Write-Host ""

$running = 0
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "✓ $($serviceNames[$port]) - Running on port $port" -ForegroundColor Green
        $running++
    } else {
        Write-Host "✗ $($serviceNames[$port]) - Not running on port $port" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Tổng: $running/7 services đang chạy" -ForegroundColor $(if ($running -eq 7) { "Green" } else { "Yellow" })
```

**Kết quả mong đợi:**
```
✓ User Service - Running on port 8081
✓ Account Service - Running on port 8082
✓ Transaction Service - Running on port 8083
✓ Admin Service - Running on port 8084
✓ Log Service - Running on port 8085
✓ Notification Service - Running on port 8086
✓ API Gateway - Running on port 8080

Tổng: 7/7 services đang chạy
```

---

## ⏱️ Thời Gian Khởi Động

| Bước | Thời gian | Ghi chú |
|------|-----------|---------|
| Docker Compose | ~15 giây | Databases + Kafka |
| Mỗi Service | ~30-60 giây | Tùy máy |
| Tổng cộng | ~5-7 phút | Cho tất cả 7 services |

---

## 🌐 Điểm Truy Cập

Sau khi khởi động thành công:

| Service | URL | Mô tả |
|---------|-----|-------|
| API Gateway | http://localhost:8080 | Điểm vào chính |
| User Service | http://localhost:8081 | Direct access (nếu cần) |
| Account Service | http://localhost:8082 | Direct access (nếu cần) |
| Transaction Service | http://localhost:8083 | Direct access (nếu cần) |
| Admin Service | http://localhost:8084 | Direct access (nếu cần) |
| Log Service | http://localhost:8085 | Direct access (nếu cần) |
| Notification Service | http://localhost:8086 | Direct access (nếu cần) |

**Lưu ý**: Nên sử dụng API Gateway (8080) thay vì truy cập trực tiếp vào services.

---

## 🛑 Dừng Backend

### Cách 1: Dừng Từng Terminal
Trong mỗi terminal đang chạy service, nhấn:
```
Ctrl + C
```

### Cách 2: Dừng Tất Cả Java Processes
```powershell
Get-Process -Name java | Stop-Process -Force
```

### Cách 3: Dừng Docker Containers
```powershell
docker-compose down
```

---

## ❌ Xử Lý Lỗi Thường Gặp

### Lỗi 1: API Gateway - Dependency Version Missing

**Triệu chứng:**
```
[ERROR] 'dependencies.dependency.version' for org.springframework.cloud:spring-cloud-starter-gateway-server-webmvc:jar is missing
```

**Giải pháp:**
Xem BƯỚC 2 ở trên - Sửa file `pom.xml` của API Gateway.

---

### Lỗi 2: Port Already in Use

**Triệu chứng:**
```
Port 8081 was already in use
```

**Giải pháp:**
```powershell
# Tìm process đang dùng port
netstat -ano | findstr "8081"

# Hoặc dừng tất cả Java processes
Get-Process -Name java | Stop-Process -Force
```

---

### Lỗi 3: Database Connection Failed

**Triệu chứng:**
```
Connection refused: localhost:5434
```

**Giải pháp:**
```powershell
# Kiểm tra Docker containers
docker ps

# Nếu không có containers, khởi động lại
docker-compose down
docker-compose up -d
Start-Sleep -Seconds 15
```

---

### Lỗi 4: Kafka Not Available

**Triệu chứng:**
```
Failed to connect to Kafka broker
```

**Giải pháp:**
```powershell
# Kiểm tra Kafka container
docker ps | findstr kafka

# Nếu không chạy, khởi động lại
docker start kafka
```

---

## 📝 Checklist Khởi Động

Sử dụng checklist này mỗi lần khởi động:

- [ ] Docker Desktop đang chạy
- [ ] Chạy `docker-compose up -d`
- [ ] Đợi 15 giây
- [ ] Kiểm tra 8 containers đang chạy (`docker ps`)
- [ ] Sửa API Gateway pom.xml (nếu chưa sửa)
- [ ] Khởi động User Service (Terminal 1)
- [ ] Khởi động Account Service (Terminal 2)
- [ ] Khởi động Transaction Service (Terminal 3)
- [ ] Khởi động Admin Service (Terminal 4)
- [ ] Khởi động Log Service (Terminal 5)
- [ ] Khởi động Notification Service (Terminal 6)
- [ ] Khởi động API Gateway (Terminal 7)
- [ ] Kiểm tra 7/7 services đang chạy
- [ ] Test API Gateway: http://localhost:8080

---

## 🔍 Kiểm Tra Logs

Nếu service không khởi động, xem logs trong terminal của service đó để tìm lỗi.

**Các lỗi thường gặp:**
- Database connection failed → Kiểm tra Docker containers
- Port already in use → Dừng process đang dùng port
- Dependency errors → Kiểm tra pom.xml
- Kafka connection failed → Khởi động lại Kafka container

---

## 💡 Tips

### Tip 1: Sử Dụng Windows Terminal
Mở Windows Terminal và tạo 7 tabs cho 7 services. Dễ quản lý hơn nhiều terminal riêng lẻ.

### Tip 2: Đặt Tên Cho Mỗi Terminal
Trong PowerShell, đặt tên cửa sổ để dễ phân biệt:
```powershell
$host.UI.RawUI.WindowTitle = "User Service - Port 8081"
```

### Tip 3: Bookmark URLs
Lưu các URLs vào bookmark để truy cập nhanh:
- http://localhost:8080 (API Gateway)
- http://localhost:3000 (Frontend)
- http://localhost:3001 (Admin Panel)

---

## 📚 Tài Liệu Liên Quan

- [STARTUP_REPORT.md](../STARTUP_REPORT.md) - Báo cáo khởi động lần gần nhất
- [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Cấu trúc project
- [README.md](../README.md) - Tài liệu chính

---

## ✅ Xác Nhận Thành Công

Hệ thống đã khởi động thành công khi:

1. ✅ 8 Docker containers đang chạy (healthy)
2. ✅ 7 backend services đang chạy (ports 8080-8086)
3. ✅ Không có lỗi trong logs
4. ✅ Có thể truy cập http://localhost:8080

---

**Ghi chú**: Phương pháp này đã được kiểm chứng thành công vào 2025-12-20. Nếu gặp vấn đề, tham khảo phần "Xử Lý Lỗi" hoặc xem logs chi tiết.

**Cập nhật lần cuối**: 2025-12-20
