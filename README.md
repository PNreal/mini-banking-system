# Mini Banking System

Hệ thống ngân hàng mini với kiến trúc microservices, bao gồm frontend cho khách hàng và admin panel.

## Khởi Động Nhanh

> ** Quick Reference**: Xem [QUICK_REFERENCE.md](QUICK_REFERENCE.md) để khởi động nhanh

### Phương Pháp Đã Kiểm Chứng (Khuyến nghị)

**Bước 1: Khởi động Docker**
```powershell
docker-compose up -d
Start-Sleep -Seconds 15
```

**Bước 2: Sửa API Gateway (chỉ 1 lần)**

File: `api-gateway/api-gateway/pom.xml` (dòng ~46)

Thay `spring-cloud-starter-gateway-server-webmvc` → `spring-cloud-starter-gateway-mvc`

**Bước 3: Khởi động Backend (7 terminals)**

Mở 7 terminals riêng biệt và chạy từng service:

```powershell
# Terminal 1: User Service
cd services\user-service\user-service
.\mvnw.cmd spring-boot:run

# Terminal 2: Account Service
cd services\account-service\account-service
.\mvnw.cmd spring-boot:run

# Terminal 3: Transaction Service
cd services\transaction-service\transaction-service
.\mvnw.cmd spring-boot:run

# Terminal 4: Admin Service
cd services\admin-service\admin-service
.\mvnw.cmd spring-boot:run

# Terminal 5: Log Service
cd services\log-service\log-service
.\mvnw.cmd spring-boot:run

# Terminal 6: Notification Service
cd services\notification-service\notification-service
.\mvnw.cmd spring-boot:run

# Terminal 7: API Gateway
cd api-gateway\api-gateway
.\mvnw.cmd spring-boot:run
```

**Xem hướng dẫn chi tiết:** 
- [HUONG_DAN_MO_7_TERMINALS.md](HUONG_DAN_MO_7_TERMINALS.md)  (Trực quan từng bước)
- [documentation/HUONG_DAN_KHOI_DONG_BACKEND.md](documentation/HUONG_DAN_KHOI_DONG_BACKEND.md)  (Chi tiết đầy đủ)

---

## Dừng Ứng Dụng

### Dừng Toàn Bộ (Nhanh)

```powershell
.\scripts\stop-all.ps1
```

Script này sẽ dừng:
-  Tất cả Java processes
-  Node.js processes (Frontend)
-  Docker containers
-  Giải phóng tất cả ports

## Yêu Cầu Hệ Thống

- Java 17+
- Node.js 16+
- Docker Desktop
- Maven (hoặc dùng mvnw có sẵn)

## Truy Cập Ứng Dụng

- **Customer Web:** http://localhost:3002
- **Admin Panel:** http://localhost:3001
- **API Gateway:** http://localhost:8080

## Tài Khoản Test

| Loại | Email | Password |
|------|-------|----------|
| Admin | admin@minibank.com | Admin@123 |
| Customer | test.user@example.com | TestPassword#123 |
| Staff | staff@minibank.com | Staff@123 |
| Counter Admin | counter.admin@minibank.com | CounterAdmin@123 |

## Tài Liệu

### Hướng Dẫn Chính
- [HUONG_DAN_MO_7_TERMINALS.md](HUONG_DAN_MO_7_TERMINALS.md)  **TRỰC QUAN** - Hướng dẫn mở 7 terminals từng bước
- [documentation/HUONG_DAN_KHOI_DONG_BACKEND.md](documentation/HUONG_DAN_KHOI_DONG_BACKEND.md)  - Khởi động backend (đã kiểm chứng)
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Tra cứu nhanh
- [documentation/HUONG_DAN_CHAY_TUNG_BUOC.md](documentation/HUONG_DAN_CHAY_TUNG_BUOC.md) - Hướng dẫn chi tiết từng bước
- [documentation/README_DOCKER.md](documentation/README_DOCKER.md) - Hướng dẫn Docker và Port Allocation

### Tài Liệu Kỹ Thuật
- [documentation/DATABASE_OVERVIEW.md](documentation/DATABASE_OVERVIEW.md) - Tổng quan database
- [documentation/LOGIC_LUONG_HOAT_DONG.md](documentation/LOGIC_LUONG_HOAT_DONG.md) - Logic luồng hoạt động
- [documentation/COUNTER_IMPLEMENTATION_SUMMARY.md](documentation/COUNTER_IMPLEMENTATION_SUMMARY.md) - Quản lý quầy giao dịch
- [documentation/USER_MANAGEMENT_IMPLEMENTATION.md](documentation/USER_MANAGEMENT_IMPLEMENTATION.md) - Quản lý người dùng
- [documentation/NOTIFICATION_SYSTEM_OVERVIEW.md](documentation/NOTIFICATION_SYSTEM_OVERVIEW.md) - Hệ thống thông báo

### Scripts
- [scripts/README.md](scripts/README.md) - Hướng dẫn sử dụng scripts

## Kiến Trúc

