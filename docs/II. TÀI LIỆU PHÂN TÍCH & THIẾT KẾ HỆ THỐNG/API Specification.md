# **MINI BANKING SYSTEM -- API SPECIFICATION (v1.0)** {#mini-banking-system-api-specification-v1.0}

**Version:** 1.0  
**Last update:** 2025-12-01  
**Base URL:** /api/v1

# **1. Authentication & Authorization** {#authentication-authorization}

## **1.1. Auth Method** {#auth-method}

- JWT Bearer Token

- Header:

Authorization: Bearer \<token\>

## **1.2. Roles** {#roles}

- USER

- ADMIN

Một số API yêu cầu **ADMIN ONLY**.

# **2. RESPONSE FORMAT** {#response-format}

## **2.1 Success Response** {#success-response}

{

\"success\": true,

\"data\": {}

}

## **2.2 Error Response** {#error-response}

{

\"success\": false,

\"error\": {

\"code\": \"INVALID_PASSWORD\",

\"message\": \"Password is incorrect\",

\"timestamp\": \"2025-12-01T12:00:00\",

\"path\": \"/api/v1/users/login\"

}

}

## **2.3 Error Codes Reference** {#error-codes-reference}

### **Authentication Errors**

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| INVALID_PASSWORD | 401 | Password is incorrect |
| INVALID_TOKEN | 401 | JWT token is invalid |
| TOKEN_EXPIRED | 401 | JWT token has expired |
| UNAUTHORIZED | 401 | Authentication required |

### **Account Errors**

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| ACCOUNT_NOT_FOUND | 404 | Account does not exist |
| ACCOUNT_FROZEN | 403 | Account is frozen |
| ACCOUNT_LOCKED | 403 | Account is locked |
| ACCOUNT_ALREADY_FROZEN | 400 | Account is already frozen |
| ACCOUNT_INVALID_STATUS | 400 | Account status is invalid for operation |
| RECEIVER_ACCOUNT_NOT_FOUND | 404 | Receiver account does not exist |
| RECEIVER_ACCOUNT_LOCKED | 400 | Receiver account is locked |
| RECEIVER_ACCOUNT_INVALID_STATUS | 400 | Receiver account status is invalid |

### **Transaction Errors**

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| INSUFFICIENT_BALANCE | 400 | Account balance is insufficient |
| INVALID_AMOUNT | 400 | Amount must be greater than 0 |
| TRANSACTION_FAILED | 500 | Transaction processing failed |

### **Validation Errors**

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| INVALID_EMAIL | 400 | Email format is invalid |
| INVALID_INPUT | 400 | Input validation failed |
| MISSING_REQUIRED_FIELD | 400 | Required field is missing |
| EMAIL_ALREADY_EXISTS | 400 | Email is already registered |

# **3. USER API** {#user-api}

## **3.1 Register -- Tạo tài khoản** {#register-tạo-tài-khoản}

### **POST /users/register**

**HTTP Status Codes:**
- 201 Created - Success
- 400 Bad Request - Validation error

**Request Body**

{

\"email\": \"user@gmail.com\",

\"password\": \"Pass123!\",

\"confirmPassword\": \"Pass123!\",

\"fullName\": \"Nguyen Van A\"

}

**Validation Rules:**
- email: Required, valid email format, max 100 characters, must be unique
- password: Required, min 8 characters, must contain uppercase, lowercase, number, and special character
- confirmPassword: Required, must match password
- fullName: Optional, max 100 characters

**Response (201 Created)**

{

\"success\": true,

\"data\": {

\"userId\": \"uuid\",

\"email\": \"user@gmail.com\",

\"createdAt\": \"2025-12-01T12:00:00\"

}

}

## **3.2 Login -- Đăng nhập** {#login-đăng-nhập}

### **POST /users/login**

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Validation error
- 401 Unauthorized - Invalid credentials or account locked

**Request**

{

\"email\": \"user@gmail.com\",

\"password\": \"Pass123!\"

}

**Validation Rules:**
- email: Required, valid email format
- password: Required

**Response (200 OK)**

{

\"success\": true,

\"data\": {

\"token\": \"\<jwt-token\>\",

\"userId\": \"uuid\"

}

}

## **3.3 Forgot Password -- Gửi OTP** {#forgot-password-gửi-otp}

### **POST /users/forgot-password**

