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

## Cấu hình mặc định

`src/main/resources/application.properties`:

```properties
spring.application.name=account-service
server.port=8082

spring.datasource.url=jdbc:postgresql://localhost:5432/account_db
spring.datasource.username=account_user
spring.datasource.password=account_password
spring.jpa.hibernate.ddl-auto=update

spring.kafka.bootstrap-servers=localhost:9092
account.kafka.account-event-topic=ACCOUNT_EVENT

internal.secret=internal-secret
```

## Chạy bằng Docker (service riêng lẻ)

Trong thư mục `services/account-service/account-service`:

```powershell
docker-compose up -d --build
```

Các cổng sử dụng (theo `docker-compose.yml` + SERVICE_PORT_ALLOCATION.md):

- Account Service: `http://localhost:8082`
- PostgreSQL (external): `5435`
- Kafka: `9092` (external), `29092` (internal)

## 🏃 Chạy local bằng Maven

Yêu cầu:
- Java 17
- Maven (hoặc dùng `mvnw`)
- PostgreSQL chạy local với database `account_db`

```powershell
cd services\account-service\account-service
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
.\mvnw.cmd spring-boot:run
```

Service sẽ chạy tại: `http://localhost:8082`

## 🔗 Tích hợp với các service khác

- Được gọi bởi:
  - `user-service`: khi tạo user mới, tạo kèm tài khoản.
  - `transaction-service`: khi nạp/rút/chuyển tiền, cập nhật số dư.
- Gửi event qua Kafka topic `ACCOUNT_EVENT` để các service khác (log-service, notification-service, ...) tiêu thụ.