### Backend Services (Microservices)
- **API Gateway** (8080) - Điểm vào chính, xử lý routing và CORS
- **User Service** (8081) - Quản lý người dùng và authentication
- **Account Service** (8082) - Quản lý tài khoản ngân hàng
- **Transaction Service** (8083) - Xử lý giao dịch
- **Admin Service** (8084) - Quản lý admin
- **Log Service** (8085) - Ghi log hệ thống
- **Notification Service** (8086) - Gửi thông báo

### Frontend Applications
- **Customer Web** (3002) - Giao diện khách hàng (React)
- **Admin Panel** (3001) - Giao diện quản trị (React + Vite)

### Databases & Infrastructure
- PostgreSQL (6 databases riêng cho mỗi service)
- Kafka + Zookeeper (Message queue)

## Scripts Hữu Ích

| Script | Mô tả |
|--------|-------|
| `scripts/stop-all.ps1` | Dừng toàn bộ hệ thống (Java + Node + Docker) |
| `scripts/check-services.ps1` | Kiểm tra trạng thái services |
| `scripts/run-tests.ps1` | Chạy unit tests cho services |

**Lưu ý**: Backend services khởi động thủ công (7 terminals). Xem [HUONG_DAN_MO_7_TERMINALS.md](HUONG_DAN_MO_7_TERMINALS.md)

Xem chi tiết: [scripts/README.md](scripts/README.md)

## Xử Lý Sự Cố

### Lỗi: Port đã được sử dụng
```powershell
# Tìm process đang dùng port
netstat -ano | findstr "8080"

# Dừng process theo PID
Stop-Process -Id <PID> -Force

# Hoặc dừng tất cả
.\scripts\stop-all.ps1
```

### Lỗi: Docker không chạy
```powershell
# Khởi động Docker Desktop
# Sau đó chạy lại:
docker-compose up -d
```

### Lỗi: Database connection failed
```powershell
# Khởi động lại databases
docker-compose down
docker-compose up -d
Start-Sleep -Seconds 15
.\start-services.ps1
```

### Lỗi: Service không khởi động
```powershell
# Khởi động thủ công để xem logs
cd services\<service-name>\<service-name>
mvnw.cmd spring-boot:run
```

### Reset toàn bộ hệ thống
```powershell
.\scripts\stop-all.ps1
docker-compose down -v
docker-compose up -d
Start-Sleep -Seconds 15
.\scripts\start-services.ps1
```

Xem thêm chi tiết trong [documentation/HUONG_DAN_CHAY_TUNG_BUOC.md](documentation/HUONG_DAN_CHAY_TUNG_BUOC.md)

## Monitoring

Kiểm tra logs của từng service trong terminal window tương ứng.

Kiểm tra Docker containers:
```powershell
docker ps
docker logs <container_name>
```

## Đóng Góp

Xem [CHANGELOG.md](CHANGELOG.md) để biết lịch sử thay đổi.

## License

[LICENSE](LICENSE)

---

**Phiên bản:** 1.0  
**Cập nhật:** 2025-12-20
> Java Spring Boot Microservices + React + PostgreSQL + Docker  
> Team 6 members — 2025

## Cấu Trúc Project

```
mini-banking-system/
 api-gateway/              # API Gateway service
 services/                 # Backend microservices
    user-service/
    account-service/
    transaction-service/
    admin-service/
    log-service/
    notification-service/
 frontend/                 # Customer/Staff UI (React)
 banking-admin-hub-main/   # Admin Panel (React + Vite)
 docker/                   # Docker configs & init scripts
 scripts/                  # PowerShell scripts
    stop-all.ps1
    check-services.ps1
    run-tests.ps1
 documentation/            # Tài liệu kỹ thuật
    HUONG_DAN_KHOI_DONG_BACKEND.md
    HUONG_DAN_CHAY_TUNG_BUOC.md
    DATABASE_OVERVIEW.md
    ...
 docker-compose.yml        # Docker Compose config
 README.md                 # File này
```

## Features

### User Features
- Đăng ký/Đăng nhập
- Nạp tiền (Ví điện tử, Quét mã QR, Nạp tại quầy)
- Rút tiền (Rút tại quầy, Ví điện tử)
- Chuyển khoản
- Xem lịch sử giao dịch
- Quản lý thông tin cá nhân

### Admin Features
- Quản lý người dùng (Khóa/Mở khóa, Đóng băng/Mở đóng băng)
- **Quản lý quầy giao dịch** (Thêm, Sửa, Xóa quầy)
- **Quản lý nhân viên trong quầy** (Thêm, Sửa, Xóa nhân viên - mã số và tên)
- Xem thống kê và báo cáo

### Staff Features
- Xác nhận giao dịch nạp tiền tại quầy
- Xem thông báo về yêu cầu nạp tiền

## Recent Updates

### Quản lý quầy giao dịch và nhân viên (Latest)
- Admin có thể thêm, sửa, xóa quầy giao dịch
- Admin có thể quản lý nhân viên trong từng quầy (mã số nhân viên và tên)
- Giao diện quản lý trực quan với danh sách quầy và nhân viên
- API endpoints đầy đủ cho CRUD operations

Xem chi tiết API tại: `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/API Specification.md`
