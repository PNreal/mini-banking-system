# Mini Banking System - Backend Logic Overview

## Tổng quan

Hệ thống Mini Banking được xây dựng theo kiến trúc microservices với 6 services chính, giao tiếp qua REST API và Kafka events.

---

## 1. User Service (Port: 8081)

### 1.1 Xác thực (Authentication)

#### Đăng ký tài khoản
```
POST /api/users/register
```
- Validate email unique (normalize: trim + lowercase)
- Hash password với BCrypt
- Tạo user với role CUSTOMER, status ACTIVE
- **Tự động tạo tài khoản ngân hàng** qua AccountServiceClient
- Publish event `USER_REGISTERED` → Kafka topic `USER_EVENT`

#### Đăng nhập
```
POST /api/users/login          # Customer
POST /api/users/admin/login    # Admin only
POST /api/users/staff/login    # Staff roles (STAFF, COUNTER_ADMIN, COUNTER_STAFF)
```
**Logic xử lý:**
1. Tìm user theo email (normalized)
2. Kiểm tra khóa tạm thời (`loginLockedUntil`)
3. Verify password
4. Kiểm tra status (FROZEN/LOCKED → reject)
5. Kiểm tra role phù hợp
6. Generate JWT tokens:
   - Access token: chứa email, userId, role
   - Refresh token: 7 ngày
7. Reset `failedLoginAttempts` và `loginLockedUntil`
8. Publish event `USER_LOGIN`

**Cơ chế khóa tạm thời:**
- Sau 5 lần nhập sai → khóa 10 phút
- Reset counter sau khi khóa
- Admin không bị áp dụng cơ chế này

#### Lấy thông tin user
```
GET /api/users/me
```
- Trả về thông tin user hiện tại dựa trên JWT token

#### Upload avatar
```
POST /api/users/me/avatar
POST /api/users/avatar
```
- Tạm thời trả về URL avatar mặc định
- Cập nhật avatar URL trong database

#### Refresh Token
```
POST /api/users/refresh
```
- Validate refresh token tồn tại và chưa hết hạn
- Generate access token mới (giữ nguyên refresh token)

#### Logout
```
POST /api/users/logout
```
- Xóa refresh token trong DB → ngăn cấp lại access token

### 1.2 Quản lý mật khẩu

#### Quên mật khẩu
```
POST /api/users/password/reset-request
```
1. Tìm user theo email
2. Generate reset token (JWT)
3. Set expiry 10 phút
4. Gửi email với link reset

#### Đặt lại mật khẩu
```
POST /api/users/password/reset-confirm
```
1. Validate reset token
2. Kiểm tra expiry
3. Hash password mới
4. Xóa reset token

#### Đổi mật khẩu
```
POST /api/users/password/change
```
1. Extract email từ JWT token
2. Verify current password
3. Validate new password khác current
4. Hash và lưu password mới
5. Publish event `PASSWORD_CHANGED`

### 1.3 Quản lý User (Admin)

#### CRUD Operations
```
GET    /api/users/internal/users           # Lấy tất cả users
GET    /api/users/internal/users/{id}      # Lấy user theo ID
POST   /api/users/internal/users           # Tạo user mới
PUT    /api/users/internal/users/{id}      # Cập nhật user
DELETE /api/users/internal/users/{id}      # Xóa user
```

#### Lock/Unlock User
```
POST /api/users/internal/users/{id}/lock
POST /api/users/internal/users/{id}/unlock
```
- Cập nhật status: LOCKED ↔ ACTIVE

#### Freeze/Unfreeze User
```
POST /api/users/internal/users/{id}/freeze
POST /api/users/internal/users/{id}/unfreeze
```
- Cập nhật status: FROZEN ↔ ACTIVE
- User có thể tự freeze tài khoản của mình

### 1.4 Tạo Employee
```
POST /api/users/internal/employees
```
**Input:** email, fullName, phoneNumber, role, employeeCode (optional), password (optional)

**Logic:**
1. Validate role: COUNTER_ADMIN, COUNTER_STAFF, ADMIN
2. Generate employeeCode nếu không có:
   - COUNTER_ADMIN → `CA` + 6 số random
   - COUNTER_STAFF → `CS` + 6 số random
   - ADMIN → `AD` + 6 số random