**HTTP Status Codes:**
- 200 OK - Success (always returns success for security)
- 400 Bad Request - Validation error

**Request**

{

\"email\": \"user@gmail.com\"

}

**Validation Rules:**
- email: Required, valid email format

**Response (200 OK)**

{

\"success\": true,

\"data\": {

\"message\": \"OTP sent to email\"

}

}

## **3.4 Reset Password** {#reset-password}

### **POST /users/reset-password**

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Validation error or invalid OTP
- 401 Unauthorized - OTP expired or invalid

**Request**

{

\"email\": \"user@gmail.com\",

\"otp\": \"123456\",

\"newPassword\": \"NewPass123!\"

}

**Validation Rules:**
- email: Required, valid email format
- otp: Required, 6 digits, must be valid and not expired (max 5 minutes)
- newPassword: Required, min 8 characters, must contain uppercase, lowercase, number, and special character

**Response (200 OK)**

{

\"success\": true,

\"data\": {

\"message\": \"Password updated\"

}

}

## **3.5 Self-Freeze -- Người dùng tự đóng băng tài khoản** {#self-freeze-người-dùng-tự-đóng-băng-tài-khoản}

### **POST /users/self-freeze**

**Authentication:** JWT Bearer Token required

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Validation error or account already frozen/locked
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - Invalid password

**Request:**

{

\"password\": \"Pass123!\"

}

**Validation Rules:**
- password: Required, must match current user password
- Account status must be ACTIVE (cannot be LOCKED or FROZEN)

**Response (200 OK):**

{

\"success\": true,

\"data\": {

\"message\": \"Account frozen and logged out\"

}

}

**Error Response (400 Bad Request):**

{

\"success\": false,

\"error\": {

\"code\": \"ACCOUNT_ALREADY_FROZEN\",

\"message\": \"Account is already frozen\",

\"timestamp\": \"2025-12-01T12:00:00\",

\"path\": \"/api/v1/users/self-freeze\"

}

}

**Error Codes:**
- ACCOUNT_ALREADY_FROZEN - Account is already in FROZEN status
- ACCOUNT_LOCKED - Account is LOCKED and cannot be frozen
- ACCOUNT_INVALID_STATUS - Account status is invalid for self-freeze operation
- INVALID_PASSWORD - Password is incorrect

/users/logout

/auth/refresh-token

# **4. ACCOUNT API** {#account-api}

## **4.1 Lấy thông tin tài khoản** {#lấy-thông-tin-tài-khoản}

### **GET /account/me**

**Authentication:** JWT Bearer Token required

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 401 Unauthorized - Invalid or missing token

**Response (200 OK)**

{

\"success\": true,

\"data\": {

\"accountId\": \"uuid\",

\"balance\": 500000,

\"status\": \"ACTIVE\",

\"createdAt\": \"2025-12-01T12:00:00\"

}

}

/admin/accounts/{accountId}

/account/status

# **5. TRANSACTION API** {#transaction-api}

## **5.1 Deposit -- Nạp tiền** {#deposit-nạp-tiền}

### **POST /transactions/deposit**

**Authentication:** JWT Bearer Token required

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Validation error (account status invalid, amount invalid)
- 401 Unauthorized - Invalid or missing token

**Request:**

{

\"amount\": 100000

}

**Validation Rules:**
- amount: Required, must be > 0, DECIMAL(18,2)
- Account status must be ACTIVE

**Response (200 OK):**

{

\"success\": true,

\"data\": {

\"transactionId\": \"uuid\",

\"newBalance\": 600000

}

}

**Error Response (400 Bad Request):**

{

\"success\": false,

\"error\": {

\"code\": \"ACCOUNT_FROZEN\",

\"message\": \"Account is frozen and cannot perform transactions\",

\"timestamp\": \"2025-12-01T12:00:00\",

\"path\": \"/api/v1/transactions/deposit\"

}

}

**Error Codes:**
- ACCOUNT_FROZEN - Account status is FROZEN
- ACCOUNT_LOCKED - Account status is LOCKED
- INVALID_AMOUNT - Amount must be greater than 0

## **5.2 Withdraw -- Rút tiền** {#withdraw-rút-tiền}

### **POST /transactions/withdraw**

**Authentication:** JWT Bearer Token required

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Validation error (account status invalid, insufficient balance, amount invalid)
- 401 Unauthorized - Invalid or missing token

**Request:**

{

\"amount\": 50000

}

