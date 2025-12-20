# ⚡ Quick Reference - Khởi Động Nhanh

> Tài liệu tham khảo nhanh để khởi động Mini Banking System

---

## 🚀 Khởi Động Backend (3 Bước)

### Bước 1: Docker
```powershell
docker-compose up -d
Start-Sleep -Seconds 15
```

### Bước 2: Sửa API Gateway (Chỉ 1 lần)
**File**: `api-gateway/api-gateway/pom.xml` (dòng ~46)

**Thay:**
```xml
<artifactId>spring-cloud-starter-gateway-server-webmvc</artifactId>
```

**Bằng:**
```xml
<artifactId>spring-cloud-starter-gateway-mvc</artifactId>
```

### Bước 3: Khởi Động 7 Services

**Mở 7 terminals riêng biệt và chạy từng service:**

**Terminal 1 - User Service:**
```powershell
cd services\user-service\user-service
.\mvnw.cmd spring-boot:run
```

**Terminal 2 - Account Service:**
```powershell
cd services\account-service\account-service
.\mvnw.cmd spring-boot:run
```

**Terminal 3 - Transaction Service:**
```powershell
cd services\transaction-service\transaction-service
.\mvnw.cmd spring-boot:run
```

**Terminal 4 - Admin Service:**
```powershell
cd services\admin-service\admin-service
.\mvnw.cmd spring-boot:run
```

**Terminal 5 - Log Service:**
```powershell
cd services\log-service\log-service
.\mvnw.cmd spring-boot:run
```

**Terminal 6 - Notification Service:**
```powershell
cd services\notification-service\notification-service
.\mvnw.cmd spring-boot:run
```

**Terminal 7 - API Gateway:**
```powershell
cd api-gateway\api-gateway
.\mvnw.cmd spring-boot:run
```

**Đợi mỗi service hiển thị**: `Started ...Application in X.XXX seconds`

**Lưu ý**: Giữ tất cả 7 terminals mở để xem logs

---

## 🔍 Kiểm Tra Trạng Thái

```powershell
# Kiểm tra Docker
docker ps

# Kiểm tra Backend Services
$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) { Write-Host "✓ Port $port" -ForegroundColor Green }
    else { Write-Host "✗ Port $port" -ForegroundColor Red }
}
```

---

## 🛑 Dừng Hệ Thống

```powershell
# Dừng Java processes
Get-Process -Name java | Stop-Process -Force

# Dừng Docker
docker-compose down
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| API Gateway | http://localhost:8080 |
| User Service | http://localhost:8081 |
| Account Service | http://localhost:8082 |
| Transaction Service | http://localhost:8083 |
| Admin Service | http://localhost:8084 |
| Log Service | http://localhost:8085 |
| Notification Service | http://localhost:8086 |
| Frontend | http://localhost:3000 |
| Admin Panel | http://localhost:3001 |

---

## 👤 Tài Khoản Test

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@minibank.com | Admin@123 |
| Customer | test.user@example.com | TestPassword#123 |
| Staff | staff@minibank.com | Staff@123 |
| Counter Admin | counter.admin@minibank.com | CounterAdmin@123 |

---

## ❌ Lỗi Thường Gặp

### Port đã được sử dụng
```powershell
Get-Process -Name java | Stop-Process -Force
```

### Database không kết nối được
```powershell
docker-compose down
docker-compose up -d
Start-Sleep -Seconds 15
```

### API Gateway lỗi dependency
→ Xem Bước 2 ở trên

---

## 📚 Tài Liệu Chi Tiết

- **Khởi động backend**: [documentation/HUONG_DAN_KHOI_DONG_BACKEND.md](documentation/HUONG_DAN_KHOI_DONG_BACKEND.md) ⭐
- **Hướng dẫn đầy đủ**: [documentation/HUONG_DAN_CHAY_TUNG_BUOC.md](documentation/HUONG_DAN_CHAY_TUNG_BUOC.md)
- **Cấu trúc project**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Báo cáo khởi động**: [STARTUP_REPORT.md](STARTUP_REPORT.md)

---

**Cập nhật**: 2025-12-20
