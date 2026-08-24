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

- **Customer Web (Khách hàng & Quầy):** http://localhost:3000
- **Admin Panel (Quản trị viên):** http://localhost:3001
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
- **API Gateway** (8080) - Điểm vào chính, xử lý routing, JWT validation và CORS
- **User Service** (8081) - Quản lý người dùng, phân quyền RBAC (Admin, Staff, Customer), và xác minh KYC
- **Core Banking Service** (8082) - Quản lý tài khoản, số dư, nạp/rút/chuyển tiền, và giao dịch tại quầy (Counter)
- **Log Service** (8083) - Ghi nhật ký kiểm toán hệ thống (Audit Log qua Kafka)
- **Notification Service** (8084) - Gửi thông báo đa kênh (Real-time WebSocket & Email)

### Frontend Applications
- **Customer Web** (3000) - Giao diện khách hàng và nhân viên quầy (React)
- **Admin Panel** (3001) - Giao diện quản trị hệ thống (React + Vite)

### Databases & Infrastructure
- PostgreSQL (4 databases liên tục: `user_db:5432`, `banking_db:5433`, `log_db:5434`, `notification_db:5435`)
- Kafka + Zookeeper (Event-driven message broker)

## Cấu Trúc Project

```
mini-banking-system/
├── api-gateway/              # API Gateway service (Port 8080)
├── services/                 # Backend microservices
│   ├── user-service/         # User, KYC & RBAC service (Port 8081)
│   ├── core-banking-service/ # Accounts, Balances, Transactions & Counters (Port 8082)
│   ├── log-service/          # System audit log service (Port 8083)
│   └── notification-service/ # Multi-channel notification service (Port 8084)
├── frontend/                 # Frontend applications
│   ├── customer/             # Customer & Staff React app (Port 3000)
│   └── admin/                # Admin Hub React + Vite app (Port 3001)
├── docker/                   # Docker init scripts & templates
│   ├── init-scripts/
│   └── templates/
├── documentation/            # Tài liệu dự án
├── .github/                  # CI/CD Workflows
└── docker-compose.yml        # Docker compose orchestrator
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