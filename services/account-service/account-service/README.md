# Account Service

Account Service cho hệ thống Mini Banking System, quản lý tài khoản ngân hàng của users.

## Tính năng

- **Account Management**: Tạo, xem, đóng tài khoản
- **Balance Management**: Cập nhật số dư (deposit, withdrawal, transfer)
- **Account Status**: Lock/unlock, freeze/unfreeze tài khoản
- **Account Types**: Hỗ trợ nhiều loại tài khoản (Savings, Checking, Current, Fixed Deposit)
- **Multi-Currency**: Hỗ trợ nhiều loại tiền tệ

## Tech Stack

- Java 17
- Spring Boot 4.0.0
- Spring Data JPA
- PostgreSQL
- Lombok
- Maven

## API Endpoints

### Account Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/account` | Tạo tài khoản mới | Yes |
| GET | `/api/v1/account/{accountId}` | Lấy thông tin tài khoản theo ID | Yes |
| GET | `/api/v1/account/number/{accountNumber}` | Lấy thông tin tài khoản theo số tài khoản | Yes |
| GET | `/api/v1/account/user/{userId}` | Lấy danh sách tài khoản của user | Yes |
| GET | `/api/v1/account/user/{userId}/active` | Lấy danh sách tài khoản active của user | Yes |
| PATCH | `/api/v1/account/{accountId}/close` | Đóng tài khoản | Yes |

### Account Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/api/v1/account/balance` | Cập nhật số dư (deposit/withdrawal/transfer) | Yes |
| PATCH | `/api/v1/account/{accountId}/lock` | Khóa tài khoản | Yes (Admin) |
| PATCH | `/api/v1/account/{accountId}/unlock` | Mở khóa tài khoản | Yes (Admin) |
| PATCH | `/api/v1/account/{accountId}/freeze` | Đóng băng tài khoản | Yes (Admin) |
| PATCH | `/api/v1/account/{accountId}/unfreeze` | Gỡ đóng băng tài khoản | Yes (Admin) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check endpoint |
| GET | `/actuator/health` | Spring Boot Actuator health |

## Request/Response Examples

### Create Account

**Request:**
```json
POST /api/v1/account
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "accountType": "SAVINGS",
  "initialBalance": 1000.00,
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountId": "456e7890-e89b-12d3-a456-426614174001",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "accountNumber": "2024120412345678",
    "accountType": "SAVINGS",
    "balance": 1000.00,
    "currency": "USD",
    "status": "ACTIVE",
    "isLocked": false,
    "isFrozen": false,
    "createdAt": "2024-12-04T10:00:00",
    "updatedAt": "2024-12-04T10:00:00"
  }
}
```

### Update Balance

**Request:**
```json
PUT /api/v1/account/balance
{
  "accountId": "456e7890-e89b-12d3-a456-426614174001",
  "amount": 500.00,
  "transactionType": "DEPOSIT"
}
```

**Transaction Types:**
- `DEPOSIT`: Nạp tiền vào tài khoản
- `WITHDRAWAL`: Rút tiền từ tài khoản
- `TRANSFER`: Chuyển tiền (trừ số dư)

## Account Types

- `SAVINGS`: Tài khoản tiết kiệm
- `CHECKING`: Tài khoản thanh toán
- `CURRENT`: Tài khoản vãng lai
- `FIXED_DEPOSIT`: Tài khoản tiền gửi có kỳ hạn

## Account Status

- `ACTIVE`: Tài khoản đang hoạt động
- `INACTIVE`: Tài khoản không hoạt động
- `CLOSED`: Tài khoản đã đóng
- `SUSPENDED`: Tài khoản bị tạm ngưng

## Business Rules

1. **Account Limit**: Mỗi user chỉ được tạo tối đa 10 tài khoản
2. **Account Number**: Tự động generate số tài khoản 16 chữ số duy nhất
3. **Balance Validation**: 
   - Không thể rút/chuyển nhiều hơn số dư hiện có
   - Không thể đóng tài khoản khi số dư khác 0
4. **Account Operations**: 
   - Không thể thực hiện giao dịch trên tài khoản bị lock/freeze
   - Chỉ tài khoản ACTIVE mới có thể thực hiện giao dịch

## Database Schema

### Accounts Table

```sql
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_status ON accounts(status);
```

## Cấu hình

### Database

```properties
spring.datasource.url=jdbc:postgresql://localhost:5435/account_db
spring.datasource.username=account_user
spring.datasource.password=account_password
```

### Server

```properties
server.port=8082
```

## Cấu trúc Project

```
account-service/
├── src/
│   ├── main/
│   │   ├── java/com/minibank/accountservice/
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

Service sẽ chạy trên port **8082**.

## Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AccountServiceTest
```

## Lưu ý

- Service cần PostgreSQL database đang chạy
- Account operations yêu cầu authentication qua API Gateway
- Admin operations (lock/unlock, freeze/unfreeze) yêu cầu admin role
- Service-to-service communication sử dụng header `X-Internal-Secret`

