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