# Log Service

Microservice để quản lý và lưu trữ logs của hệ thống banking.

## Tính năng

- Lưu trữ logs từ các services khác qua Kafka
- API để truy vấn logs với pagination và filtering
- Search logs theo user, action, time range
- Statistics về logs
- Health check endpoint

## Tech Stack

- Java 17
- Spring Boot 4.0.0
- PostgreSQL
- Apache Kafka
- Maven

## API Endpoints

### Admin Endpoints

- `GET /api/v1/admin/logs` - Lấy tất cả logs
- `GET /api/v1/admin/logs/search` - Tìm kiếm logs với filters
- `GET /api/v1/admin/logs/statistics` - Lấy thống kê logs

### User Endpoints

- `GET /api/v1/logs/user` - Lấy logs của user hiện tại

## Cấu hình Docker

Service được cấu hình trong `docker-compose.yml` với các cổng:
- Log Service: `http://localhost:8085`
- PostgreSQL (external): `5438`
- Kafka: `9092` (external), `29092` (internal)

## 🔗 Tích hợp với các service khác

Log Service nhận logs từ các service khác qua Kafka:

- **User Service**: Logs về đăng nhập, đăng ký, thay đổi thông tin
- **Account Service**: Logs về tạo tài khoản, cập nhật số dư
- **Transaction Service**: Logs về giao dịch thành công/thất bại
- **Admin Service**: Logs về các hành động admin
- **Notification Service**: Logs về gửi thông báo

## Database Schema

### Bảng `logs`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Primary Key, Auto Increment |
| user_id | UUID | ID của người dùng liên quan |
| service_name | VARCHAR(50) | Tên service tạo log |
| action | VARCHAR(100) | Hành động được ghi lại |
| details | TEXT | Chi tiết hành động (JSON) |
| ip_address | VARCHAR(45) | IP address của client |
| user_agent | VARCHAR(255) | User agent của client |
| timestamp | TIMESTAMP | Thời điểm tạo log |

## Kafka Topics

Log Service lắng nghe các topics sau:

| Topic | Service | Description |
|-------|---------|-------------|
| USER_LOGS | User Service | Logs về hoạt động người dùng |
| ACCOUNT_LOGS | Account Service | Logs về tài khoản |
| TRANSACTION_LOGS | Transaction Service | Logs về giao dịch |
| ADMIN_LOGS | Admin Service | Logs về hành động admin |
| NOTIFICATION_LOGS | Notification Service | Logs về thông báo |

## API Examples

### Lấy logs với phân trang

```
GET /api/v1/admin/logs?page=0&size=20
```

### Tìm kiếm logs

```
GET /api/v1/admin/logs/search?action=LOGIN&startDate=2023-01-01&endDate=2023-01-31
```

### Lấy thống kê logs

```
GET /api/v1/admin/logs/statistics?period=DAILY
```

Response:
```json
{
  "totalLogs": 10000,
  "logsByAction": {
    "LOGIN": 3000,
    "TRANSACTION": 2500,
    "REGISTER": 1500,
    "ADMIN_ACTION": 1000,
    "NOTIFICATION": 2000
  },
  "logsByService": {
    "user-service": 4000,
    "transaction-service": 3000,
    "account-service": 2000,
    "admin-service": 800,
    "notification-service": 200
  },
  "dailyStats": [
    {
      "date": "2023-01-01",
      "count": 500
    }
  ]
}
```