**Validation Rules:**
- amount: Required, must be > 0, DECIMAL(18,2)
- Account status must be ACTIVE
- Account balance must be sufficient

**Response (200 OK):**

{

\"success\": true,

\"data\": {

\"transactionId\": \"uuid\",

\"newBalance\": 450000

}

}

**Error Response (400 Bad Request):**

{

\"success\": false,

\"error\": {

\"code\": \"INSUFFICIENT_BALANCE\",

\"message\": \"Insufficient balance for withdrawal\",

\"timestamp\": \"2025-12-01T12:00:00\",

\"path\": \"/api/v1/transactions/withdraw\"

}

}

**Error Codes:**
- ACCOUNT_FROZEN - Account status is FROZEN
- ACCOUNT_LOCKED - Account status is LOCKED
- INSUFFICIENT_BALANCE - Account balance is insufficient
- INVALID_AMOUNT - Amount must be greater than 0

## **5.3 Transfer -- Chuyển tiền** {#transfer-chuyển-tiền}

### **POST /transactions/transfer**

**Authentication:** JWT Bearer Token required

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Validation error (account status invalid, insufficient balance, receiver account invalid)
- 401 Unauthorized - Invalid or missing token
- 404 Not Found - Receiver account not found

**Request:**

{

\"toAccountId\": \"uuid-receiver\",

\"amount\": 200000

}

**Validation Rules:**
- toAccountId: Required, must be valid UUID
- amount: Required, must be > 0, DECIMAL(18,2)
- Sender account status must be ACTIVE
- Receiver account must exist and be ACTIVE or FROZEN
- Sender account balance must be sufficient

**Response (200 OK):**

{

\"success\": true,

\"data\": {

\"transactionId\": \"uuid\",

\"status\": \"SUCCESS\",

\"fromAccountId\": \"uuid-sender\",

\"toAccountId\": \"uuid-receiver\",

\"amount\": 200000,

\"newBalance\": 300000,

\"timestamp\": \"2025-12-01T12:00:00\"

}

}

**Error Response (400 Bad Request):**

{

\"success\": false,

\"error\": {

\"code\": \"RECEIVER_ACCOUNT_LOCKED\",

\"message\": \"Receiver account is locked and cannot receive transfers\",

\"timestamp\": \"2025-12-01T12:00:00\",

\"path\": \"/api/v1/transactions/transfer\"

}

}

**Error Codes:**
- ACCOUNT_FROZEN - Sender account is FROZEN
- ACCOUNT_LOCKED - Sender account is LOCKED
- RECEIVER_ACCOUNT_NOT_FOUND - Receiver account does not exist
- RECEIVER_ACCOUNT_LOCKED - Receiver account is LOCKED
- RECEIVER_ACCOUNT_INVALID_STATUS - Receiver account status is invalid
- INSUFFICIENT_BALANCE - Sender account balance is insufficient
- INVALID_AMOUNT - Amount must be greater than 0

## **5.4 Lịch sử giao dịch** {#lịch-sử-giao-dịch}

### **GET /transactions/history**

**Authentication:** JWT Bearer Token required

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Invalid query parameters
- 401 Unauthorized - Invalid or missing token

### **Query Params**

| **Param** | **Type** | **Description**           | **Required** |
|-----------|----------|---------------------------|--------------|
| page      | int      | default=1, min=1          | No           |
| size      | int      | default=10, min=1, max=100| No           |
| type      | string   | DEPOSIT/WITHDRAW/TRANSFER  | No           |
| from      | date     | ISO 8601 format           | No           |
| to        | date     | ISO 8601 format           | No           |

**Validation Rules:**
- page: Must be >= 1
- size: Must be between 1 and 100
- type: Must be one of: DEPOSIT, WITHDRAW, TRANSFER
- from, to: Must be valid ISO 8601 date format

### **Response (200 OK)**

{

\"success\": true,

\"data\": {

\"page\": 1,

\"size\": 10,

\"total\": 50,

\"items\": \[

{

\"transactionId\": \"uuid\",

\"type\": \"TRANSFER\",

\"amount\": 100000,

\"timestamp\": \"2025-12-01T12:00:00\",

\"status\": \"SUCCESS\"

}

\]

}

}

/transactions/{transactionId}

# **6. ADMIN API (ROLE = ADMIN)** {#admin-api-role-admin}

## **6.1 Danh sách người dùng** {#danh-sách-người-dùng}