3. Generate password 12 ký tự nếu không có
4. Tạo user với emailVerified = true
5. Publish event `EMPLOYEE_CREATED`
6. Return generatedPassword nếu có

### 1.5 Admin User Management
#### Tạo user mới
```
POST /api/users/admin/users
```
- Chỉ Admin mới có quyền truy cập
- Tạo user mới với thông tin cung cấp

#### Lấy danh sách users
```
GET /api/users/admin/users
```
- Chỉ Admin mới có quyền truy cập
- Trả về danh sách tất cả users

#### Cập nhật thông tin user
```
PUT /api/users/admin/users/{userId}
```
- Chỉ Admin mới có quyền truy cập
- Cập nhật thông tin user theo ID

#### Khóa/Mở khóa user
```
PUT /api/users/admin/users/{userId}/lock
PUT /api/users/admin/users/{userId}/unlock
```
- Chỉ Admin mới có quyền truy cập
- Thay đổi status user giữa LOCKED và ACTIVE

#### Đóng băng/Mở đóng băng user
```
PUT /api/users/admin/users/{userId}/freeze
PUT /api/users/admin/users/{userId}/unfreeze
```
- Chỉ Admin mới có quyền truy cập
- Thay đổi status user giữa FROZEN và ACTIVE

#### Xóa user
```
DELETE /api/users/admin/users/{userId}
```
- Chỉ Admin mới có quyền truy cập
- Xóa user theo ID

### 1.6 KYC (Know Your Customer)

#### Submit KYC
```
POST /api/users/kyc/submit
```
**Validations:**
- User chưa có KYC approved
- Không có KYC pending

**Input:**
- citizenId, fullName, dateOfBirth, gender
- placeOfIssue, dateOfIssue, expiryDate
- permanentAddress, currentAddress
- phoneNumber, email
- frontIdImageUrl, backIdImageUrl, selfieImageUrl

#### Lấy trạng thái KYC
```
GET /api/users/kyc/status          # KYC mới nhất
GET /api/users/kyc/history         # Lịch sử KYC
```

#### Admin/Staff Review KYC
```
GET  /api/users/kyc/pending                    # Danh sách pending
GET  /api/users/kyc/all                        # Tất cả KYC
GET  /api/users/kyc/{kycId}                    # Chi tiết KYC
POST /api/users/kyc/{kycId}/review             # Approve/Reject
```

**Review Logic:**
1. Validate KYC đang PENDING
2. Validate status: APPROVED hoặc REJECTED
3. Nếu REJECTED → bắt buộc có rejectionReason
4. Cập nhật verifiedBy, verifiedAt
5. **Nếu APPROVED:**
   - Cập nhật user: citizenId, fullName, phoneNumber
   - Gọi AccountService để kích hoạt tài khoản

---

## 2. Account Service

### 2.1 Tạo tài khoản
```
POST /api/accounts
```
**Logic:**
1. Kiểm tra user chưa có account
2. Generate số tài khoản 12 chữ số unique (retry tối đa 100 lần)
3. Set balance = 0, status = ACTIVE
4. Publish event `ACCOUNT_CREATED`

**Generate Account Number:**
```java
synchronized {
    for (100 attempts) {
        candidate = random 12-digit number
        if (!exists) return candidate
    }
    throw RuntimeException
}
```

### 2.2 Public Account APIs
```
GET /account/me
```
- Lấy thông tin tài khoản của user hiện tại
- Yêu cầu header X-User-Id

```
GET /account/status
```
- Lấy trạng thái tài khoản của user hiện tại
- Yêu cầu header X-User-Id

### 2.3 Cập nhật số dư (Internal)
```
PATCH /internal/accounts/{accountId}/update-balance
```
**Input:** operation (DEPOSIT/WITHDRAW), amount

**Logic:**
1. Lock account (pessimistic locking)
2. Validate account ACTIVE
3. DEPOSIT: balance += amount
4. WITHDRAW: 
   - Validate balance >= amount
   - balance -= amount

### 2.4 Chuyển khoản nội bộ (Internal)
```
POST /internal/accounts/transfer
```
**Input:** fromAccountId, toAccountId, amount

