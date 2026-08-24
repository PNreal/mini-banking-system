# Admin Service

Admin Service cho hệ thống Mini Banking System, cung cấp các chức năng quản trị hệ thống.

## Tính năng

- **User Management**: Xem danh sách users, lock/unlock, freeze/unfreeze user accounts
- **System Reports**: Xem báo cáo hệ thống (tổng số users, transactions, v.v.)
- **Admin Logging**: Ghi log tất cả các hành động admin
- **Kafka Integration**: Gửi ADMIN_ACTION events qua Kafka

## Tech Stack

- Java 17
- Spring Boot 4.0.0
- Spring Data JPA
- PostgreSQL
- Apache Kafka
- RestTemplate (cho service-to-service communication)

## API Endpoints

### Admin Endpoints (Yêu cầu Admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | Lấy danh sách tất cả users |
| PATCH | `/api/v1/admin/lock/{userId}` | Khóa user và khóa account tương ứng |
| PATCH | `/api/v1/admin/unlock/{userId}` | Mở khóa user và account tương ứng |
| PATCH | `/api/v1/admin/freeze/{userId}` | Đóng băng tài khoản user |
| PATCH | `/api/v1/admin/unfreeze/{userId}` | Mở đóng băng tài khoản user |
| DELETE | `/api/v1/admin/users/{userId}` | Xóa user (soft delete) |
| GET | `/api/v1/admin/dashboard` | Lấy dữ liệu dashboard |
| GET | `/api/v1/admin/transactions` | Lấy lịch sử giao dịch tất cả users |
| GET | `/api/v1/admin/logs` | Lấy logs admin actions |

## Cấu hình Docker

Service được cấu hình trong `docker-compose.yml` với các cổng:
- Admin Service: `http://localhost:8084`
- PostgreSQL (external): `5437`
- Kafka: `9092` (external), `29092` (internal)

## 🔗 Tích hợp với các service khác

- **User Service**: Xác thực admin và thông tin người dùng
- **Account Service**: Khóa/mở khóa tài khoản khi admin lock/unlock user
- **Transaction Service**: Lấy lịch sử giao dịch để hiển thị trong admin panel
- **Log Service**: Ghi log admin actions

## Database Schema

### Bảng `admin_logs`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Primary Key, Auto Increment |
| admin_id | UUID | ID của admin thực hiện hành động |
| action | VARCHAR(100) | Hành động thực hiện |
| target_user_id | UUID | ID của user bị tác động |
| details | TEXT | Chi tiết hành động |
| timestamp | TIMESTAMP | Thời điểm thực hiện |

## Events Kafka

Admin Service gửi các events sau:

| Event | Description |
|-------|-------------|
| ADMIN_LOCKED_USER | Khi admin khóa user |
| ADMIN_UNLOCKED_USER | Khi admin mở khóa user |
| ADMIN_FROZEN_USER | Khi admin đóng băng user |
| ADMIN_UNFROZEN_USER | Khi admin mở đóng băng user |
| ADMIN_DELETED_USER | Khi admin xóa user |

## Dashboard API

Admin Service cung cấp API endpoint cho dashboard:

```
GET /api/v1/admin/dashboard
```

Response:
```json
{
  "totalUsers": 1250,
  "activeUsers": 1100,
  "lockedUsers": 50,
  "frozenUsers": 100,
  "totalTransactions": 5000,
  "transactionsToday": 250,
  "totalAmount": 5000000000,
  "topUsers": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "totalTransactions": 150
    }
  ]
}
```