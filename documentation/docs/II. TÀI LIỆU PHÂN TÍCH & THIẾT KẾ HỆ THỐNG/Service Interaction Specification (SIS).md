# **SERVICE INTERACTION SPECIFICATION (SIS) -- MINI BANKING SYSTEM** {#service-interaction-specification-sis-mini-banking-system}

**Version:** 1.0  
**Author:** Nhóm 7  
**Mục tiêu:** Mô tả chi tiết cách **các microservice giao tiếp với
nhau**, gồm REST API, Kafka Events, Auth, Error Handling và thứ tự gọi
dịch vụ.

# **1. Tổng Quan Kiến Trúc Giao Tiếp** {#tổng-quan-kiến-trúc-giao-tiếp}

Hệ thống gồm 6 service:

| **Service**          | **Vai trò**                              |
|----------------------|------------------------------------------|
| User Service         | Đăng ký, đăng nhập, xác thực JWT         |
| Account Service      | Quản lý tài khoản, số dư                 |
| Transaction Service  | Nạp -- rút -- chuyển tiền                |
| Notification Service | Gửi Email/SMS/WebSocket                  |
| Log Service          | Ghi log hành động                        |
| Admin Service        | Hành động quản trị: lock, freeze, report |

Các hình thức giao tiếp:

| **Loại**    | **Giao thức / Công nghệ** |
|-------------|---------------------------|
| Đồng bộ     | REST API                  |
| Bất đồng bộ | Kafka Events              |
| Realtime    | WebSocket (Notification)  |
| Auth        | JWT                       |

# **2. Sơ Đồ Tổng Quan Giao Tiếp** {#sơ-đồ-tổng-quan-giao-tiếp}

Client → API Gateway → (User / Account / Transaction / Admin)

Transaction Service → Kafka → Notification Service

Transaction Service → Kafka → Log Service

Admin Service → Kafka → Log Service

User Service → Kafka → Log Service

# **3. Giao Tiếp REST API Giữa Các Service** {#giao-tiếp-rest-api-giữa-các-service}

## **3.1 User Service ↔ Account Service** {#user-service-account-service}

| **Tình huống**                    | **Ai gọi ai**                         | **Endpoint**                        |
|-----------------------------------|---------------------------------------|-------------------------------------|
| Tạo tài khoản mới khi đăng ký     | User Service → Account Service        | POST /internal/accounts/create      |
| Lấy thông tin tài khoản theo user | Transaction Service → Account Service | GET /internal/accounts/by-user/{id} |

## **3.2 Transaction Service ↔ Account Service** {#transaction-service-account-service}

| **Mục đích**              | **Method** | **Endpoint**                                  |
|---------------------------|------------|-----------------------------------------------|
| Kiểm tra số dư            | GET        | /internal/accounts/{accountId}/balance        |
| Cập nhật số dư (nạp, rút) | PATCH      | /internal/accounts/{accountId}/update-balance |
| Xác minh tài khoản nhận   | GET        | /internal/accounts/{accountId}                |
| Chuyển tiền (gộp API)     | POST       | /internal/accounts/transfer                   |

**Lưu ý:**

- Các endpoint /internal/\*\* chỉ dùng giữa microservices, không đi qua API Gateway.

- Giao tiếp này phải thực hiện **trong transaction ACID**.

- Endpoint `/internal/accounts/{accountId}` trả về thông tin đầy đủ bao gồm status để validate:
  ```json
  {
    "accountId": "uuid",
    "userId": "uuid",
    "balance": 500000,
    "status": "ACTIVE"
  }
  ```

- Endpoint `/internal/accounts/transfer` nhận request:
  ```json
  {
    "fromAccountId": "uuid",
    "toAccountId": "uuid",
    "amount": 100000
  }
  ```
  Thực hiện trong một database transaction với pessimistic locking.

**Error Responses:**
- 400: Sender account không ACTIVE, Receiver account không hợp lệ, Số dư không đủ
- 404: Account không tồn tại
- 500: Lỗi hệ thống (sẽ retry)

## **3.3 Admin Service ↔ Account Service** {#admin-service-account-service}

