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

## Cấu hình mặc định

`src/main/resources/application.properties`:

```properties
spring.application.name=transaction-service
server.port=8083

spring.datasource.url=jdbc:postgresql://localhost:5432/transaction_db
spring.datasource.username=transaction_user
spring.datasource.password=transaction_password
spring.jpa.hibernate.ddl-auto=update

spring.kafka.bootstrap-servers=localhost:9092
transaction.kafka.completed-topic=TRANSACTION_COMPLETED

services.account-service.url=http://localhost:8082
services.internal-secret=internal-secret
```

## 🐳 Chạy bằng Docker (service riêng lẻ)

Trong thư mục `services/transaction-service/transaction-service`:

```powershell
docker-compose up -d --build
```

Các cổng sử dụng (theo `docker-compose.yml` + SERVICE_PORT_ALLOCATION.md):

- Transaction Service: `http://localhost:8083`
- PostgreSQL (external): `5436`
- Kafka: `9094` (external), `29094` (internal)

## 🏃 Chạy local bằng Maven

Yêu cầu:
- Java 17
- Maven (hoặc dùng `mvnw`)
- PostgreSQL chạy local với database `transaction_db`

```powershell
cd services\transaction-service\transaction-service
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
.\mvnw.cmd spring-boot:run
```

Service sẽ chạy tại: `http://localhost:8083`

## 🔗 Tích hợp với các service khác

- Gọi tới:
  - `account-service`: kiểm tra và cập nhật số dư tài khoản.
- Gửi event Kafka:
  - Topic `TRANSACTION_COMPLETED` để:
    - `log-service` ghi log giao dịch.
    - `notification-service` gửi thông báo cho user.


