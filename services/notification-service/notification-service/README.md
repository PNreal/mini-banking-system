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

### Notification Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/notifications` | Tạo thông báo mới | Yes |
| GET | `/api/v1/notifications/{notificationId}` | Lấy thông tin thông báo | Yes |
| GET | `/api/v1/notifications/user/{userId}` | Lấy danh sách thông báo của user (paginated) | Yes |
| GET | `/api/v1/notifications/user/{userId}/unread` | Lấy thông báo chưa đọc | Yes |
| GET | `/api/v1/notifications/user/{userId}/type/{type}` | Lấy thông báo theo loại | Yes |
| PATCH | `/api/v1/notifications/{notificationId}/read` | Đánh dấu đã đọc | Yes |
| PATCH | `/api/v1/notifications/user/{userId}/read-all` | Đánh dấu tất cả đã đọc | Yes |
| POST | `/api/v1/notifications/{notificationId}/resend` | Gửi lại thông báo | Yes |
| GET | `/api/v1/notifications/user/{userId}/stats` | Lấy thống kê thông báo | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check endpoint |
| GET | `/actuator/health` | Spring Boot Actuator health |

## Notification Types

- `TRANSACTION_SUCCESS`: Giao dịch thành công
- `TRANSACTION_FAILED`: Giao dịch thất bại
- `ACCOUNT_CREATED`: Tài khoản được tạo
- `ACCOUNT_LOCKED`: Tài khoản bị khóa
- `ACCOUNT_UNLOCKED`: Tài khoản được mở khóa
- `ACCOUNT_FROZEN`: Tài khoản bị đóng băng
- `ACCOUNT_UNFROZEN`: Tài khoản được gỡ đóng băng
- `BALANCE_LOW`: Số dư thấp
- `PAYMENT_DUE`: Thanh toán đến hạn
- `SECURITY_ALERT`: Cảnh báo bảo mật
- `SYSTEM_UPDATE`: Cập nhật hệ thống
- `PROMOTIONAL`: Khuyến mãi

## Notification Channels

- `EMAIL`: Gửi qua email
- `SMS`: Gửi qua SMS
- `PUSH`: Push notification
- `IN_APP`: Thông báo trong ứng dụng

## Notification Status

- `PENDING`: Đang chờ gửi
- `SENT`: Đã gửi
- `DELIVERED`: Đã giao
- `FAILED`: Gửi thất bại
- `READ`: Đã đọc

## Request/Response Examples

### Create Notification

**Request:**
```json
POST /api/v1/notifications
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "TRANSACTION_SUCCESS",
  "title": "Transaction Completed",
  "message": "Your transaction of $100.00 has been completed successfully.",
  "channel": "EMAIL",
  "recipientEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notificationId": "456e7890-e89b-12d3-a456-426614174001",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "type": "TRANSACTION_SUCCESS",
    "title": "Transaction Completed",
    "message": "Your transaction of $100.00 has been completed successfully.",
    "recipientEmail": "user@example.com",
    "status": "SENT",
    "channel": "EMAIL",
    "sentAt": "2024-12-04T10:00:00",
    "createdAt": "2024-12-04T10:00:00"
  }
}
```

### Get Notification Stats

**Request:**
```json
GET /api/v1/notifications/user/{userId}/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalNotifications": 50,
    "unreadCount": 5,
    "readCount": 40,
    "sentCount": 48,
    "failedCount": 2
  }
}
```

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

## Cấu hình

### Database

```properties
spring.datasource.url=jdbc:postgresql://localhost:5436/notification_db
spring.datasource.username=notification_user
spring.datasource.password=notification_password
```

### Mail Configuration

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-password
```

### Server

```properties
server.port=8086
```

## Cấu trúc Project

```
notification-service/
├── src/
│   ├── main/
│   │   ├── java/com/minibank/notificationservice/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── exception/       # Exception handlers
│   │   │   ├── repository/      # JPA repositories
│   │   │   └── service/         # Business logic
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## Chạy Service

### Local Development

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
```

Service sẽ chạy trên port **8086**.

### Docker

```bash
# Build and run
docker-compose up -d --build

# View logs
docker logs notification-service -f

# Stop
docker-compose down
```

## Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=NotificationServiceTest
```

## Kafka Integration

Service tự động lắng nghe các Kafka topics sau:
- `TRANSACTION_COMPLETED`: Tạo notification khi transaction hoàn thành
- `ACCOUNT_EVENT`: Tạo notification cho các sự kiện account (created, locked, frozen, etc.)
- `ADMIN_ACTION`: Tạo security alert khi có admin action

## Async Processing

Notifications được gửi bất đồng bộ để không block API response. Sử dụng ThreadPoolTaskExecutor với:
- Core pool size: 5 threads
- Max pool size: 10 threads
- Queue capacity: 100

## Scheduled Retry

Service tự động retry các notifications thất bại mỗi 5 phút. Chỉ retry các notifications ở trạng thái PENDING hoặc FAILED.

## Email Templates

Email được gửi với HTML template đẹp mắt, bao gồm:
- Header với branding
- Formatted content
- Footer với disclaimer

## WebSocket Support (Real-time Notifications)

Service hỗ trợ WebSocket để gửi real-time notifications:

- **Endpoint:** `ws://localhost:8086/ws/notifications`
- **Protocol:** STOMP over WebSocket với SockJS fallback
- **Authentication:** JWT token qua query parameter hoặc Authorization header
- **Channels:**
  - `/topic/transactions/{userId}` - Transaction notifications
  - `/topic/account-status/{userId}` - Account status changes
  - `/topic/security/{userId}` - Security alerts
  - `/topic/system` - System broadcasts

Xem chi tiết trong [WEBSOCKET_IMPLEMENTATION.md](./WEBSOCKET_IMPLEMENTATION.md)

## Lưu ý

- Service cần PostgreSQL database đang chạy
- Service cần Kafka broker đang chạy để nhận events
- Email configuration cần được cấu hình đúng để gửi email (MAIL_USERNAME, MAIL_PASSWORD)
- SMS và Push Notification hiện tại là mock implementation - cần tích hợp với provider thực tế (Twilio, AWS SNS, FCM, APNS)
- WebSocket yêu cầu JWT token để authenticate (cấu hình qua `jwt.secret`)
- Notification operations yêu cầu authentication qua API Gateway
- Service-to-service communication sử dụng header `X-Internal-Secret`

