# Mini Banking System - API Documentation

## Tổng quan

Hệ thống Mini Banking sử dụng kiến trúc microservices. **Tất cả API đều được gọi thông qua API Gateway**.

### Base URL
```
http://localhost:8080/api/v1
```

> ⚠️ **QUAN TRỌNG:** Tất cả client (Frontend, Admin Hub) phải gọi API thông qua API Gateway. Không được gọi trực tiếp đến các services.

### Kiến trúc hệ thống

```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Admin Hub     │
│  localhost:3000 │     │  localhost:3001 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │     API Gateway       │
         │   localhost:8080      │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌────────┐    ┌────────────┐    ┌────────────┐
│ User   │    │ Account    │    │Transaction │
│Service │    │ Service    │    │ Service    │
│ :8081  │    │  :8082     │    │   :8083    │
└────────┘    └────────────┘    └────────────┘
```

| Service | Port | Mô tả |
|---------|------|-------|
| API Gateway | 8080 | **Điểm vào duy nhất** - routing tất cả requests |
| User Service | 8081 | Quản lý users, authentication, KYC |
| Account Service | 8082 | Quản lý tài khoản ngân hàng |
| Transaction Service | 8083 | Giao dịch: nạp/rút/chuyển tiền, quầy giao dịch |
| Admin Service | 8084 | Quản trị hệ thống |
| Log Service | 8085 | Ghi log hoạt động |
| Notification Service | 8086 | Thông báo real-time |

### API Gateway Routing

| Path Pattern | Target Service |
|--------------|----------------|
| `/api/v1/users/**` | User Service |
| `/api/v1/kyc/**` | User Service |
| `/api/v1/account/**` | Account Service |
| `/api/v1/transactions/**` | Transaction Service |
| `/api/v1/counters/**` | Transaction Service |
| `/api/v1/counter/**` | Transaction Service |
| `/api/v1/admin/**` | Admin Service |
| `/api/v1/logs/**` | Log Service |
| `/api/v1/admin/logs/**` | Log Service |
| `/api/v1/notifications/**` | Notification Service |

---

## 1. AUTHENTICATION APIs

### 1.1 Đăng ký tài khoản
```http
POST http://localhost:8080/api/v1/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123",
  "fullName": "Nguyen Van A",
  "phoneNumber": "0901234567"
}
```

**Response:** `201 Created`
```
User registered successfully.
```

### 1.2 Đăng nhập Customer
```http
POST http://localhost:8080/api/v1/users/login
Content-Type: application/json

{
  "email": "test.user@example.com",
  "password": "TestPassword#123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "CUSTOMER"
}
```

### 1.3 Đăng nhập Admin
```http
POST http://localhost:8080/api/v1/users/admin/login
Content-Type: application/json

{
  "email": "admin@minibank.com",
  "password": "Admin@123"
}
```

### 1.4 Đăng nhập Staff
```http
POST http://localhost:8080/api/v1/users/staff/login
Content-Type: application/json

{
  "email": "staff@minibank.com",
  "password": "Staff@123"
}
```

### 1.5 Đăng xuất
```http
POST http://localhost:8080/api/v1/users/logout
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`

### 1.6 Quên mật khẩu
```http
POST http://localhost:8080/api/v1/users/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 1.7 Đặt lại mật khẩu
```http
POST http://localhost:8080/api/v1/users/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword@123"
}
```

### 1.8 Refresh Token
```http
POST http://localhost:8080/api/v1/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

## 2. USER PROFILE APIs

### 2.1 Lấy thông tin user hiện tại
```http
GET http://localhost:8080/api/v1/users/me
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "message": "User info retrieved successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phoneNumber": "0901234567",
    "role": "CUSTOMER",
    "status": "ACTIVE"
  }
}
```

### 2.2 Tự khóa tài khoản
```http
PUT http://localhost:8080/api/v1/users/self-freeze
Authorization: Bearer {accessToken}
```

---

## 3. ADMIN USER MANAGEMENT APIs

