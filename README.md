# Mini Banking System

Hệ thống ngân hàng mini với kiến trúc microservices, bao gồm frontend cho khách hàng và admin panel.

## 🚀 Khởi Động Nhanh

### Cách 1: Sử dụng Script Tự Động (Khuyến nghị)

```powershell
# Khởi động toàn bộ hệ thống
.\start-system.ps1

# Sau khi backend services đã khởi động (2-3 phút), khởi động frontend
.\start-frontend.ps1

# Kiểm tra trạng thái
.\check-status.ps1

# Dừng toàn bộ hệ thống
.\stop-system.ps1
```

### Cách 2: Khởi Động Thủ Công

Xem hướng dẫn chi tiết trong [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

## 📋 Yêu Cầu Hệ Thống

- Java 17+
- Node.js 16+
- Docker Desktop
- Maven (hoặc dùng mvnw có sẵn)

## 🌐 Truy Cập Ứng Dụng

- **Customer Web:** http://localhost:3002
- **Admin Panel:** http://localhost:3001
- **API Gateway:** http://localhost:8080

## 👤 Tài Khoản Test

| Loại | Email | Password |
|------|-------|----------|
| Admin | admin@minibank.com | Admin@123 |
| Customer | test.user@example.com | TestPassword#123 |
| Staff | staff@minibank.com | Staff@123 |
| Counter Admin | counter.admin@minibank.com | CounterAdmin@123 |

## 📚 Tài Liệu

- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - Hướng dẫn khởi động chi tiết
- [START_SERVICES.md](START_SERVICES.md) - Hướng dẫn khởi động services
- [README_DOCKER.md](README_DOCKER.md) - Hướng dẫn Docker

## 🏗️ Kiến Trúc

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

## 🛠️ Scripts Hữu Ích

| Script | Mô tả |
|--------|-------|
| `start-system.ps1` | Khởi động toàn bộ hệ thống |
| `start-frontend.ps1` | Khởi động frontend (web + admin) |
| `check-status.ps1` | Kiểm tra trạng thái services |
| `stop-system.ps1` | Dừng toàn bộ hệ thống |

## 🔧 Xử Lý Sự Cố

### Kafka không kết nối
```powershell
docker start kafka
```

### Port đã được sử dụng
```powershell
# Tìm process
netstat -ano | findstr ":8080"

# Kill process
taskkill /PID <PID> /F
```

### Reset toàn bộ
```powershell
.\stop-system.ps1
docker-compose down -v
docker-compose up -d
.\start-system.ps1
```

## 📊 Monitoring

Kiểm tra logs của từng service trong terminal window tương ứng.

Kiểm tra Docker containers:
```powershell
docker ps
docker logs <container_name>
```

## 🤝 Đóng Góp

Xem [CHANGELOG.md](CHANGELOG.md) để biết lịch sử thay đổi.

## 📝 License

[LICENSE](LICENSE)

---

**Phiên bản:** 1.0  
**Cập nhật:** 2025-12-20
> Java Spring Boot Microservices + React + PostgreSQL + Docker  
> Team 6 members — 2025

## Structure
doc/
- backend/
- /log-service
- /user-service
- /account-service
- /transaction-service
- /notification-service
- /admin-service
- frontend/
- docs/
## Tech Stack
- Java Spring Boot 3
- ReactJS
- PostgreSQL
- Docker & Docker Compose (chỉ cho database và infrastructure)

## Cách chạy dự án

> **⚡ Muốn khởi động nhanh?** Xem [QUICK_START.md](./QUICK_START.md) - Hướng dẫn nhanh để khởi động và dừng ứng dụng

> **Lưu ý:** Chỉ database và infrastructure (Kafka, Zookeeper) chạy bằng Docker.  
> Tất cả Java services và Frontend chạy trực tiếp (không dùng Docker).

### 1. Khởi động Databases và Infrastructure (Docker)

```powershell
docker-compose up -d
```

### 2. Khởi động các Java Services (Maven)

```powershell
# Cách 1: Dùng script tự động
.\start-services.ps1

# Cách 2: Khởi động thủ công từng service
cd services\user-service\user-service
.\mvnw.cmd spring-boot:run
# ... tương tự cho các service khác
```

### 3. Khởi động Frontend

```powershell
# Customer/Staff UI
cd frontend
npm start

# Admin UI (mới)
cd ..\banking-admin-hub-main\banking-admin-hub-main
npm i
npm run dev
```

### Dừng ứng dụng

```powershell
# Dừng tất cả Java Services
.\stop-services.ps1

# Dừng Databases và Infrastructure
docker-compose down
```

Xem chi tiết trong:
- [QUICK_START.md](./QUICK_START.md) - Hướng dẫn nhanh (khuyến nghị)
- [START_SERVICES.md](./START_SERVICES.md) - Hướng dẫn chi tiết

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
