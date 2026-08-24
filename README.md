# 🏦 Mini Banking System

Dự án mô phỏng hệ thống Ngân hàng số (Mini Banking) hỗ trợ đăng ký tài khoản, xác minh danh tính (KYC), nạp/rút/chuyển tiền trực tuyến và xử lý giao dịch tại quầy. Hệ thống được xây dựng bằng Spring Boot, React và chạy trên Docker.

---

## ⚡ Khởi Động Nhanh Hệ Thống (Quick Start)

### 1. Yêu cầu môi trường
* **Docker Desktop / Docker Engine** (đã bật và đang chạy)
* **Docker Compose** (phiên bản v2.x trở lên)

### 2. Khởi chạy toàn bộ hệ thống bằng 1 lệnh duy nhất:
```bash
docker-compose up -d --build
```

### 3. Kiểm tra trạng thái các container:
```bash
docker-compose ps
```

### 4. Xem nhật ký log hoạt động:
```bash
docker-compose logs -f
```

### 5. Dừng hệ thống khi không sử dụng:
```bash
docker-compose down
```

---

## 🌐 Đường Dẫn Truy Cập & Phân Bổ Cổng (Port Allocation)

### 1. Giao diện Người dùng (Frontend)
| Ứng dụng | Cổng Host | Công nghệ | URL Truy cập | Đối tượng sử dụng |
| :--- | :---: | :---: | :--- | :--- |
| **Customer Web** | **`3000`** | React + TS | http://localhost:3000 | Khách hàng & Nhân viên quầy |
| **Admin Hub** | **`3001`** | React + Vite | http://localhost:3001 | Super Admin |

---

### 2. Dịch vụ Backend Microservices (`8080` ➔ `8084` liên tục)
| Dịch vụ | Cổng Host | Vai trò chính |
| :--- | :---: | :--- |
| **`api-gateway`** | **`8080`** | Điểm vào duy nhất (Single Entry), định tuyến API & Header Enrichment |
| **`user-service`** | **`8081`** | Quản lý Người dùng, Xác thực JWT, Xác minh KYC, Phân quyền Admin/Staff |
| **`core-banking-service`** | **`8082`** | Tài khoản, Số dư, Giao dịch (Nạp/Rút/Chuyển), Giao dịch & Quản trị Quầy |
| **`log-service`** | **`8083`** | Ghi nhận Audit Log hệ thống từ Kafka |
| **`notification-service`** | **`8084`** | Gửi thông báo WebSocket Realtime & Email |

---

### 3. Cơ Sở Dữ Liệu PostgreSQL (`5432` ➔ `5435` liên tục)
| Container DB | Cổng Host | Tên Database | Username | Password | Service sở hữu |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `postgres-user` | **`5432`** | `user_db` | `user_user` | `user_password` | `user-service` |
| `postgres-banking` | **`5433`** | `banking_db` | `banking_user` | `banking_password` | `core-banking-service` |
| `postgres-log` | **`5434`** | `log_db` | `log_user` | `log_password` | `log-service` |
| `postgres-notification` | **`5435`** | `notification_db` | `notification_user` | `notification_password` | `notification-service` |

---

### 4. Message Broker (Kafka & Zookeeper)
* **Zookeeper:** `localhost:2181`
* **Apache Kafka Broker:** `localhost:9092` (Host) / `kafka:29092` (Docker Network)

---

## 🔑 Tài Khoản Test Mặc Định

| Vai trò (Role) | Email Đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@minibank.com` | `Admin@123` | Quản trị toàn bộ User, duyệt KYC, quản lý Quầy |
| **Customer** | `customer@minibank.com` | `Password123@` | Nạp, rút, chuyển khoản, gửi hồ sơ KYC |
| **Staff (Nhân viên)** | `staff@minibank.com` | `Staff@123` | Xác nhận và xử lý nạp/rút tiền tại quầy |
| **Counter Admin** | `counter.admin@minibank.com` | `CounterAdmin@123` | Quản lý nhân sự tại quầy giao dịch |

---

## 🏗️ Cấu Trúc Mã Nguồn (Project Structure)

```text
mini-banking-system/
├── api-gateway/              # API Gateway điều phối routing (Port 8080)
├── services/                 # Backend Microservices (Spring Boot 3.3, Java 17)
│   ├── user-service/         # IAM, KYC & RBAC Service (Port 8081 - DB: 5432)
│   ├── core-banking-service/ # Accounts, Balances, Transactions & Counters (Port 8082 - DB: 5433)
│   ├── log-service/          # Audit Logging Service (Port 8083 - DB: 5434)
│   └── notification-service/ # Realtime WebSocket & Email Service (Port 8084 - DB: 5435)
├── frontend/                 # Giao diện Web
│   ├── customer/             # Web khách hàng & nhân viên quầy (Port 3000)
│   └── admin/                # Web Super Admin Dashboard (Port 3001)
├── docker/                   # Docker scripts & templates
│   ├── init-scripts/         # Các file SQL tự động seed DB
│   └── templates/            # Template cấu hình mẫu
├── documentation/            # Tài liệu kỹ thuật chi tiết
├── .github/workflows/        # CI/CD Pipeline (GitHub Actions)
└── docker-compose.yml        # File điều phối toàn bộ hệ thống
```

---

## 💻 Hướng Dẫn Dành Cho Developer (Chạy và Test riêng từng Service)

Nếu bạn muốn code và debug riêng 1 service (ví dụ `core-banking-service`) bằng IDE:

1. **Bật Database & Kafka phụ thuộc qua Docker:**
   ```bash
   docker-compose up -d postgres-banking zookeeper kafka
   ```
2. **Chạy service bằng lệnh Maven hoặc click Run trong IDE:**
   ```bash
   mvn spring-boot:run -f services/core-banking-service/pom.xml
   ```
3. **Chạy toàn bộ Unit Test của một service:**
   ```bash
   mvn test -f services/user-service/pom.xml
   ```

---

## 🛠️ Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### 1. Muốn xóa sạch dữ liệu và khởi động lại từ đầu:
```bash
docker-compose down -v
docker-compose up -d --build
```

### 2. Trùng cổng (Port Conflict):
* Đảm bảo trên máy tính của bạn không có dịch vụ PostgreSQL cục bộ nào đang chiếm cổng `5432` hoặc `8080`.
* Nếu bị trùng, hãy tắt PostgreSQL cục bộ (`sudo systemctl stop postgresql`) trước khi chạy Docker.