### 3.1 Lấy danh sách tất cả users
```http
GET http://localhost:8080/api/v1/users/admin/users
Authorization: Bearer {adminToken}
```

### 3.2 Cập nhật thông tin user
```http
PUT http://localhost:8080/api/v1/users/admin/users/{userId}
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "fullName": "New Name",
  "phoneNumber": "0901234567"
}
```

### 3.3 Khóa tài khoản user
```http
PUT http://localhost:8080/api/v1/users/admin/users/{userId}/lock
Authorization: Bearer {adminToken}
```

### 3.4 Mở khóa tài khoản user
```http
PUT http://localhost:8080/api/v1/users/admin/users/{userId}/unlock
Authorization: Bearer {adminToken}
```

### 3.5 Đóng băng tài khoản user
```http
PUT http://localhost:8080/api/v1/users/admin/users/{userId}/freeze
Authorization: Bearer {adminToken}
```

### 3.6 Mở đóng băng tài khoản user
```http
PUT http://localhost:8080/api/v1/users/admin/users/{userId}/unfreeze
Authorization: Bearer {adminToken}
```

### 3.7 Xóa tài khoản user
```http
DELETE http://localhost:8080/api/v1/users/admin/users/{userId}
Authorization: Bearer {adminToken}
```

---

## 4. KYC APIs

### 4.1 Customer KYC

#### Gửi yêu cầu KYC
```http
POST http://localhost:8080/api/v1/kyc/submit
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "citizenId": "012345678901",
  "fullName": "Nguyen Van Test",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "placeOfIssue": "Ha Noi",
  "dateOfIssue": "2020-01-01",
  "expiryDate": "2030-01-01",
  "permanentAddress": "123 Test Street, Ha Noi",
  "currentAddress": "456 Current Street, Ha Noi",
  "phoneNumber": "0901234567",
  "frontIdImageUrl": "http://example.com/front.jpg",
  "backIdImageUrl": "http://example.com/back.jpg",
  "selfieImageUrl": "http://example.com/selfie.jpg"
}
```

**Response:**
```json
{
  "message": "KYC request submitted successfully",
  "data": {
    "kycId": "uuid",
    "userId": "uuid",
    "status": "PENDING",
    "submittedAt": "2024-01-01T10:00:00Z"
  }
}
```

#### Xem trạng thái KYC của mình
```http
GET http://localhost:8080/api/v1/kyc/my-status
Authorization: Bearer {accessToken}
```

#### Xem lịch sử KYC
```http
GET http://localhost:8080/api/v1/kyc/my-history
Authorization: Bearer {accessToken}
```

### 4.2 Admin/Staff KYC Management

#### Lấy danh sách KYC pending
```http
GET http://localhost:8080/api/v1/kyc/admin/pending?page=0&size=20
Authorization: Bearer {adminToken}
```

#### Lấy tất cả KYC requests
```http
GET http://localhost:8080/api/v1/kyc/admin/all?status=PENDING&page=0&size=20
Authorization: Bearer {adminToken}
```
*status: PENDING, APPROVED, REJECTED, RESUBMITTED*

#### Lấy KYC requests (alias)
```http
GET http://localhost:8080/api/v1/kyc/admin/requests?status=PENDING&page=0&size=20
Authorization: Bearer {adminToken}
```

#### Xem chi tiết KYC request
```http
GET http://localhost:8080/api/v1/kyc/admin/{kycId}
Authorization: Bearer {adminToken}
```

#### Review KYC (Approve/Reject)
```http
POST http://localhost:8080/api/v1/kyc/admin/{kycId}/review
Authorization: Bearer {adminToken}
Content-Type: application/json

# Approve:
{
  "status": "APPROVED",
  "notes": "Thông tin hợp lệ"
}

# Reject:
{
  "status": "REJECTED",
  "rejectionReason": "Ảnh CCCD không rõ nét"
}
```

#### Đếm số KYC pending
```http
GET http://localhost:8080/api/v1/kyc/admin/count-pending
Authorization: Bearer {adminToken}
```

