# Account Service - MiniBank System

Account Service quản lý **tài khoản ngân hàng** cho mỗi user trong hệ thống Mini Banking.

## Chức năng chính

- Tạo tài khoản mới khi user đăng ký.
- Lấy thông tin tài khoản theo `userId` hoặc `accountId`.
- Lấy số dư hiện tại.
- Cập nhật số dư (nạp tiền / rút tiền) dùng nội bộ.
- Xử lý chuyển khoản giữa các tài khoản (dùng từ `transaction-service`).

Tất cả API đều là **internal APIs** (prefix `/internal/accounts`), chỉ gọi từ các service khác qua `internal.secret`.

## API Endpoints (Internal)

`Base path: /internal/accounts`

| Method | Endpoint                     | Mô tả                              |
|--------|-----------------------------|------------------------------------|
| POST   | `/create`                   | Tạo tài khoản mới cho user        |
| GET    | `/by-user/{userId}`         | Lấy tài khoản theo `userId`       |
| GET    | `/{accountId}`              | Lấy tài khoản theo `accountId`    |
| GET    | `/{accountId}/balance`      | Lấy số dư hiện tại                 |
| PATCH  | `/{accountId}/balance`      | Cập nhật số dư (nạp/rút nội bộ)   |
| POST   | `/transfer`                 | Chuyển khoản giữa 2 tài khoản     |

> Xem chi tiết trong `InternalAccountController`.

## Cấu hình Docker

Service được cấu hình trong `docker-compose.yml` với các cổng:
- Account Service: `http://localhost:8082`
- PostgreSQL (external): `5435`
- Kafka: `9092` (external), `29092` (internal)

## 🔗 Tích hợp với các service khác

- Được gọi bởi:
  - `user-service`: khi tạo user mới, tạo kèm tài khoản.
  - `transaction-service`: khi nạp/rút/chuyển tiền, cập nhật số dư.
- Gửi event qua Kafka topic `ACCOUNT_EVENT` để các service khác (log-service, notification-service, ...) tiêu thụ.