### **GET /admin/users**

**Authentication:** JWT Bearer Token required, ADMIN role only

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - Insufficient permissions (not ADMIN)

**Response (200 OK)**

{

\"success\": true,

\"data\": \[

{

\"userId\": \"uuid\",

\"email\": \"user@gmail.com\",

\"status\": \"ACTIVE\",

\"balance\": 500000,

\"createdAt\": \"2025-12-01T12:00:00\"

}

\]

}

## **6.2 Khóa tài khoản** {#khóa-tài-khoản}

### **PATCH /admin/lock/{userId}**

**Authentication:** JWT Bearer Token required, ADMIN role only

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Invalid user ID or user already locked
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - Insufficient permissions
- 404 Not Found - User not found

**Response (200 OK)**

{

\"success\": true,

\"data\": { \"message\": \"User locked\" }

}

## **6.3 Mở khóa** {#mở-khóa}

### **PATCH /admin/unlock/{userId}**

**Authentication:** JWT Bearer Token required, ADMIN role only

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Invalid user ID or user not locked
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - Insufficient permissions
- 404 Not Found - User not found

**Response (200 OK)**

{

\"success\": true,

\"data\": { \"message\": \"User unlocked\" }

}

## **6.4 Đóng băng** {#đóng-băng}

### **PATCH /admin/freeze/{userId}**

**Authentication:** JWT Bearer Token required, ADMIN role only

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Invalid user ID or user already frozen
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - Insufficient permissions
- 404 Not Found - User not found

**Response (200 OK)**

{

\"success\": true,

\"data\": { \"message\": \"User account frozen\" }

}

## **6.5 Gỡ đóng băng** {#gỡ-đóng-băng}

### **PATCH /admin/unfreeze/{userId}**

**Authentication:** JWT Bearer Token required, ADMIN role only

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 400 Bad Request - Invalid user ID or user not frozen
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - Insufficient permissions
- 404 Not Found - User not found

**Response (200 OK)**

{

\"success\": true,

\"data\": { \"message\": \"User account unfrozen\" }

}

## **6.6 Báo cáo hệ thống** {#báo-cáo-hệ-thống}

### **GET /admin/report**

**Authentication:** JWT Bearer Token required, ADMIN role only

**Header:** Authorization: Bearer \<token\>

**HTTP Status Codes:**
- 200 OK - Success
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - Insufficient permissions

**Response (200 OK)**

{

\"success\": true,

\"data\": {

\"totalUsers\": 1200,

\"totalTransactionsToday\": 350,

\"totalAmount\": 15000000,

\"failedTransactions\": 5

}

}

/admin/logs

/admin/users/search

**5. LOG API**

**/admin/logs**

**/logs/me**

**6. NOTIFICATION API**

**/notifications**

**/notifications/unread**

- **/notifications/{id}/read  
  > **

# **7. WEBSOCKET API -- Real-time Notification Service** {#websocket-api-real-time-notification-service}

Hệ thống cung cấp WebSocket để gửi thông báo **thời gian thực** cho
người dùng và admin khi có các sự kiện quan trọng:

- Giao dịch thành công (Deposit, Withdraw, Transfer)

- Thay đổi trạng thái tài khoản (Freeze, Lock, Unlock)

- Cảnh báo bảo mật (Self-Freeze, OTP, đăng nhập bất thường)

- Thông báo hệ thống

WebSocket hoạt động theo cơ chế **one-to-many** thông qua các topic
channel.

# **7.1 WebSocket Endpoint** {#websocket-endpoint}

### **Endpoint**

ws://\<domain\>/ws/notifications

### **Protocol**

- STOMP over WebSocket

- Hỗ trợ SockJS fallback

### **Upgrade Request Example**

GET /ws/notifications HTTP/1.1

Upgrade: websocket

Connection: Upgrade

# **7.2 Authentication** {#authentication}

Kết nối WebSocket bắt buộc phải kèm **JWT Token hợp lệ**.

### **Cách gửi token (2 lựa chọn)**

#### **1. Query Parameter** {#query-parameter}

ws://\<domain\>/ws/notifications?token=\<jwt-token\>

#### **2. Header** {#header}

Authorization: Bearer \<jwt-token\>

> Nếu token không hợp lệ → server TỪ CHỐI KẾT NỐI.

# **7.3 Subscription Channels (Topics)** {#subscription-channels-topics}