```http
GET http://localhost:8080/api/v1/kyc/admin/pending-count
Authorization: Bearer {adminToken}
```

---

## 5. ACCOUNT APIs

### 5.1 Lấy thông tin tài khoản của mình
```http
GET http://localhost:8080/api/v1/account/me
X-User-Id: {userId}
```

**Response:**
```json
{
  "message": "Account info",
  "data": {
    "accountId": "uuid",
    "userId": "uuid",
    "accountNumber": "1234567890",
    "balance": 1000000,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### 5.2 Lấy trạng thái tài khoản
```http
GET http://localhost:8080/api/v1/account/status
X-User-Id: {userId}
```

**Response:**
```json
{
  "message": "Account status",
  "data": {
    "status": "ACTIVE"
  }
}
```

---

## 6. TRANSACTION APIs

### 6.1 Nạp tiền (E-wallet)
```http
POST http://localhost:8080/api/v1/transactions/deposit
X-User-Id: {userId}
Content-Type: application/json

{
  "amount": 1000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "type": "DEPOSIT",
    "amount": 1000000,
    "status": "COMPLETED",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### 6.2 Nạp tiền tại quầy
```http
POST http://localhost:8080/api/v1/transactions/deposit-counter
X-User-Id: {userId}
Content-Type: application/json

{
  "amount": 1000000,
  "counterId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "transactionCode": "EMP0011234221224",
    "type": "COUNTER_DEPOSIT",
    "amount": 1000000,
    "status": "PENDING",
    "counterId": "uuid",
    "staffId": "uuid",
    "createdAt": "2024-12-22T10:00:00Z"
  }
}
```

> **Lưu ý:** Mã giao dịch (transactionCode) được tạo theo format: `{employeeCode}{4 số cuối CCCD}{ddMMyy}`

### 6.3 Xác nhận nạp tiền tại quầy (Staff)
```http
POST http://localhost:8080/api/v1/transactions/deposit-counter/{transactionId}/confirm
X-User-Id: {staffId}
```

### 6.4 Hủy nạp tiền tại quầy
```http
POST http://localhost:8080/api/v1/transactions/deposit-counter/{transactionId}/cancel
X-User-Id: {userId}
```

### 6.5 Rút tiền
```http
POST http://localhost:8080/api/v1/transactions/withdraw
X-User-Id: {userId}
Content-Type: application/json

{
  "amount": 500000
}
```

### 6.6 Chuyển tiền
```http
POST http://localhost:8080/api/v1/transactions/transfer
X-User-Id: {userId}
Content-Type: application/json

{
  "amount": 500000,
  "toAccountId": "uuid"
}
```

### 6.7 Lịch sử giao dịch
```http
GET http://localhost:8080/api/v1/transactions/history?page=0&size=10&type=DEPOSIT&from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z
X-User-Id: {userId}
```
*type: DEPOSIT, WITHDRAW, TRANSFER, COUNTER_DEPOSIT*

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [...],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10
  }
}
```

### 6.8 Chi tiết giao dịch
```http
GET http://localhost:8080/api/v1/transactions/{transactionId}
X-User-Id: {userId}
```

### 6.9 Staff Dashboard
```http
GET http://localhost:8080/api/v1/transactions/staff/dashboard?pendingLimit=10&recentCustomersLimit=5
X-User-Id: {staffId}
```

### 6.10 Khách hàng gần đây (Staff)
```http
GET http://localhost:8080/api/v1/transactions/staff/recent-customers?limit=5
X-User-Id: {staffId}
```

---

## 7. COUNTER (QUẦY GIAO DỊCH) APIs

### 7.1 Public Counter APIs

#### Lấy danh sách quầy giao dịch
```http
GET http://localhost:8080/api/v1/counters
X-User-Role: ADMIN  # Optional - ADMIN thấy tất cả, user thường chỉ thấy active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "counterId": "uuid",
      "counterCode": "Q001",
      "name": "Quầy Giao Dịch 1",
      "address": "Tầng 1 - Khu A",
      "maxStaff": 5,
      "adminUserId": "uuid",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### Lấy chi tiết quầy