**Deadlock Prevention:**
```java
// Lock theo thứ tự UUID để tránh deadlock
boolean swap = first.compareTo(second) > 0;
UUID firstLock = swap ? second : first;
UUID secondLock = swap ? first : second;

// Lock tuần tự
Account firstAccount = findWithLocking(firstLock);
Account secondAccount = findWithLocking(secondLock);
```

**Logic:**
1. Validate không chuyển cho chính mình
2. Lock 2 accounts theo thứ tự
3. Validate cả 2 đều ACTIVE
4. Validate from.balance >= amount
5. from.balance -= amount
6. to.balance += amount

### 2.5 Freeze/Unfreeze Account (Internal)
```
PATCH /internal/accounts/{accountId}/freeze
PATCH /internal/accounts/{accountId}/unfreeze
```
- Validate không phải LOCKED
- FROZEN ↔ ACTIVE
- Publish events

### 2.6 Lock/Unlock Account (Internal)
```
PATCH /internal/accounts/{accountId}/lock
PATCH /internal/accounts/{accountId}/unlock
```
- LOCKED ↔ ACTIVE
- Publish events

### 2.7 Kích hoạt sau KYC (Internal)
```
POST /internal/accounts/activate-kyc/{userId}
```
**Logic:**
1. Nếu đã có account → set status = ACTIVE
2. Nếu chưa có → tạo account mới với status = ACTIVE
3. Publish event `ACCOUNT_KYC_ACTIVATED` hoặc `ACCOUNT_CREATED_KYC`

### 2.8 Internal APIs
```
POST /internal/accounts/create
GET /internal/accounts/by-user/{userId}
GET /internal/accounts/{accountId}
GET /internal/accounts/{accountId}/balance
```

---

## 3. Transaction Service

### 3.1 Giao dịch Online

#### Nạp tiền
```
POST /api/transactions/deposit
```
1. Validate amount > 0
2. Resolve accountId từ userId
3. Gọi AccountService.updateBalance(DEPOSIT)
4. Tạo transaction: type=DEPOSIT, status=SUCCESS
5. Publish event `TRANSACTION_COMPLETED`

#### Rút tiền
```
POST /api/transactions/withdraw
```
1. Validate amount > 0
2. Resolve accountId từ userId
3. Gọi AccountService.updateBalance(WITHDRAW)
4. Tạo transaction: type=WITHDRAW, status=SUCCESS
5. Publish event

#### Chuyển khoản
```
POST /api/transactions/transfer
```
1. Validate amount > 0
2. Resolve fromAccountId từ userId
3. Validate fromAccountId ≠ toAccountId
4. Gọi AccountService.transfer()
5. Tạo transaction: type=TRANSFER, status=SUCCESS
6. Publish event

### 3.2 Giao dịch tại Quầy

#### Nạp tiền tại quầy (User tạo yêu cầu)
```
POST /api/v1/transactions/deposit-counter
```
**Input:** amount, counterId

**Logic:**
1. Validate amount và account status
2. Lấy thông tin user (CCCD)
3. Phân bổ nhân viên từ quầy: `counterService.assignStaffFromCounter(counterId)`
4. Lấy employeeCode của nhân viên
5. Generate transactionCode: `{employeeCode}{4 số cuối CCCD}{DDMMYY}`
6. Tạo transaction: type=COUNTER_DEPOSIT, status=PENDING
7. Publish notification đến nhân viên qua Kafka topic `COUNTER_DEPOSIT_NOTIFICATION`

#### Nhân viên xác nhận nạp tiền
```
POST /api/v1/transactions/deposit-counter/{transactionId}/confirm
```
**Validations:**
- Transaction type = COUNTER_DEPOSIT
- Status = PENDING
- staffId khớp với transaction

**Logic:**
1. Gọi AccountService.updateBalance(DEPOSIT)
2. Set status = SUCCESS
3. Publish log đến admin qua topic `ADMIN_ACTION`
4. Publish event `TRANSACTION_COMPLETED`

#### User hủy yêu cầu nạp tiền
```
POST /api/v1/transactions/deposit-counter/{transactionId}/cancel
```
**Validations:**
- Type = COUNTER_DEPOSIT
- Status = PENDING
- User là chủ tài khoản

**Logic:**
1. Set status = CANCELLED
2. Publish notification đến nhân viên

