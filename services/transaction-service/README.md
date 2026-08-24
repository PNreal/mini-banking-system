# Transaction Service - MiniBank System

Transaction Service chịu trách nhiệm xử lý **giao dịch tài chính** cho hệ thống Mini Banking.

## Chức năng chính

- Nạp tiền vào tài khoản.
- Rút tiền khỏi tài khoản.
- Chuyển khoản giữa 2 tài khoản.
- Lưu lịch sử giao dịch và trả về cho frontend.
- Phát sự kiện `TRANSACTION_COMPLETED` qua Kafka để các service khác (Log, Notification, ...) sử dụng.

## API Endpoints

`Base path: /api/v1/transactions`

| Method | Endpoint         | Mô tả                          |
|--------|------------------|--------------------------------|
| POST   | `/deposit`       | Nạp tiền vào tài khoản        |
| POST   | `/withdraw`      | Rút tiền khỏi tài khoản       |
| POST   | `/transfer`      | Chuyển khoản giữa 2 tài khoản |
| GET    | `/me`            | Lấy lịch sử giao dịch của user |

Một số endpoint yêu cầu header:

```http
X-User-Id: <UUID của user>
```

Xem chi tiết trong `TransactionController`.

## Cấu hình Docker

Service được cấu hình trong `docker-compose.yml` với các cổng:
- Transaction Service: `http://localhost:8083`
- PostgreSQL (external): `5436`
- Kafka: `9092` (external), `29092` (internal)

## 🔗 Tích hợp với các service khác

- **Account Service**: Gọi để cập nhật số dư tài khoản
- **User Service**: Xác thực người dùng trước khi thực hiện giao dịch
- **Log Service**: Ghi log tất cả các giao dịch
- **Notification Service**: Gửi thông báo khi giao dịch hoàn thành

## Database Schema

Bảng chính: `transactions`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Primary Key, Auto Increment |
| user_id | UUID | ID của người dùng thực hiện giao dịch |
| from_account_id | UUID | Tài khoản nguồn (cho chuyển khoản) |
| to_account_id | UUID | Tài khoản đích (cho chuyển khoản) |
| amount | DECIMAL(15,2) | Số tiền giao dịch |
| transaction_type | VARCHAR(20) | Loại giao dịch (DEPOSIT, WITHDRAW, TRANSFER) |
| status | VARCHAR(20) | Trạng thái (PENDING, COMPLETED, FAILED) |
| description | TEXT | Mô tả giao dịch |
| created_at | TIMESTAMP | Thời điểm tạo |
| updated_at | TIMESTAMP | Thời điểm cập nhật |

## Events Kafka

Transaction Service gửi các events sau:

| Event | Description |
|-------|-------------|
| TRANSACTION_COMPLETED | Khi giao dịch hoàn thành thành công |
| TRANSACTION_FAILED | Khi giao dịch thất bại |
| TRANSACTION_PENDING | Khi giao dịch đang chờ xử lý |

## Quản lý Quầy Giao Dịch

Transaction Service cũng quản lý hệ thống quầy giao dịch:

### Bảng `counters`
- id: ID quầy
- name: Tên quầy
- location: Địa điểm quầy
- status: Trạng thái (ACTIVE, INACTIVE)
- admin_user_id: ID admin quản lý quầy

### Bảng `counter_staff`
- id: ID nhân viên
- counter_id: ID quầy làm việc
- staff_code: Mã nhân viên
- staff_name: Tên nhân viên
- is_active: Trạng thái làm việc

### API cho quản lý quầy
- `POST /api/v1/counters` - Tạo quầy mới
- `GET /api/v1/counters` - Lấy danh sách quầy
- `PUT /api/v1/counters/{id}` - Cập nhật thông tin quầy
- `DELETE /api/v1/counters/{id}` - Xóa quầy
- `POST /api/v1/counters/{id}/staff` - Thêm nhân viên vào quầy
- `GET /api/v1/counters/{id}/staff` - Lấy danh sách nhân viên quầy