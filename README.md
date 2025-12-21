# Mini Banking System

Hệ thống ngân hàng mini với kiến trúc microservices, chạy hoàn toàn bằng Docker.

## Khởi Động Hệ Thống

### Yêu cầu
- Docker Desktop
- Docker Compose

### Bước 1: Khởi động tất cả dịch vụ
```bash
docker-compose up -d
```

### Bước 2: Kiểm tra trạng thái
```bash
docker-compose ps
```

### Bước 3: Xem logs (nếu cần)
```bash
docker-compose logs -f
```

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

## Dừng Hệ Thống

```bash
docker-compose down
```

## Xử Lý Sự Cố

### Lỗi: Docker không chạy
```bash
# Khởi động lại Docker Desktop
# Sau đó chạy lại:
docker-compose up -d
```

### Reset toàn bộ hệ thống
```bash
docker-compose down -v
docker-compose up -d
```

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
 scripts/                  # Scripts quản lý
 documentation/            # Tài liệu kỹ thuật
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

## Tài Liệu Tham Khảo

- [docker/README.md](docker/README.md) - Hướng dẫn Docker chi tiết
- [scripts/README.md](scripts/README.md) - Scripts quản lý hệ thống

---

**Phiên bản:** 1.0  
**Cập nhật:** 2025-12-22  
> Java Spring Boot Microservices + React + PostgreSQL + Docker  
> Team 6 members — 2025