```http
GET http://localhost:8080/api/v1/counters/{counterId}
```

#### Lấy danh sách nhân viên của quầy
```http
GET http://localhost:8080/api/v1/counters/{counterId}/staff
```

### 7.2 Admin Counter Management

#### Tạo quầy giao dịch mới
```http
POST http://localhost:8080/api/v1/counters
X-User-Role: ADMIN
Content-Type: application/json

{
  "counterCode": "CG001",
  "name": "Quầy Cầu Giấy 1",
  "address": "123 Cầu Giấy, Hà Nội",
  "maxStaff": 5,
  "adminEmail": "counter.admin@minibank.com",
  "adminFullName": "Nguyen Van Admin",
  "adminPhoneNumber": "0901234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "counter": {
      "counterId": "uuid",
      "counterCode": "CG001",
      "name": "Quầy Cầu Giấy 1",
      "address": "123 Cầu Giấy, Hà Nội",
      "maxStaff": 5,
      "adminUserId": "uuid",
      "isActive": true
    },
    "adminAccount": {
      "userId": "uuid",
      "email": "counter.admin@minibank.com",
      "fullName": "Nguyen Van Admin",
      "role": "COUNTER_ADMIN",
      "temporaryPassword": "TempPass@123"
    }
  }
}
```

#### Cập nhật quầy giao dịch
```http
PUT http://localhost:8080/api/v1/counters/{counterId}
X-User-Role: ADMIN
Content-Type: application/json

{
  "counterCode": "CG001",
  "name": "Quầy Cầu Giấy 1 - Updated",
  "address": "456 Cầu Giấy, Hà Nội",
  "maxStaff": 10
}
```

#### Xóa quầy giao dịch (soft delete)
```http
DELETE http://localhost:8080/api/v1/counters/{counterId}
X-User-Role: ADMIN
```

#### Kích hoạt lại quầy
```http
PUT http://localhost:8080/api/v1/counters/{counterId}/reactivate
X-User-Role: ADMIN
```

#### Thêm nhân viên vào quầy
```http
POST http://localhost:8080/api/v1/counters/{counterId}/staff
X-User-Role: ADMIN
Content-Type: application/json

{
  "userId": "uuid"
}
# hoặc
{
  "email": "staff@minibank.com"
}
```

#### Xóa nhân viên khỏi quầy
```http
DELETE http://localhost:8080/api/v1/counters/{counterId}/staff/{staffUserId}
X-User-Role: ADMIN
```

#### Chỉ định admin quầy
```http
PATCH http://localhost:8080/api/v1/counters/{counterId}/admin-user
X-User-Role: ADMIN
Content-Type: application/json

{
  "adminUserId": "uuid"
}
# hoặc
{
  "email": "counter.admin@minibank.com"
}
```

### 7.3 Counter Admin APIs

#### Kiểm tra có phải admin quầy không
```http
GET http://localhost:8080/api/v1/counter/admin/check
X-User-Id: {userId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCounterAdmin": true
  }
}
```

#### Lấy thông tin quầy mình quản lý
```http
GET http://localhost:8080/api/v1/counter/admin/my-counter
X-User-Id: {userId}
```

#### Lấy danh sách nhân viên trong quầy (Counter Admin)
```http
GET http://localhost:8080/api/v1/counter/admin/{counterId}/staff
X-User-Id: {adminUserId}
```

#### Thêm nhân viên vào quầy (Counter Admin)
```http
POST http://localhost:8080/api/v1/counter/admin/{counterId}/staff
X-User-Id: {adminUserId}
Content-Type: application/json

{
  "userId": "uuid"
}
# hoặc
{
  "email": "staff@minibank.com"
}
```

#### Cập nhật trạng thái nhân viên (Counter Admin)
```http
PUT http://localhost:8080/api/v1/counter/admin/{counterId}/staff/{staffUserId}
X-User-Id: {adminUserId}
Content-Type: application/json

{
  "isActive": false
}
```

