# User Service - MiniBank System

User Service là dịch vụ cốt lõi của hệ thống Mini Banking System, chịu trách nhiệm quản lý định danh, xác thực và thông tin người dùng.

## Tính năng

- **Authentication**: Đăng ký (Register), Đăng nhập (Login), cấp phát JWT Access Token & Refresh Token.
- **Security**: Đổi mật khẩu, Quên mật khẩu (gửi email thật qua SMTP), Tự khóa tài khoản (Self-freeze).
- **Validation**: Kiểm tra dữ liệu đầu vào (Email, Password) chặt chẽ.

## Tech Stack

- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 3.x / 4.x
- **Database:** PostgreSQL (chạy trong Docker container)
- **Security:** Spring Security & JWT
- **Mail:** JavaMailSender (Gmail SMTP)
- **Build Tool:** Maven

## API Endpoints

### Public Endpoints (Ai cũng gọi được)

| Method | Endpoint | Mô tả |
|--------|----------|-------------|
| POST | `/api/users/register` | Đăng ký tài khoản mới |
| POST | `/api/users/login` | Đăng nhập hệ thống (Trả về Token) |
| POST | `/api/users/forgot-password` | Yêu cầu reset mật khẩu (Gửi Email) |

### Protected Endpoints (Cần Token)

| Method | Endpoint | Mô tả |
|--------|----------|-------------|
| GET | `/api/users/profile` | Lấy thông tin user hiện tại |
| PUT | `/api/users/profile` | Cập nhật thông tin user |
| POST | `/api/users/change-password` | Đổi mật khẩu |
| POST | `/api/users/refresh-token` | Cấp Access Token mới từ Refresh Token |
| POST | `/api/users/logout` | Đăng xuất (Blacklist token) |
| POST | `/api/users/verify-email` | Xác thực email |
| POST | `/api/users/resend-verification` | Gửi lại email xác thực |
| POST | `/api/users/self-freeze` | Tự khóa tài khoản |
| POST | `/api/users/reset-password` | Reset mật khẩu (Sau khi quên) |

## Cấu hình Docker

Service được cấu hình trong `docker-compose.yml` với các cổng:
- User Service: `http://localhost:8081`
- PostgreSQL (external): `5434`
- Kafka: `9092` (external), `29092` (internal)

## 🔗 Tích hợp với các service khác

- **Account Service**: User Service gọi để tạo tài khoản mới khi người dùng đăng ký
- **Transaction Service**: Xác thực người dùng trước khi thực hiện giao dịch
- **Notification Service**: Gửi thông báo qua Kafka khi có sự kiện liên quan đến người dùng
- **Log Service**: Ghi log các hoạt động của người dùng

## Database Schema

Bảng chính: `users`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Primary Key, Auto Increment |
| email | VARCHAR(255) | Email đăng nhập (Unique) |
| password | VARCHAR(255) | Mật khẩu đã mã hóa (BCrypt) |
| full_name | VARCHAR(100) | Họ và tên |
| phone_number | VARCHAR(20) | Số điện thoại |
| date_of_birth | DATE | Ngày sinh |
| address | TEXT | Địa chỉ |
| is_email_verified | BOOLEAN | Email đã xác thực chưa |
| is_active | BOOLEAN | Tài khoản còn active không |
| is_locked | BOOLEAN | Tài khoản bị khóa không |
| is_frozen | BOOLEAN | Tài khoản bị đóng băng không |
| role | VARCHAR(20) | Vai trò (USER, ADMIN, STAFF, COUNTER_ADMIN) |
| created_at | TIMESTAMP | Thời điểm tạo |
| updated_at | TIMESTAMP | Thời điểm cập nhật |

## Events Kafka

User Service gửi các events sau:

| Event | Description |
|-------|-------------|
| USER_CREATED | Khi có người dùng mới đăng ký |
| USER_UPDATED | Khi thông tin người dùng thay đổi |
| USER_LOCKED | Khi người dùng bị khóa |
| USER_UNLOCKED | Khi người dùng được mở khóa |
| PASSWORD_CHANGED | Khi người dùng đổi mật khẩu |
| EMAIL_VERIFIED | Khi email được xác thực |