| **Chức năng**     | **Endpoint**                         |
|-------------------|--------------------------------------|
| Freeze / Unfreeze | PATCH /internal/accounts/{id}/freeze |
| Lock / Unlock     | PATCH /internal/accounts/{id}/lock   |

## **3.4 Transaction Service ↔ User Service** {#transaction-service-user-service}

| **Mục đích**                    | **Method** | **Endpoint**                    |
|--------------------------------|------------|--------------------------------|
| Lấy thông tin user (CCCD, employeeCode) | GET | /internal/users/{userId} |

**Lưu ý:**
- Transaction Service gọi User Service để lấy thông tin user khi tạo giao dịch nạp tiền ở quầy
- Cần thông tin `citizenId` (CCCD) để tạo mã giao dịch
- Cần thông tin `employeeCode` của nhân viên được phân bổ

**Request/Response:**
```json
// GET /internal/users/{userId}
Response: {
  "userId": "uuid",
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "citizenId": "001234567890",
  "employeeCode": "EMP001"
}
```

## **3.5 User Service ↔ Admin Service** {#user-service-admin-service}

| **Tình huống**           | **Ai gọi ai**        | **Endpoint**                    |
|--------------------------|----------------------|---------------------------------|
| Admin lấy danh sách user | Admin → User Service | GET /internal/users             |
| Admin khóa user          | Admin → User Service | PATCH /internal/users/{id}/lock |

# **4. Giao Tiếp Bất Đồng Bộ Qua Kafka** {#giao-tiếp-bất-đồng-bộ-qua-kafka}

## **4.1 Danh sách Topic** {#danh-sách-topic}

| **Topic**             | **Phát từ**         | **Nhận bởi**       | **Ý nghĩa**             |
|-----------------------|---------------------|--------------------|-------------------------|
| USER_EVENT            | User Service        | Log Service        | login, logout, register |
| ACCOUNT_EVENT         | Account Service     | Log Service        | freeze, unfreeze        |
| TRANSACTION_COMPLETED | Transaction Service | Notification + Log | gửi thông báo, ghi log  |
| COUNTER_DEPOSIT_NOTIFICATION | Transaction Service | Notification Service | thông báo đến nhân viên về yêu cầu/hủy nạp tiền |
| ADMIN_ACTION | Transaction Service | Log Service + Admin | ghi log khi nhân viên xác nhận nạp tiền |
| ADMIN_ACTION          | Admin Service       | Log Service        | lock, unlock, freeze    |

## **4.2 Payload Ví Dụ** {#payload-ví-dụ}

### **TRANSACTION_COMPLETED**

{

\"transactionId\": \"uuid\",

\"fromAccount\": \"uuid\",

\"toAccount\": \"uuid\",

\"amount\": 50000,

\"type\": \"TRANSFER\",

\"timestamp\": \"2025-12-01T10:00:00\",

\"status\": \"SUCCESS\"

}

### **ADMIN_ACTION**

{

\"adminId\": \"uuid\",

\"targetUserId\": \"uuid\",

\"action\": \"FREEZE_ACCOUNT\",

\"time\": \"2025-12-01T10:30:00\"

}

### **COUNTER_DEPOSIT_NOTIFICATION**

**Khi tạo yêu cầu nạp tiền:**

{

\"transactionId\": \"uuid\",

\"transactionCode\": \"EMP1234567890123456\",

\"amount\": 1000000,

\"type\": \"COUNTER_DEPOSIT\",

\"status\": \"PENDING\",

\"timestamp\": \"2025-12-01T12:00:00\",

\"userId\": \"uuid\",

\"staffId\": \"uuid\",

\"counterId\": \"uuid\",

\"employeeCode\": \"EMP001\",

\"notificationType\": \"COUNTER_DEPOSIT_REQUEST\",

\"message\": \"Yêu cầu nạp tiền ở quầy với mã giao dịch: EMP1234567890123456, số tiền: 1000000\"

}

**Khi user hủy giao dịch:**

{

\"transactionId\": \"uuid\",

\"transactionCode\": \"EMP1234567890123456\",

\"amount\": 1000000,

\"type\": \"COUNTER_DEPOSIT_CANCELLED\",

\"status\": \"CANCELLED\",

\"timestamp\": \"2025-12-01T12:00:00\",

\"userId\": \"uuid\",

\"staffId\": \"uuid\",

\"counterId\": \"uuid\",

\"notificationType\": \"COUNTER_DEPOSIT_CANCELLED\",

\"message\": \"User đã hủy yêu cầu nạp tiền ở quầy với mã giao dịch: EMP1234567890123456\"

}