#### Xóa nhân viên khỏi quầy (Counter Admin)
```http
DELETE http://localhost:8080/api/v1/counter/admin/{counterId}/staff/{staffUserId}
X-User-Id: {adminUserId}
```

---

## 8. ADMIN SERVICE APIs

### 8.1 Lấy danh sách users
```http
GET http://localhost:8080/api/v1/admin/users
Authorization: Bearer {adminToken}
```

### 8.2 Khóa user
```http
PATCH http://localhost:8080/api/v1/admin/lock/{userId}
Authorization: Bearer {adminToken}
X-User-Id: {adminId}
```

### 8.3 Mở khóa user
```http
PATCH http://localhost:8080/api/v1/admin/unlock/{userId}
Authorization: Bearer {adminToken}
X-User-Id: {adminId}
```

### 8.4 Đóng băng user
```http
PATCH http://localhost:8080/api/v1/admin/freeze/{userId}
Authorization: Bearer {adminToken}
X-User-Id: {adminId}
```

### 8.5 Mở đóng băng user
```http
PATCH http://localhost:8080/api/v1/admin/unfreeze/{userId}
Authorization: Bearer {adminToken}
X-User-Id: {adminId}
```

### 8.6 Báo cáo hệ thống
```http
GET http://localhost:8080/api/v1/admin/report
Authorization: Bearer {adminToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalTransactionsToday": 45,
    "totalAmount": 125000000,
    "failedTransactions": 2,
    "transactionCountsByType": {
      "DEPOSIT": 20,
      "WITHDRAW": 15,
      "TRANSFER": 10
    },
    "userStatusCounts": {
      "ACTIVE": 120,
      "LOCKED": 5,
      "FROZEN": 10,
      "PENDING_KYC": 15
    }
  }
}
```

### 8.7 Admin Dashboard (Transaction Statistics)
```http
GET http://localhost:8080/api/v1/transactions/admin/dashboard?days=7
X-User-Role: ADMIN
Authorization: Bearer {adminToken}
```

**Parameters:**
- `days` (optional): Số ngày thống kê (1-30, mặc định: 7)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactionsToday": 45,
    "totalAmountToday": 125000000,
    "failedTransactionsToday": 2,
    "pendingTransactionsToday": 5,
    "transactionCountsByType": {
      "DEPOSIT": 20,
      "WITHDRAW": 15,
      "TRANSFER": 8,
      "COUNTER_DEPOSIT": 2
    },
    "transactionAmountsByType": {
      "DEPOSIT": 50000000,
      "WITHDRAW": 30000000,
      "TRANSFER": 40000000,
      "COUNTER_DEPOSIT": 5000000
    },
    "dailyStats": [
      {
        "date": "2024-12-22",
        "depositCount": 10,
        "withdrawCount": 5,
        "transferCount": 3,
        "counterDepositCount": 1,
        "depositAmount": 25000000,
        "withdrawAmount": 15000000,
        "transferAmount": 20000000,
        "counterDepositAmount": 2000000
      }
    ],
    "recentTransactions": [
      {
        "transactionId": "uuid",
        "type": "DEPOSIT",
        "amount": 1000000,
        "status": "SUCCESS",
        "timestamp": "2024-12-22T10:00:00Z"
      }
    ]
  }
}
```

### 8.8 Admin: Lấy tất cả giao dịch
```http
GET http://localhost:8080/api/v1/transactions/admin/all?page=0&size=20&type=DEPOSIT&status=SUCCESS
X-User-Role: ADMIN
Authorization: Bearer {adminToken}
```

**Parameters:**
- `page` (optional): Số trang (mặc định: 0)
- `size` (optional): Số lượng mỗi trang (mặc định: 20)
- `type` (optional): DEPOSIT, WITHDRAW, TRANSFER, COUNTER_DEPOSIT
- `status` (optional): PENDING, SUCCESS, FAILED, CANCELLED
- `from` (optional): Thời gian bắt đầu (ISO 8601)
- `to` (optional): Thời gian kết thúc (ISO 8601)

---

## 9. LOG SERVICE APIs

### 9.1 Lấy logs của mình
```http
GET http://localhost:8080/api/v1/logs/me?page=0&size=20&sortBy=time&sortDir=DESC
X-User-Id: {userId}
```

### 9.2 Admin: Lấy tất cả logs
```http
GET http://localhost:8080/api/v1/admin/logs?page=0&size=20&sortBy=time&sortDir=DESC
```

### 9.3 Admin: Tìm kiếm logs
```http
GET http://localhost:8080/api/v1/admin/logs/search?userId={userId}&action=LOGIN&startTime=2024-01-01T00:00:00&endTime=2024-12-31T23:59:59&page=0&size=20
```

### 9.4 Admin: Thống kê logs
```http
GET http://localhost:8080/api/v1/admin/logs/statistics?userId={userId}&startTime=2024-01-01T00:00:00&endTime=2024-12-31T23:59:59
```

---

## 10. NOTIFICATION APIs

### 10.1 User Notification APIs

#### Lấy thông báo của mình
```http
GET http://localhost:8080/api/v1/notifications/me?page=0&size=50
X-User-Id: {userId}
```

#### Đánh dấu tất cả đã đọc
```http
PATCH http://localhost:8080/api/v1/notifications/me/read-all
X-User-Id: {userId}
```

#### Đánh dấu một thông báo đã đọc
```http
PATCH http://localhost:8080/api/v1/notifications/me/{notificationId}/read
X-User-Id: {userId}
```

### 10.2 Admin Notification APIs

#### Tạo thông báo
```http
POST http://localhost:8080/api/v1/notifications
X-User-Id: {userId}
Content-Type: application/json