WebSocket phân kênh theo từng loại sự kiện.

| **Topic**                      | **Ý nghĩa**                                 |
|--------------------------------|---------------------------------------------|
| /topic/transactions/{userId}   | Giao dịch của người dùng                    |
| /topic/account-status/{userId} | Trạng thái tài khoản (Freeze/Unfreeze/Lock) |
| /topic/security/{userId}       | Self-freeze, cảnh báo bảo mật               |
| /topic/system                  | Broadcast toàn hệ thống (nếu cần)           |

# **7.4 Message Formats** {#message-formats}

Tất cả các tin nhắn WebSocket gửi đến client đều ở dạng JSON.

## **7.4.1 Transaction Notification** {#transaction-notification}

### **Event Description**

Gửi khi người dùng thực hiện các giao dịch:

- Deposit

- Withdraw

- Transfer

### **Payload**

{

\"event\": \"TRANSACTION\",

\"transactionId\": \"uuid\",

\"type\": \"DEPOSIT\",

\"amount\": 200000,

\"timestamp\": \"2025-12-01T14:30:10Z\",

\"status\": \"SUCCESS\",

\"newBalance\": 900000

}

## **7.4.2 Account Status Notification** {#account-status-notification}

### **Events**

- Account Frozen

- Account Unfrozen

- Account Locked

- Account Unlocked

### **Payload Example**

{

\"event\": \"ACCOUNT_STATUS\",

\"status\": \"FROZEN\",

\"reason\": \"Admin action\",

\"timestamp\": \"2025-12-01T14:32:00Z\"

}

## **7.4.3 Security Notification** {#security-notification}

Gửi trong trường hợp:

- Self-Freeze

- OTP security

- Login bất thường

### **Example**

{

\"event\": \"SECURITY_ALERT\",

\"message\": \"Your account has been self-frozen.\",

\"timestamp\": \"2025-12-01T14:35:00Z\"

}

## **7.4.4 System Broadcast (optional)** {#system-broadcast-optional}

{

\"event\": \"SYSTEM_BROADCAST\",

\"message\": \"System maintenance at 23:00\",

\"timestamp\": \"2025-12-01T10:00:00Z\"

}

# **7.5 Client → Server (Optional Events)** {#client-server-optional-events}

Client cũng có thể gửi message đến server để yêu cầu thông tin hoặc kiểm
tra kết nối.

## **7.5.1 Ping/Heartbeat** {#pingheartbeat}

{

\"type\": \"PING\"

}

Server trả về:

{

\"type\": \"PONG\",

\"timestamp\": \"2025-12-01T14:35:00Z\"

}

## **7.5.2 Request Updates** {#request-updates}

Channel:

/app/request-update

Body:

{

\"type\": \"ACCOUNT_INFO\"

}

# **7.6 Event Trigger Rules** {#event-trigger-rules}

| **Triggers**          | **WebSocket Event** | **Channel**                    |
|-----------------------|---------------------|--------------------------------|
| Deposit               | TRANSACTION         | /topic/transactions/{userId}   |
| Withdraw              | TRANSACTION         | /topic/transactions/{userId}   |
| Transfer              | TRANSACTION         | /topic/transactions/{userId}   |
| Admin Freeze          | ACCOUNT_STATUS      | /topic/account-status/{userId} |
| Admin Unfreeze        | ACCOUNT_STATUS      | /topic/account-status/{userId} |
| Self-Freeze           | SECURITY_ALERT      | /topic/security/{userId}       |
| Failed login attempts | SECURITY_ALERT      | /topic/security/{userId}       |

# **7.7 Server-Side API (Spring Boot STOMP Example)** {#server-side-api-spring-boot-stomp-example}

### **Send Message**

template.convertAndSend(

\"/topic/transactions/\" + userId,

transactionDto

);

### **Receive Message (Controller)**

@MessageMapping(\"/request-update\")

public void updateRequest(RequestUpdateDto dto) {

// handle logic

}

# **7.8 Client Example (JavaScript)** {#client-example-javascript}

const socket = new SockJS(\"/ws/notifications\");

const stomp = Stomp.over(socket);

stomp.connect(

{ Authorization: \"Bearer \" + token },

() =\> {

stomp.subscribe(\`/topic/transactions/\${userId}\`, (msg) =\> {

console.log(\"Transaction Event:\", JSON.parse(msg.body));

});

}

);