### **ADMIN_ACTION (Counter Deposit Confirmed)**

**Khi nhân viên xác nhận đã nhận tiền:**

{

\"transactionId\": \"uuid\",

\"transactionCode\": \"EMP1234567890123456\",

\"amount\": 1000000,

\"type\": \"COUNTER_DEPOSIT_CONFIRMED\",

\"status\": \"SUCCESS\",

\"timestamp\": \"2025-12-01T12:00:00\",

\"staffId\": \"uuid\",

\"counterId\": \"uuid\",

\"logType\": \"ADMIN_LOG\",

\"message\": \"Nhân viên {staffId} đã xác nhận nạp tiền ở quầy với mã giao dịch: {transactionCode}, số tiền: {amount}\"

}

# **5. WebSocket (Notification Real-time)** {#websocket-notification-real-time}

**Endpoint:**

/ws/notifications

**Ai sử dụng?**

- Notification Service push notify đến user khi:

  - giao dịch thành công

  - có thay đổi trạng thái tài khoản

  - cảnh báo bảo mật

**Message payload:**

{

\"userId\": \"uuid\",

\"title\": \"Giao dịch thành công\",

\"content\": \"Bạn đã chuyển 200.000 VND\",

\"time\": \"2025-12-01T11:00:00\"

}

# **6. Quy Tắc Xác Thực Giữa Các Service** {#quy-tắc-xác-thực-giữa-các-service}

### **Các request giữa service phải kèm:**

X-Internal-Secret: \<service-token\>

User truy cập → API Gateway → đính kèm JWT → Forward vào service.

**JWT không dùng để xác thực giữa microservices.**

# **7. Thứ Tự Giao Tiếp Theo Nghiệp Vụ** {#thứ-tự-giao-tiếp-theo-nghiệp-vụ}

## **7.1 Đăng ký (Register Flow)** {#đăng-ký-register-flow}

Client → API Gateway → User Service

User Service → Account Service (create account)

User Service → Kafka(USER_EVENT) → Log Service

## **7.2 Đăng nhập (Login)** {#đăng-nhập-login}

Client → Gateway → User Service

User Service:
1. Validate credentials (email, password)
2. Kiểm tra account status không được LOCKED
3. Tạo JWT token
4. Cập nhật last_login

User Service → Kafka(USER_EVENT) → Log Service

**Validation:**
- Account status không được LOCKED (ACTIVE hoặc FROZEN đều có thể đăng nhập)

## **7.4 Nạp tiền (Deposit)** {#nạp-tiền-deposit}

Client → Transaction Service

Transaction Service → Account Service:
1. Kiểm tra account status phải ACTIVE
2. Update balance (trong database transaction)

Transaction → Kafka(TRANSACTION_COMPLETED)

→ Notification Service

→ Log Service

**Validation:**
- Account status phải ACTIVE
- Amount > 0

**Bổ sung bước xác nhận (nếu chính sách yêu cầu):**
- Tùy cấu hình, Transaction Service tạo yêu cầu nạp ở trạng thái `PENDING`.
- Gửi OTP/2FA cho user **hoặc** chuyển yêu cầu sang Admin Service để duyệt.
- Nếu chọn duyệt admin: Transaction Service phát event `DEPOSIT_PENDING`, Admin Service hiển thị danh sách chờ duyệt, admin APPROVE/REJECT qua API nội bộ.
- Khi APPROVE: Transaction Service mới gọi Account Service cập nhật số dư, ghi transaction, phát `TRANSACTION_COMPLETED`.
- Khi REJECT hoặc hết hạn: hủy yêu cầu, không cộng số dư, có thể phát event `DEPOSIT_REJECTED` để log/thông báo.

## **7.3.1 Rút tiền (Withdraw)** {#rút-tiền-withdraw}

Client → Transaction Service