#### Rút tiền tại quầy
```
POST /api/v1/transactions/withdraw-counter
POST /api/v1/transactions/withdraw-counter/{transactionId}/confirm
POST /api/v1/transactions/withdraw-counter/{transactionId}/cancel
```
Tương tự nạp tiền, nhưng:
- Kiểm tra số dư trước khi tạo yêu cầu
- fromAccountId = accountId (thay vì toAccountId)
- Trừ tiền khi confirm

### 3.3 Lịch sử giao dịch
```
GET /api/v1/transactions/history
```
**Query params:** type, from, to, page, size

**Logic:**
1. Resolve accountId từ userId
2. Search transactions where fromAccountId = accountId OR toAccountId = accountId

#### Chi tiết giao dịch
```
GET /api/v1/transactions/{transactionId}
```
- Lấy chi tiết một giao dịch cụ thể
- Yêu cầu X-User-Id header

#### Lấy giao dịch pending tại quầy
```
GET /api/v1/transactions/pending-counter
```
- Lấy danh sách giao dịch tại quầy đang chờ xử lý của user
- Yêu cầu X-User-Id header

### 3.4 Dashboard

#### Staff Dashboard
```
GET /api/v1/transactions/staff/dashboard?pendingLimit=10&recentCustomersLimit=5
```
**Response:**
- stats: todayTransactions, todayAmount, pendingApprovals, customersServed
- pendingApprovals: list giao dịch pending của staff
- recentCustomers: khách hàng gần đây

#### Khách hàng gần đây (Staff)
```
GET /api/v1/transactions/staff/recent-customers?limit=5
```

#### Admin Dashboard
```
GET /api/v1/transactions/admin/dashboard?days=7
```
**Response:**
- totalTransactionsToday, totalAmountToday
- failedTransactionsToday, pendingTransactionsToday
- transactionCountsByType, transactionAmountsByType
- dailyStats: thống kê theo ngày (cho biểu đồ)
- recentTransactions: 10 giao dịch gần nhất

#### Admin: Lấy tất cả giao dịch
```
GET /api/v1/transactions/admin/all?page=0&size=20&type=DEPOSIT&status=SUCCESS
```
- Lấy tất cả giao dịch với bộ lọc
- Yêu cầu quyền Admin

---

## 4. Notification Service

### 4.1 User Notification APIs
```
GET /api/v1/notifications/me?page=0&size=50
```
- Lấy thông báo của user hiện tại

```
PATCH /api/v1/notifications/me/read-all
```
- Đánh dấu tất cả thông báo đã đọc

```
PATCH /api/v1/notifications/me/{notificationId}/read
```
- Đánh dấu một thông báo đã đọc

### 4.2 Admin Notification APIs
```
POST /api/v1/notifications
```
**Input:**
- userId, type, title, message
- channel: EMAIL, SMS, PUSH, IN_APP
- recipientEmail (required for EMAIL)
- recipientPhone (required for SMS)

**Logic:**
1. Validate channel requirements
2. Tạo notification với status = PENDING
3. Push qua WebSocket (real-time)
4. Gửi async theo channel

```
GET /api/v1/notifications/user/{userId}?page=0&size=20
```
- Lấy thông báo theo userId

```
GET /api/v1/notifications/user/{userId}/unread
```
- Lấy thông báo chưa đọc

```
GET /api/v1/notifications/user/{userId}/type/{type}
```
- Lấy thông báo theo loại

```
PATCH /api/v1/notifications/{notificationId}/read
```
- Đánh dấu đã đọc

```
PATCH /api/v1/notifications/user/{userId}/read-all
```
- Đánh dấu tất cả đã đọc cho user

```
POST /api/v1/notifications/{notificationId}/resend
```
- Gửi lại thông báo

```
GET /api/v1/notifications/user/{userId}/stats
```
- Thống kê thông báo

### 4.3 Gửi thông báo theo Channel

#### Email
```java
MimeMessage với HTML template:
- Header: Mini Banking System
- Content: title + message
- Footer: automated message disclaimer
```

#### SMS
```java
smsService.sendSms(phone, message)
```

#### Push Notification
```java
pushNotificationService.sendPushNotification(userId, deviceToken, title, message, platform)
```

