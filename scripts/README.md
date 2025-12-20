# Scripts - Các Script Quản Lý Hệ Thống

Thư mục này chứa các PowerShell scripts để quản lý Mini Banking System.

## Danh Sách Scripts

### Dừng

#### `stop-all.ps1`
**Mục đích**: Dừng toàn bộ hệ thống (Java services + Frontend + Docker containers)

**Cách dùng**:
```powershell
.\scripts\stop-all.ps1
```

**Chức năng**:
- Dừng tất cả Java processes
- Dừng tất cả Node.js processes (Frontend)
- Dừng Docker containers
- Giải phóng tất cả ports
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
- Số lượng Java processes đang chạy
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
# 1. Khởi động databases
docker-compose up -d

# 2. Đợi 10-15 giây
Start-Sleep -Seconds 15

# 3. Khởi động backend thủ công (mở 7 terminals)
# Xem hướng dẫn chi tiết: HUONG_DAN_MO_7_TERMINALS.md

# 4. Khởi động frontend (terminal mới)
cd frontend
npm start
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

# Khởi động lại
.\scripts\stop-all.ps1
docker-compose up -d
Start-Sleep -Seconds 15
# Sau đó khởi động thủ công 7 services
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
- Cần quyền Administrator để kill processes
- Logs của services sẽ hiển thị trong terminal windows riêng

---

## Hỗ Trợ

Nếu gặp vấn đề:
1. Chạy `.\scripts\check-services.ps1` để kiểm tra trạng thái
2. Xem logs trong terminal windows của services
3. Kiểm tra Docker containers: `docker ps`
4. Tham khảo tài liệu chi tiết trong thư mục `documentation/`