Transaction Service → Account Service:
1. Kiểm tra account status phải ACTIVE
2. Kiểm tra số dư đủ (với pessimistic locking - SELECT FOR UPDATE)
3. Update balance - trừ số dư (trong database transaction)

Transaction → Kafka(TRANSACTION_COMPLETED)

→ Notification Service

→ Log Service

**Validation:**
- Account status phải ACTIVE
- Amount > 0
- Balance >= amount (với pessimistic locking để tránh race condition)

## **7.4 Chuyển tiền (Transfer -- ACID)** {#chuyển-tiền-transfer-acid}

### **Flow chi tiết**

Client → Transaction Service

**Phương án ưu tiên (Đảm bảo ACID):**

Transaction Service → Account Service (transfer amount) trong một API call duy nhất:
- Account Service nhận request với fromAccountId, toAccountId, amount
- Account Service thực hiện trong một database transaction:
  1. SELECT FOR UPDATE để lock cả 2 tài khoản (pessimistic locking)
  2. Kiểm tra sender account status phải ACTIVE
  3. Kiểm tra receiver account tồn tại và status phải ACTIVE hoặc FROZEN
  4. Kiểm tra số dư người gửi đủ
  5. Trừ số dư người gửi
  6. Cộng số dư người nhận
  7. Commit transaction
- Nếu lỗi → Rollback tự động

**Validation trong Account Service:**
- Sender account status = ACTIVE
- Receiver account tồn tại và status = ACTIVE hoặc FROZEN
- Sender balance >= amount

**Phương án thay thế (Saga Pattern nếu không thể gộp API):**

1\. Transaction → Account Service (validate sender account status = ACTIVE)

2\. Transaction → Account Service (validate receiver account tồn tại và status = ACTIVE hoặc FROZEN)

3\. Transaction → Account Service (check balance với lock)

4\. Transaction → Account Service (decrease sender)

5\. Transaction → Account Service (increase receiver)

6\. Nếu bất kỳ bước nào thất bại → Compensating transaction (rollback)

7\. Transaction → DB transaction commit

8\. Transaction → Kafka(TRANSACTION_COMPLETED)

→ Notification Service

→ Log Service

**Lưu ý quan trọng:**
- Phải sử dụng pessimistic locking (SELECT FOR UPDATE) khi kiểm tra số dư để tránh race condition
- Hoặc sử dụng optimistic locking với version field
- Database constraint CHECK (balance >= 0) để đảm bảo số dư không âm

## **7.5 Admin Freeze Account** {#admin-freeze-account}

Admin → Admin Service

Admin Service → Account Service

Admin Service → Kafka(ADMIN_ACTION) → Log Service

# **8. Error Handling & Retry** {#error-handling-retry}

### **Khi REST API giữa service lỗi**

| **Lỗi** | **Cách xử lý**                    | **Ví dụ** |
|---------|-----------------------------------|-----------|
| 400     | trả về ngay cho caller            | Validation error, account status invalid |
| 401     | trả về ngay cho caller            | Service token invalid |
| 404     | ghi log + trả lỗi business        | Account not found |
| 500     | retry 3 lần (exponential backoff) | Internal server error |
| 503     | queue lại hoặc retry 5 lần        | Service unavailable |

**Retry Strategy:**
- Exponential backoff: 1s, 2s, 4s
- Max retries: 3 lần cho 500, 5 lần cho 503
- Timeout: ≤ 3 giây mỗi request

### **Kafka Event Handling**

- Consumer phải **idempotent** (xử lý nhiều lần vẫn đúng).

- Lưu offset để đảm bảo không mất sự kiện.

- Khi gửi email thất bại → retry queue với exponential backoff.

- Dead letter queue cho các event không thể xử lý sau nhiều lần retry.

# **9. Yêu Cầu Phi Chức Năng Cho Giao Tiếp** {#yêu-cầu-phi-chức-năng-cho-giao-tiếp}

| **NFR**       | **Mô tả**                                       |
|---------------|-------------------------------------------------|
| Timeout       | ≤ 3 giây giữa microservice                      |
| Retry         | mỗi request retry 3 lần                         |
| Logging       | tất cả event đều phải ghi log                   |
| Observability | trace-ID trong tất cả request                   |
| Security      | không dùng JWT giữa service, dùng service token |