{
  "userId": "uuid",
  "title": "Tiêu đề thông báo",
  "message": "Nội dung thông báo",
  "type": "TRANSACTION"
}
```
*type: TRANSACTION, SECURITY, SYSTEM, PROMOTION*

#### Lấy thông báo theo userId
```http
GET http://localhost:8080/api/v1/notifications/user/{userId}?page=0&size=20
```

#### Lấy thông báo chưa đọc
```http
GET http://localhost:8080/api/v1/notifications/user/{userId}/unread
```

#### Lấy thông báo theo loại
```http
GET http://localhost:8080/api/v1/notifications/user/{userId}/type/{type}
```

#### Đánh dấu đã đọc
```http
PATCH http://localhost:8080/api/v1/notifications/{notificationId}/read
```

#### Đánh dấu tất cả đã đọc cho user
```http
PATCH http://localhost:8080/api/v1/notifications/user/{userId}/read-all
```

#### Gửi lại thông báo
```http
POST http://localhost:8080/api/v1/notifications/{notificationId}/resend
```

#### Thống kê thông báo
```http
GET http://localhost:8080/api/v1/notifications/user/{userId}/stats
```

---

## 11. INTERNAL APIs (Service-to-Service)

> ⚠️ **Lưu ý:** Các API internal chỉ được gọi giữa các services, không expose ra ngoài qua API Gateway.

### Account Service Internal APIs
- `POST /internal/accounts/create` - Tạo tài khoản
- `GET /internal/accounts/by-user/{userId}` - Lấy tài khoản theo userId
- `GET /internal/accounts/{accountId}` - Lấy tài khoản theo ID
- `GET /internal/accounts/{accountId}/balance` - Lấy số dư
- `PATCH /internal/accounts/{accountId}/update-balance` - Cập nhật số dư
- `POST /internal/accounts/transfer` - Chuyển tiền internal
- `PATCH /internal/accounts/{accountId}/freeze` - Đóng băng
- `PATCH /internal/accounts/{accountId}/unfreeze` - Mở đóng băng
- `PATCH /internal/accounts/{accountId}/lock` - Khóa
- `PATCH /internal/accounts/{accountId}/unlock` - Mở khóa
- `POST /internal/accounts/activate-kyc/{userId}` - Kích hoạt sau KYC

### User Service Internal APIs
- `GET /internal/users` - Lấy tất cả users
- `GET /internal/users/{id}` - Lấy user theo ID
- `GET /internal/users/by-email?email={email}` - Lấy user theo email
- `POST /internal/users/employees` - Tạo nhân viên
- `PATCH /internal/users/{id}/lock` - Khóa user
- `PATCH /internal/users/{id}/unlock` - Mở khóa user
- `PATCH /internal/users/{id}/freeze` - Đóng băng user
- `PATCH /internal/users/{id}/unfreeze` - Mở đóng băng user

---

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| test.user@example.com | TestPassword#123 | CUSTOMER |
| admin@minibank.com | Admin@123 | ADMIN |
| staff@minibank.com | Staff@123 | STAFF |
| counter.admin@minibank.com | CounterAdmin@123 | COUNTER_ADMIN |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "timestamp": "2024-01-01T00:00:00Z",
    "path": "/api/v1/endpoint"
  }
}
```

