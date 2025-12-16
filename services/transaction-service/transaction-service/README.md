## Transaction Service

Transaction Service của hệ thống **Mini Banking System** chịu trách nhiệm xử lý:

- **Deposit** – Nạp tiền vào tài khoản
- **Withdraw** – Rút tiền
- **Transfer** – Chuyển tiền giữa hai tài khoản
- **Transaction History** – Lịch sử giao dịch có phân trang & filter

Service này:

- Lưu bản ghi giao dịch vào `transaction_db` (PostgreSQL)
- Gọi **Account Service** qua REST (`/internal/accounts/**`) để kiểm tra & cập nhật số dư
- Gửi sự kiện Kafka `TRANSACTION_COMPLETED` để **Notification Service** và **Log Service** tiêu thụ

### Public API (qua API Gateway)

Base path: `/api/v1/transactions`

- **POST `/deposit`**  
  Header: `X-User-Id` (UUID, được set bởi API Gateway)  
  Body:
  ```json
  { "amount": 100000 }
  ```

- **POST `/withdraw`**  
  Header: `X-User-Id`  
  Body tương tự `deposit`.

- **POST `/transfer`**  
  Header: `X-User-Id`  
  Body:
  ```json
  {
    "toAccountId": "uuid-receiver",
    "amount": 200000
  }
  ```

- **GET `/history`**  
  Header: `X-User-Id`  
  Query params: `page` (1-based), `size`, `type`, `from`, `to` (ISO 8601 `LocalDateTime`).

Tất cả responses tuân theo format chung:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for withdrawal",
    "timestamp": "...",
    "path": "/api/v1/transactions/withdraw"
  }
}
```

### Inter-service Communication

- **Account Service**
  - `GET  /internal/accounts/by-user/{userId}`
  - `GET  /internal/accounts/{accountId}`
  - `PATCH /internal/accounts/{accountId}/update-balance`
  - `POST /internal/accounts/transfer`
  - Header bắt buộc: `X-Internal-Secret`

- **Kafka**
  - Topic: `TRANSACTION_COMPLETED` (`kafka.topics.transaction-completed`)
  - Payload chứa: `transactionId`, `fromAccount`, `toAccount`, `amount`, `type`, `status`, `timestamp`

### Chạy service (local)

```bash
cd services/transaction-service/transaction-service

# Build
mvn clean install

# Run
mvn spring-boot:run
```

Mặc định:

- App port: `8083`
- PostgreSQL: `jdbc:postgresql://localhost:5436/transaction_db`
- Kafka: `localhost:9092`

Các cấu hình chi tiết xem trong `src/main/resources/application.properties`.


