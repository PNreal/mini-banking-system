# Notification Service

Notification Service cho hệ thống Mini Banking System, quản lý và gửi thông báo cho users.

## Tính năng

- **Notification Management**: Tạo, xem, đánh dấu đã đọc thông báo
- **Multi-Channel Support**: Hỗ trợ Email (HTML), SMS, Push Notification, In-App
- **Notification Types**: Nhiều loại thông báo (Transaction, Account, Security, etc.)
- **Notification Stats**: Thống kê thông báo theo user
- **Resend Failed Notifications**: Gửi lại thông báo thất bại
- **Kafka Integration**: Tự động nhận events từ các services khác và tạo notifications
- **Async Processing**: Gửi notifications bất đồng bộ để tăng performance
- **Scheduled Retry**: Tự động retry các notifications thất bại
- **HTML Email Templates**: Email với HTML formatting đẹp mắt

## Tech Stack

- Java 17
- Spring Boot 4.0.0
- Spring Data JPA
- Spring Mail
- Spring Kafka
- PostgreSQL
- Apache Kafka
- Lombok
- Jackson (JSON processing)
- Maven

## API Endpoints

### User Endpoints (Yêu cầu authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Lấy danh sách thông báo của user |
| GET | `/api/v1/notifications/{id}` | Lấy chi tiết thông báo |
| PATCH | `/api/v1/notifications/{id}/read` | Đánh dấu đã đọc |
| PATCH | `/api/v1/notifications/read-all` | Đánh dấu đã đọc tất cả |
| GET | `/api/v1/notifications/unread-count` | Số lượng thông báo chưa đọc |

### Admin Endpoints (Yêu cầu Admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/notifications` | Lấy tất cả thông báo |
| GET | `/api/v1/admin/notifications/stats` | Thống kê thông báo |
| POST | `/api/v1/admin/notifications/send` | Gửi thông báo thủ công |
| POST | `/api/v1/admin/notifications/resend-failed` | Gửi lại thông báo thất bại |

## Cấu hình Docker

Service được cấu hình trong `docker-compose.yml` với các cổng:
- Notification Service: `http://localhost:8086`
- PostgreSQL (external): `5439`
- Kafka: `9092` (external), `29092` (internal)

## 🔗 Tích hợp với các service khác

Notification Service nhận events từ các service khác qua Kafka:

- **User Service**: Events về đăng ký, đăng nhập, thay đổi thông tin
- **Account Service**: Events về tạo tài khoản, cập nhật số dư
- **Transaction Service**: Events về giao dịch thành công/thất bại
- **Admin Service**: Events về các hành động admin liên quan đến user

## Database Schema

### Bảng `notifications`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Primary Key, Auto Increment |
| user_id | UUID | ID của người dùng nhận thông báo |
| type | VARCHAR(50) | Loại thông báo |
| title | VARCHAR(200) | Tiêu đề thông báo |
| message | TEXT | Nội dung thông báo |
| channel | VARCHAR(20) | Kênh gửi (EMAIL, SMS, PUSH, IN_APP) |
| status | VARCHAR(20) | Trạng thái (PENDING, SENT, FAILED) |
| is_read | BOOLEAN | Đã đọc chưa |
| created_at | TIMESTAMP | Thời điểm tạo |
| sent_at | TIMESTAMP | Thời điểm gửi |
| retry_count | INT | Số lần retry |

## Notification Types

| Type | Description |
|------|-------------|
| TRANSACTION_SUCCESS | Giao dịch thành công |
| TRANSACTION_FAILED | Giao dịch thất bại |
| ACCOUNT_CREATED | Tạo tài khoản mới |
| ACCOUNT_LOCKED | Tài khoản bị khóa |
| ACCOUNT_UNLOCKED | Tài khoản được mở khóa |
| LOGIN_SUCCESS | Đăng nhập thành công |
| LOGIN_FAILED | Đăng nhập thất bại |
| PASSWORD_CHANGED | Đổi mật khẩu |
| ADMIN_ACTION | Admin thực hiện hành động |
| SYSTEM_MAINTENANCE | Hệ thống bảo trì |
| PROMOTION | Khuyến mãi |

## Kafka Events

Notification Service lắng nghe các topics sau:

| Topic | Service | Description |
|-------|---------|-------------|
| USER_EVENTS | User Service | Events về hoạt động người dùng |
| ACCOUNT_EVENTS | Account Service | Events về tài khoản |
| TRANSACTION_EVENTS | Transaction Service | Events về giao dịch |
| ADMIN_EVENTS | Admin Service | Events về hành động admin |

## API Examples

### Lấy danh sách thông báo

```
GET /api/v1/notifications?page=0&size=20&status=UNREAD
```

Response:
```json
{
  "content": [
    {
      "id": 1,
      "type": "TRANSACTION_SUCCESS",
      "title": "Giao dịch thành công",
      "message": "Bạn đã chuyển khoản 1,000,000 VND đến tài khoản xxx",
      "channel": "IN_APP",
      "status": "SENT",
      "isRead": false,
      "createdAt": "2023-01-01T10:00:00"
    }
  ],
  "totalElements": 50,
  "totalPages": 3,
  "size": 20,
  "number": 0
}
```

### Gửi thông báo thủ công (Admin)

```
POST /api/v1/admin/notifications/send
```

Request:
```json
{
  "userId": "uuid",
  "type": "SYSTEM_MAINTENANCE",
  "title": "Hệ thống bảo trì",
  "message": "Hệ thống sẽ bảo trì từ 22:00-24:00今晚",
  "channels": ["EMAIL", "IN_APP"]
}
```