---

## Status & Enums

### KYC Status Flow
```
PENDING → APPROVED → (Account activated)
        ↘ REJECTED → RESUBMITTED → PENDING
```

### Account Status
| Status | Mô tả |
|--------|-------|
| `PENDING_KYC` | Chờ xác minh KYC |
| `ACTIVE` | Hoạt động bình thường |
| `FROZEN` | Đóng băng (user tự khóa hoặc admin khóa) |
| `LOCKED` | Khóa (vi phạm chính sách) |

### Transaction Type
| Type | Mô tả |
|------|-------|
| `DEPOSIT` | Nạp tiền (e-wallet) |
| `COUNTER_DEPOSIT` | Nạp tiền tại quầy |
| `WITHDRAW` | Rút tiền |
| `TRANSFER` | Chuyển tiền |

### Transaction Status
| Status | Mô tả |
|--------|-------|
| `PENDING` | Chờ xử lý |
| `COMPLETED` | Hoàn thành |
| `CANCELLED` | Đã hủy |
| `FAILED` | Thất bại |

### Notification Type
| Type | Mô tả |
|------|-------|
| `TRANSACTION` | Thông báo giao dịch |
| `SECURITY` | Thông báo bảo mật |
| `SYSTEM` | Thông báo hệ thống |
| `PROMOTION` | Thông báo khuyến mãi |

### User Role
| Role | Mô tả |
|------|-------|
| `CUSTOMER` | Khách hàng |
| `STAFF` | Nhân viên |
| `COUNTER_ADMIN` | Admin quầy giao dịch |
| `COUNTER_STAFF` | Nhân viên quầy giao dịch |
| `ADMIN` | Quản trị viên (duyệt KYC) |

---

## Headers

### Authentication Headers
| Header | Mô tả | Ví dụ |
|--------|-------|-------|
| `Authorization` | JWT Bearer token | `Bearer eyJhbGciOiJIUzI1NiJ9...` |
| `X-User-Id` | User ID (UUID) | `550e8400-e29b-41d4-a716-446655440000` |
| `X-User-Role` | User role | `ADMIN`, `STAFF`, `CUSTOMER` |

---

## Error Codes

| Code | HTTP Status | Mô tả |
|------|-------------|-------|
| `UNAUTHORIZED` | 401 | Chưa xác thực |
| `FORBIDDEN` | 403 | Không có quyền |
| `NOT_FOUND` | 404 | Không tìm thấy |
| `BAD_REQUEST` | 400 | Request không hợp lệ |
| `INVALID_USER_ID` | 400 | User ID không hợp lệ |
| `ACCOUNT_FROZEN` | 403 | Tài khoản bị đóng băng |
| `ACCOUNT_LOCKED` | 403 | Tài khoản bị khóa |
| `INSUFFICIENT_BALANCE` | 400 | Số dư không đủ |
| `KYC_PENDING` | 400 | KYC đang chờ xử lý |
| `KYC_REJECTED` | 400 | KYC bị từ chối |