#### In-App
- Tự động available qua WebSocket
- Status = SENT ngay lập tức

### 4.4 Notification Types
- TRANSACTION_SUCCESS, TRANSACTION_FAILED
- ACCOUNT_CREATED, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED
- ACCOUNT_FROZEN, ACCOUNT_UNFROZEN
- BALANCE_LOW, PAYMENT_DUE
- SECURITY_ALERT, SYSTEM_UPDATE, PROMOTIONAL

---

## 5. Admin Service

### 5.1 Quản lý User
```
GET /api/v1/admin/users                      # Lấy tất cả users
```

### 5.2 Lock/Unlock User
```
PATCH /api/v1/admin/lock/{userId}
PATCH /api/v1/admin/unlock/{userId}
```
**Logic:**
1. Gọi UserService.lockUser/unlockUser
2. Lấy accountId từ AccountService
3. Gọi AccountService.lockAccount/unlockAccount
4. Ghi AdminLog
5. Publish Kafka event

### 5.3 Freeze/Unfreeze User
```
PATCH /api/v1/admin/freeze/{userId}
PATCH /api/v1/admin/unfreeze/{userId}
```
**Logic:**
1. Lấy accountId từ AccountService
2. Gọi AccountService.freezeAccount/unfreezeAccount
3. Ghi AdminLog
4. Publish Kafka event

### 5.4 System Report
```
GET /api/v1/admin/report
```
**Response:**
- totalUsers
- userStatusCounts: {ACTIVE: x, FROZEN: y, LOCKED: z}
- transactionCountsByType (placeholder)

### 5.5 Admin Logs
```
GET /api/v1/admin/logs
```
- Lấy logs của admin actions

---

## 6. Log Service

### 6.1 Tạo Log (Internal)
```
POST /internal/logs
```
**Input:** userId, action, detail

### 6.2 Query Logs
```
GET /api/v1/admin/logs                             # Tất cả (admin)
GET /api/v1/logs/me                               # Của user hiện tại
GET /api/v1/admin/logs/search                      # Search với filters
GET /api/v1/admin/logs/statistics                  # Thống kê
```

**Filters:** userId, action, startTime, endTime, page, size, sortBy, sortDir

---

## Kafka Topics

| Topic | Producer | Consumer | Mô tả |
|-------|----------|----------|-------|
| USER_EVENTS | user-service | log-service | User events (register, login, logout, password change) |
| ACCOUNT_EVENTS | account-service | log-service, notification-service | Account events (create, freeze, lock) |
| TRANSACTION_EVENTS | transaction-service | notification-service, log-service | Giao dịch hoàn tất |
| COUNTER_DEPOSIT_NOTIFICATION | transaction-service | notification-service | Thông báo nạp tiền quầy cho staff |
| COUNTER_WITHDRAW_NOTIFICATION | transaction-service | notification-service | Thông báo rút tiền quầy cho staff |
| ADMIN_ACTION | admin-service, transaction-service | log-service | Admin actions log |
| ADMIN_EVENTS | admin-service | log-service, notification-service | Admin actions log |

---

## Security

### JWT Token Structure
```json
{
  "sub": "email@example.com",
  "userId": "uuid",
  "role": "CUSTOMER|STAFF|ADMIN",
  "iat": timestamp,
  "exp": timestamp
}
```

### Role-based Access
- **CUSTOMER**: Giao dịch cá nhân, KYC submit
- **COUNTER_STAFF**: Xác nhận giao dịch quầy, review KYC
- **COUNTER_ADMIN**: Quản lý quầy + quyền COUNTER_STAFF
- **ADMIN**: Full access

### Account Status Effects
| Status | Login | Transactions | Description |
|--------|-------|--------------|-------------|
| ACTIVE | ✅ | ✅ | Bình thường |
| FROZEN | ❌ | ❌ | Đóng băng (user/admin) |
| LOCKED | ❌ | ❌ | Khóa (admin only) |
| PENDING_KYC | ✅ | ❌ | Chờ xác minh |

---

## Error Handling

### Common Exceptions
- `NotFoundException`: Resource không tồn tại
- `BadRequestException`: Input không hợp lệ
- `IllegalStateException`: Trạng thái không cho phép action

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
