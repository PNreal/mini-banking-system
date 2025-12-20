# Logic Các Luồng Hoạt Động - Mini Banking System

## 📋 Tổng Quan Hệ Thống

Hệ thống Mini Banking được xây dựng theo kiến trúc **Microservices** với 7 services chính:

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (8080)                        │
│                    (Routing, CORS, Load Balancing)              │
└────────────┬────────────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────┬──────────┬──────────┬──────────┐
    │                 │          │          │          │          │
┌───▼────┐  ┌────▼────┐  ┌──▼───┐  ┌──▼───┐  ┌──▼───┐  ┌──▼───┐
│ User   │  │ Account │  │Trans │  │Admin │  │ Log  │  │Notif │
│Service │  │ Service │  │Svc   │  │Svc   │  │Svc   │  │Svc   │
│ 8081   │  │  8082   │  │ 8083 │  │ 8084 │  │ 8085 │  │ 8086 │
└───┬────┘  └────┬────┘  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘
    │            │           │         │         │         │
┌───▼────────────▼───────────▼─────────▼─────────▼─────────▼────┐
│                    Kafka Message Bus                            │
└─────────────────────────────────────────────────────────────────┘
    │            │           │         │         │         │
┌───▼────┐  ┌───▼────┐  ┌──▼───┐  ┌──▼───┐  ┌──▼───┐  ┌──▼───┐
│user_db │  │acct_db │  │trans │  │admin │  │log_db│  │notif │
│        │  │        │  │_db   │  │_db   │  │      │  │_db   │
└────────┘  └────────┘  └──────┘  └──────┘  └──────┘  └──────┘
```

---

## 🔐 1. LUỒNG ĐĂNG KÝ & ĐĂNG NHẬP

### 1.1. Đăng Ký Người Dùng (Customer Registration)


**Endpoint:** `POST /api/v1/users/register`

**Luồng xử lý:**

```
1. Frontend gửi request với:
   - email
   - password
   - fullName
   - citizenId (CCCD)

2. User Service nhận request:
   ├─→ Validate dữ liệu (email format, password strength)
   ├─→ Kiểm tra email đã tồn tại chưa
   ├─→ Hash password (BCrypt)
   ├─→ Tạo user mới với:
   │   - role = CUSTOMER
   │   - status = ACTIVE
   │   - emailVerified = false
   └─→ Lưu vào database (users table)

3. Publish Kafka event: "USER_REGISTERED"
   ├─→ Account Service nhận event
   │   └─→ Tự động tạo tài khoản ngân hàng
   │       - Generate account_number (12 số)
   │       - balance = 0
   │       - status = ACTIVE
   │
   ├─→ Notification Service nhận event
   │   └─→ Gửi email chào mừng
   │       - Type: ACCOUNT_CREATED
   │       - Channel: EMAIL
   │
   └─→ Log Service nhận event
       └─→ Ghi log "USER_REGISTERED"

4. Response trả về: "Đăng ký thành công"
```

**Validation Rules:**
- Email: Phải đúng format, unique
- Password: Tối thiểu 6 ký tự
- Full Name: Bắt buộc
- Citizen ID: Bắt buộc cho CUSTOMER


---

### 1.2. Đăng Nhập (Login)

**Endpoints:**
- Customer: `POST /api/v1/users/login`
- Admin: `POST /api/v1/users/admin/login`
- Staff: `POST /api/v1/users/staff/login`

**Luồng xử lý:**

```
1. Frontend gửi: { email, password }

2. User Service xử lý:
   ├─→ Tìm user theo email
   ├─→ Kiểm tra user tồn tại
   ├─→ Kiểm tra status:
   │   - LOCKED → Trả lỗi "Tài khoản bị khóa"
   │   - FROZEN → Trả lỗi "Tài khoản bị đóng băng"
   │   - ACTIVE → Tiếp tục
   │
   ├─→ Verify password (BCrypt.matches)
   │   - Sai → Tăng failed_login_attempts
   │   - Nếu failed_login_attempts >= 5:
   │     └─→ Khóa tạm thời 15 phút (login_locked_until)
   │   - Đúng → Reset failed_login_attempts = 0
   │
   ├─→ Kiểm tra role phù hợp với endpoint
   │   - /login → CUSTOMER
   │   - /admin/login → ADMIN
   │   - /staff/login → STAFF, COUNTER_ADMIN
   │
   ├─→ Generate JWT tokens:
   │   - Access Token (expire: 1h)
   │   - Refresh Token (expire: 7 days)
   │
   └─→ Lưu refresh_token vào database

3. Publish Kafka event: "USER_LOGGED_IN"
   └─→ Log Service ghi log

4. Response trả về:
   {
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc...",
     "user": {
       "userId": "uuid",
       "email": "user@example.com",
       "fullName": "Nguyen Van A",
       "role": "CUSTOMER"
     }
   }
```

**Security Features:**
- Password hashing với BCrypt
- JWT token-based authentication
- Auto-lock sau 5 lần đăng nhập sai
- Refresh token rotation
- Role-based access control


---

### 1.3. Refresh Token

**Endpoint:** `POST /api/v1/users/refresh-token`

**Luồng xử lý:**

```
1. Frontend gửi: { refreshToken }

2. User Service:
   ├─→ Validate refresh token (JWT signature)
   ├─→ Kiểm tra token trong database
   ├─→ Kiểm tra expiry
   ├─→ Generate access token mới
   └─→ Response: { accessToken, refreshToken }

3. Frontend lưu token mới và tiếp tục request
```

---

### 1.4. Đăng Xuất (Logout)

**Endpoint:** `POST /api/v1/users/logout`

**Luồng xử lý:**

```
1. Frontend gửi token trong header

2. User Service:
   ├─→ Extract userId từ token
   ├─→ Xóa refresh_token trong database
   └─→ Response: 200 OK

3. Frontend xóa tokens khỏi localStorage
```

---

## 💰 2. LUỒNG GIAO DỊCH (TRANSACTIONS)

### 2.1. Nạp Tiền Ví Điện Tử (E-Wallet Deposit)

**Endpoint:** `POST /api/v1/transactions/deposit`

**Luồng xử lý:**

```
1. Frontend gửi:
   {
     "amount": 1000000,
     "method": "E_WALLET"
   }
   Header: X-User-Id: <userId>

2. Transaction Service:
   ├─→ Validate amount > 0
   ├─→ Gọi Account Service để lấy account
   │   GET /internal/accounts/user/{userId}
   │
   ├─→ Tạo transaction:
   │   - type = DEPOSIT
   │   - status = SUCCESS (ví điện tử tự động thành công)
   │   - from_acc = null
   │   - to_acc = accountId
   │   - amount = 1000000
   │
   ├─→ Gọi Account Service để cập nhật số dư:
   │   POST /internal/accounts/{accountId}/credit
   │   { "amount": 1000000 }
   │
   └─→ Lưu transaction vào database

3. Publish Kafka event: "TRANSACTION_COMPLETED"
   ├─→ Notification Service
   │   └─→ Gửi thông báo:
   │       "Bạn vừa nạp 1,000,000 VND thành công"
   │       Type: TRANSACTION_SUCCESS
   │       Channel: EMAIL + IN_APP
   │
   └─→ Log Service
       └─→ Ghi log giao dịch

4. Response:
   {
     "transactionId": "uuid",
     "amount": 1000000,
     "type": "DEPOSIT",
     "status": "SUCCESS",
     "timestamp": "2025-12-20T10:30:00"
   }
```


---

### 2.2. Nạp Tiền Tại Quầy (Counter Deposit)

**Endpoint:** `POST /api/v1/transactions/deposit-counter`

**Luồng xử lý (2 bước):**

#### Bước 1: Customer tạo yêu cầu nạp tiền

```
1. Frontend gửi:
   {
     "amount": 5000000,
     "counterCode": "Q001"
   }
   Header: X-User-Id: <customerId>

2. Transaction Service:
   ├─→ Validate amount
   ├─→ Tìm counter theo counterCode
   ├─→ Kiểm tra counter active
   ├─→ Lấy account của customer
   │
   ├─→ Tạo transaction:
   │   - type = COUNTER_DEPOSIT
   │   - status = PENDING (chờ staff xác nhận)
   │   - to_acc = accountId
   │   - amount = 5000000
   │   - counter_id = counterId
   │   - transaction_code = "CD" + timestamp
   │
   └─→ Lưu vào database

3. Publish Kafka event: "COUNTER_DEPOSIT_REQUESTED"
   └─→ Notification Service
       └─→ Gửi thông báo cho staff tại quầy Q001:
           "Có yêu cầu nạp tiền mới: 5,000,000 VND"
           "Mã giao dịch: CD1234567890"

4. Response:
   {
     "transactionId": "uuid",
     "transactionCode": "CD1234567890",
     "status": "PENDING",
     "message": "Vui lòng đến quầy Q001 và cung cấp mã giao dịch"
   }
```

#### Bước 2: Staff xác nhận giao dịch

```
1. Staff tại quầy nhận thông báo
2. Customer đến quầy, cung cấp:
   - Mã giao dịch: CD1234567890
   - Tiền mặt: 5,000,000 VND

3. Staff xác nhận:
   POST /api/v1/transactions/deposit-counter/{transactionId}/confirm
   Header: X-User-Id: <staffId>

4. Transaction Service:
   ├─→ Kiểm tra transaction tồn tại
   ├─→ Kiểm tra status = PENDING
   ├─→ Kiểm tra staff thuộc quầy này
   │
   ├─→ Cập nhật transaction:
   │   - status = SUCCESS
   │   - staff_id = staffId
   │   - confirmed_at = now
   │
   ├─→ Gọi Account Service cập nhật số dư:
   │   POST /internal/accounts/{accountId}/credit
   │
   └─→ Lưu vào database

5. Publish Kafka event: "COUNTER_DEPOSIT_CONFIRMED"
   ├─→ Notification Service
   │   └─→ Gửi cho customer:
   │       "Nạp tiền thành công: 5,000,000 VND"
   │       "Số dư mới: 10,000,000 VND"
   │
   └─→ Log Service ghi log

6. Response: Transaction details với status = SUCCESS
```

#### Bước 2b: Staff hủy giao dịch (nếu có vấn đề)

```
POST /api/v1/transactions/deposit-counter/{transactionId}/cancel
Header: X-User-Id: <staffId>

→ Cập nhật status = CANCELLED
→ Gửi thông báo cho customer
```


---

### 2.3. Rút Tiền (Withdraw)

**Endpoint:** `POST /api/v1/transactions/withdraw`

**Luồng xử lý:**

```
1. Frontend gửi:
   {
     "amount": 2000000,
     "method": "E_WALLET"
   }
   Header: X-User-Id: <userId>

2. Transaction Service:
   ├─→ Validate amount > 0
   ├─→ Lấy account của user
   │
   ├─→ Kiểm tra số dư:
   │   GET /internal/accounts/{accountId}
   │   if (balance < amount) → Trả lỗi "Số dư không đủ"
   │
   ├─→ Tạo transaction:
   │   - type = WITHDRAW
   │   - status = SUCCESS
   │   - from_acc = accountId
   │   - to_acc = null
   │   - amount = 2000000
   │
   ├─→ Gọi Account Service trừ tiền:
   │   POST /internal/accounts/{accountId}/debit
   │   { "amount": 2000000 }
   │
   └─→ Lưu transaction

3. Publish Kafka event: "TRANSACTION_COMPLETED"
   └─→ Notification Service gửi thông báo

4. Response: Transaction details
```

**Business Rules:**
- Số dư phải đủ để rút
- Không cho phép rút số âm
- Có thể set giới hạn rút tiền/ngày (tùy chọn)

---

### 2.4. Chuyển Khoản (Transfer)

**Endpoint:** `POST /api/v1/transactions/transfer`

**Luồng xử lý:**

```
1. Frontend gửi:
   {
     "toAccountNumber": "123456789012",
     "amount": 3000000,
     "description": "Chuyển tiền mua hàng"
   }
   Header: X-User-Id: <fromUserId>

2. Transaction Service:
   ├─→ Validate amount > 0
   │
   ├─→ Lấy account nguồn:
   │   GET /internal/accounts/user/{fromUserId}
   │
   ├─→ Lấy account đích:
   │   GET /internal/accounts/by-number/{toAccountNumber}
   │   if (not found) → Trả lỗi "Tài khoản không tồn tại"
   │
   ├─→ Kiểm tra không tự chuyển cho mình:
   │   if (fromAccount == toAccount) → Trả lỗi
   │
   ├─→ Kiểm tra số dư:
   │   if (fromAccount.balance < amount) → Trả lỗi
   │
   ├─→ Tạo transaction:
   │   - type = TRANSFER
   │   - status = SUCCESS
   │   - from_acc = fromAccountId
   │   - to_acc = toAccountId
   │   - amount = 3000000
   │   - description = "Chuyển tiền mua hàng"
   │
   ├─→ Atomic update (transaction):
   │   1. Trừ tiền từ account nguồn:
   │      POST /internal/accounts/{fromAccountId}/debit
   │   2. Cộng tiền vào account đích:
   │      POST /internal/accounts/{toAccountId}/credit
   │
   └─→ Lưu transaction

3. Publish Kafka event: "TRANSFER_COMPLETED"
   ├─→ Notification Service:
   │   - Gửi cho người gửi: "Chuyển tiền thành công"
   │   - Gửi cho người nhận: "Bạn nhận được 3,000,000 VND"
   │
   └─→ Log Service ghi log

4. Response: Transaction details
```

**Transaction Safety:**
- Sử dụng database transaction để đảm bảo atomicity
- Nếu 1 trong 2 bước (debit/credit) fail → Rollback toàn bộ
- Lock account khi đang xử lý để tránh race condition


---

### 2.5. Xem Lịch Sử Giao Dịch

**Endpoint:** `GET /api/v1/transactions/history`

**Luồng xử lý:**

```
1. Frontend gửi:
   GET /api/v1/transactions/history?page=0&size=10&type=ALL
   Header: X-User-Id: <userId>

2. Transaction Service:
   ├─→ Lấy account của user
   ├─→ Query transactions:
   │   - WHERE from_acc = accountId OR to_acc = accountId
   │   - Filter by type (nếu có)
   │   - ORDER BY timestamp DESC
   │   - LIMIT page, size
   │
   └─→ Map sang TransactionResponse

3. Response:
   {
     "content": [
       {
         "transactionId": "uuid",
         "type": "TRANSFER",
         "amount": 3000000,
         "status": "SUCCESS",
         "timestamp": "2025-12-20T10:30:00",
         "description": "Chuyển tiền mua hàng"
       },
       ...
     ],
     "page": 0,
     "size": 10,
     "totalElements": 45,
     "totalPages": 5
   }
```

**Filter Options:**
- type: ALL, DEPOSIT, WITHDRAW, TRANSFER, COUNTER_DEPOSIT
- status: ALL, SUCCESS, PENDING, FAILED, CANCELLED
- dateFrom, dateTo: Lọc theo khoảng thời gian

---

## 👥 3. LUỒNG QUẢN LÝ NGƯỜI DÙNG (ADMIN)

### 3.1. Xem Danh Sách Users

**Endpoint:** `GET /api/v1/users/admin/users`

**Luồng xử lý:**

```
1. Admin gửi request:
   Header: Authorization: Bearer <adminToken>

2. API Gateway:
   ├─→ Verify JWT token
   ├─→ Extract role từ token
   └─→ if (role != ADMIN) → 403 Forbidden

3. User Service:
   ├─→ Query tất cả users
   ├─→ Map sang UserResponse (không trả password)
   └─→ Response: List<UserResponse>

4. Frontend hiển thị table với:
   - Email, Họ tên, Role, Status
   - Actions: Edit, Lock/Unlock, Freeze/Unfreeze, Delete
```


---

### 3.2. Tạo User Mới (Admin)

**Endpoint:** `POST /api/v1/users/admin/users`

**Luồng xử lý:**

```
1. Admin điền form:
   {
     "email": "newstaff@minibank.com",
     "password": "Staff@123",
     "fullName": "Nguyen Van B",
     "role": "STAFF",
     "employeeCode": "CS123456"
   }

2. User Service:
   ├─→ Validate email unique
   ├─→ Validate role (CUSTOMER/STAFF/ADMIN/COUNTER_ADMIN)
   ├─→ Hash password
   ├─→ Tạo user với:
   │   - status = ACTIVE
   │   - emailVerified = true (admin tạo nên auto-verified)
   │
   └─→ Lưu vào database

3. Publish Kafka event: "USER_CREATED_BY_ADMIN"
   ├─→ Account Service tạo account (nếu là CUSTOMER)
   ├─→ Notification Service gửi email welcome
   └─→ Log Service ghi log

4. Response: UserResponse
```

**Conditional Fields:**
- CUSTOMER: Bắt buộc citizenId
- STAFF/ADMIN/COUNTER_ADMIN: Bắt buộc employeeCode

---

### 3.3. Cập Nhật User

**Endpoint:** `PUT /api/v1/users/admin/users/{userId}`

**Luồng xử lý:**

```
1. Admin sửa thông tin:
   {
     "fullName": "Nguyen Van B (Updated)",
     "role": "COUNTER_ADMIN",
     "employeeCode": "CA123456"
   }

2. User Service:
   ├─→ Tìm user theo userId
   ├─→ Cập nhật các trường được gửi
   ├─→ Validate role change (nếu có)
   └─→ Lưu vào database

3. Publish Kafka event: "USER_UPDATED"
   └─→ Log Service ghi log

4. Response: UserResponse updated
```

**Note:** Không cho phép sửa email và password qua endpoint này

---

### 3.4. Khóa/Mở Khóa Tài Khoản

**Endpoints:**
- Lock: `PUT /api/v1/users/admin/users/{userId}/lock`
- Unlock: `PUT /api/v1/users/admin/users/{userId}/unlock`

**Luồng xử lý:**

```
1. Admin click "Khóa tài khoản"

2. User Service:
   ├─→ Tìm user
   ├─→ Cập nhật status = LOCKED (hoặc ACTIVE)
   ├─→ Xóa refresh_token (force logout)
   └─→ Lưu vào database

3. Publish Kafka event: "ACCOUNT_LOCKED"
   ├─→ Notification Service:
   │   └─→ Gửi email cho user:
   │       "Tài khoản của bạn đã bị khóa"
   │       "Liên hệ admin để biết thêm chi tiết"
   │
   └─→ Admin Service:
       └─→ Ghi log admin action:
           - admin_id = adminId
           - action = LOCK
           - target_user = userId
           - timestamp = now

4. Response: 200 OK
```

**Effect:**
- User bị logout ngay lập tức
- Không thể đăng nhập lại
- Không thể thực hiện giao dịch


---

### 3.5. Đóng Băng/Mở Băng Tài Khoản

**Endpoints:**
- Freeze: `PUT /api/v1/users/admin/users/{userId}/freeze`
- Unfreeze: `PUT /api/v1/users/admin/users/{userId}/unfreeze`

**Luồng xử lý:**

```
1. Admin click "Đóng băng"

2. User Service:
   ├─→ Cập nhật status = FROZEN
   └─→ Lưu vào database

3. Publish Kafka event: "ACCOUNT_FROZEN"
   ├─→ Notification Service gửi thông báo
   └─→ Admin Service ghi log

4. Response: 200 OK
```

**Khác biệt LOCKED vs FROZEN:**
- **LOCKED**: Không thể đăng nhập, không thể giao dịch
- **FROZEN**: Có thể đăng nhập, KHÔNG thể giao dịch (chỉ xem)

---

### 3.6. Xóa User

**Endpoint:** `DELETE /api/v1/users/admin/users/{userId}`

**Luồng xử lý:**

```
1. Admin click "Xóa" → Confirmation dialog

2. User Service:
   ├─→ Tìm user
   ├─→ Kiểm tra có thể xóa không:
   │   - Không cho xóa chính mình
   │   - Không cho xóa admin cuối cùng
   │
   ├─→ Hard delete từ database
   │   (Hoặc soft delete: set deleted_at = now)
   │
   └─→ Xóa refresh_token

3. Publish Kafka event: "USER_DELETED"
   ├─→ Account Service:
   │   └─→ Đóng account (set status = CLOSED)
   │
   ├─→ Transaction Service:
   │   └─→ Không xóa transactions (giữ lại để audit)
   │
   └─→ Log Service ghi log

4. Response: 200 OK
```

**Note:** Nên dùng soft delete để giữ lại dữ liệu audit

---

## 🏢 4. LUỒNG QUẢN LÝ QUẦY GIAO DỊCH

### 4.1. Tạo Quầy Mới (Tự Động Tạo Admin)

**Endpoint:** `POST /api/v1/counters`

**Luồng xử lý:**

```
1. Admin tổng điền form:
   {
     "counterCode": "Q005",
     "name": "Quầy Gò Vấp",
     "address": "123 Quang Trung, Gò Vấp",
     "maxStaff": 10,
     "adminEmail": "admin.q005@minibank.com",
     "adminFullName": "Tran Van C",
     "adminPhoneNumber": "0901234567"
   }

2. Transaction Service:
   ├─→ Validate counterCode unique
   ├─→ Kiểm tra có adminEmail không
   │
   ├─→ Nếu có adminEmail:
   │   └─→ Gọi User Service tạo admin:
   │       POST /internal/users/employees
   │       {
   │         "email": "admin.q005@minibank.com",
   │         "fullName": "Tran Van C",
   │         "phoneNumber": "0901234567",
   │         "role": "COUNTER_ADMIN"
   │       }
   │       
   │       User Service:
   │       ├─→ Generate employeeCode: "CA123456"
   │       ├─→ Generate password: "Abc123!@#Xyz"
   │       ├─→ Tạo user với:
   │       │   - role = COUNTER_ADMIN
   │       │   - status = ACTIVE
   │       │   - emailVerified = true
   │       └─→ Response: { userId, employeeCode, generatedPassword }
   │
   ├─→ Tạo counter:
   │   - counter_code = "Q005"
   │   - admin_user_id = userId (từ response trên)
   │   - is_active = true
   │
   ├─→ Tự động thêm admin vào counter_staff:
   │   - counter_id = counterId
   │   - user_id = adminUserId
   │   - is_active = true
   │
   └─→ Lưu vào database

3. Response:
   {
     "counter": {
       "counterId": "uuid",
       "counterCode": "Q005",
       "name": "Quầy Gò Vấp",
       "adminUserId": "admin-uuid"
     },
     "adminAccount": {
       "userId": "admin-uuid",
       "email": "admin.q005@minibank.com",
       "employeeCode": "CA123456",
       "generatedPassword": "Abc123!@#Xyz"
     }
   }
```

**Important:**
- Password chỉ hiển thị 1 lần, admin phải lưu lại ngay
- Employee code tự động sinh, format: CA + 6 số
- Admin tự động được thêm vào danh sách nhân viên quầy


---

### 4.2. Cập Nhật Quầy

**Endpoint:** `PUT /api/v1/counters/{counterId}`

**Luồng xử lý:**

```
1. Admin sửa thông tin:
   {
     "counterCode": "Q005",
     "name": "Quầy Gò Vấp (Updated)",
     "address": "456 Quang Trung, Gò Vấp",
     "maxStaff": 15
   }

2. Transaction Service:
   ├─→ Tìm counter
   ├─→ Validate counterCode unique (nếu thay đổi)
   ├─→ Cập nhật thông tin
   └─→ Lưu vào database

3. Response: CounterResponse updated
```

---

### 4.3. Xóa Quầy (Soft Delete)

**Endpoint:** `DELETE /api/v1/counters/{counterId}`

**Luồng xử lý:**

```
1. Admin click "Xóa quầy" → Confirmation

2. Transaction Service:
   ├─→ Tìm counter
   ├─→ Kiểm tra có giao dịch PENDING không
   │   if (có) → Trả lỗi "Không thể xóa, còn giao dịch chờ xử lý"
   │
   ├─→ Soft delete:
   │   - is_active = false
   │   - updated_at = now
   │
   └─→ Lưu vào database

3. Response: 200 OK
```

**Note:** Không xóa vĩnh viễn để giữ lại lịch sử giao dịch

---

### 4.4. Quản Lý Nhân Viên Trong Quầy (Counter Admin)

#### 4.4.1. Xem Danh Sách Nhân Viên

**Endpoint:** `GET /api/v1/counter-admin/{counterId}/staff`

**Luồng xử lý:**

```
1. Counter Admin gửi request:
   Header: X-User-Id: <counterAdminId>

2. Transaction Service:
   ├─→ Kiểm tra user có phải admin của quầy này không
   ├─→ Query counter_staff WHERE counter_id = counterId
   ├─→ Gọi User Service lấy thông tin chi tiết:
   │   POST /internal/users/batch
   │   { "userIds": [userId1, userId2, ...] }
   │
   └─→ Map sang CounterAdminStaffResponse

3. Response:
   [
     {
       "userId": "uuid",
       "email": "staff1@minibank.com",
       "fullName": "Nguyen Van D",
       "employeeCode": "CS123456",
       "isActive": true,
       "addedAt": "2025-12-01T10:00:00"
     },
     ...
   ]
```


---

#### 4.4.2. Thêm Nhân Viên Vào Quầy

**Endpoint:** `POST /api/v1/counter-admin/{counterId}/staff`

**Luồng xử lý:**

```
1. Counter Admin điền form:
   {
     "email": "staff2@minibank.com"
   }
   (hoặc "userId": "uuid")

2. Transaction Service:
   ├─→ Kiểm tra quyền counter admin
   ├─→ Tìm user theo email/userId
   ├─→ Validate:
   │   - User phải có role STAFF hoặc COUNTER_STAFF
   │   - Chưa thuộc quầy này
   │   - Quầy chưa đầy (current < maxStaff)
   │
   ├─→ Tạo counter_staff:
   │   - counter_id = counterId
   │   - user_id = userId
   │   - is_active = true
   │
   └─→ Lưu vào database

3. Publish Kafka event: "STAFF_ADDED_TO_COUNTER"
   └─→ Notification Service:
       └─→ Gửi email cho staff:
           "Bạn đã được thêm vào Quầy Gò Vấp"

4. Response: CounterAdminStaffResponse
```

---

#### 4.4.3. Cập Nhật Trạng Thái Nhân Viên

**Endpoint:** `PUT /api/v1/counter-admin/{counterId}/staff/{staffUserId}`

**Luồng xử lý:**

```
1. Counter Admin toggle trạng thái:
   {
     "isActive": false
   }

2. Transaction Service:
   ├─→ Kiểm tra quyền
   ├─→ Tìm counter_staff
   ├─→ Cập nhật is_active
   └─→ Lưu vào database

3. Response: CounterAdminStaffResponse updated
```

**Use Case:**
- Tạm thời vô hiệu hóa nhân viên (nghỉ phép, chuyển quầy tạm thời)
- Không xóa khỏi database

---

#### 4.4.4. Gỡ Nhân Viên Khỏi Quầy

**Endpoint:** `DELETE /api/v1/counter-admin/{counterId}/staff/{staffUserId}`

**Luồng xử lý:**

```
1. Counter Admin click "Gỡ nhân viên"

2. Transaction Service:
   ├─→ Kiểm tra quyền
   ├─→ Kiểm tra không phải admin quầy
   │   (Admin quầy không thể tự gỡ mình)
   ├─→ Xóa counter_staff
   └─→ Lưu vào database

3. Publish Kafka event: "STAFF_REMOVED_FROM_COUNTER"
   └─→ Notification Service gửi thông báo

4. Response: 200 OK
```

---

## 📋 5. LUỒNG XÁC MINH KYC

### 5.1. Customer Nộp Hồ Sơ KYC

**Endpoint:** `POST /api/v1/kyc/submit`

**Luồng xử lý:**

```
1. Customer điền form KYC:
   {
     "citizenId": "079099001234",
     "fullName": "Nguyen Van A",
     "dateOfBirth": "1990-01-01",
     "gender": "MALE",
     "placeOfIssue": "TP.HCM",
     "dateOfIssue": "2020-01-01",
     "expiryDate": "2030-01-01",
     "permanentAddress": "123 ABC Street",
     "currentAddress": "456 XYZ Street",
     "phoneNumber": "0901234567",
     "email": "user@example.com",
     "frontIdImageUrl": "https://storage/front.jpg",
     "backIdImageUrl": "https://storage/back.jpg",
     "selfieImageUrl": "https://storage/selfie.jpg"
   }

2. User Service:
   ├─→ Validate dữ liệu
   ├─→ Kiểm tra citizenId chưa được dùng
   ├─→ Tạo KYC request:
   │   - user_id = userId
   │   - status = PENDING
   │   - created_at = now
   │
   └─→ Lưu vào database

3. Publish Kafka event: "KYC_SUBMITTED"
   ├─→ Notification Service:
   │   └─→ Gửi cho customer:
   │       "Hồ sơ KYC đã được nộp"
   │       "Chúng tôi sẽ xác minh trong 24h"
   │
   └─→ Notification cho KYC Staff:
       "Có hồ sơ KYC mới cần xác minh"

4. Response: KycResponse với status = PENDING
```


---

### 5.2. Staff Xác Minh KYC

**Endpoint:** `POST /internal/kyc/{kycId}/review`

**Luồng xử lý:**

#### Trường hợp APPROVE:

```
1. KYC Staff review hồ sơ:
   {
     "status": "APPROVED",
     "notes": "Thông tin chính xác, hình ảnh rõ ràng"
   }
   Header: X-User-Id: <staffId>

2. User Service:
   ├─→ Tìm KYC request
   ├─→ Kiểm tra status = PENDING
   ├─→ Cập nhật:
   │   - status = APPROVED
   │   - verified_by = staffId
   │   - verified_at = now
   │   - notes = "..."
   │
   └─→ Lưu vào database

3. Publish Kafka event: "KYC_APPROVED"
   ├─→ Notification Service:
   │   └─→ Gửi cho customer:
   │       "Hồ sơ KYC đã được phê duyệt"
   │       "Bạn có thể sử dụng đầy đủ tính năng"
   │
   └─→ Log Service ghi log

4. Response: KycResponse với status = APPROVED
```

#### Trường hợp REJECT:

```
1. KYC Staff từ chối:
   {
     "status": "REJECTED",
     "rejectionReason": "Hình ảnh CCCD mờ, không rõ",
     "notes": "Vui lòng chụp lại hình ảnh"
   }

2. User Service:
   ├─→ Validate rejectionReason bắt buộc
   ├─→ Cập nhật:
   │   - status = REJECTED
   │   - verified_by = staffId
   │   - verified_at = now
   │   - rejection_reason = "..."
   │
   └─→ Lưu vào database

3. Publish Kafka event: "KYC_REJECTED"
   └─→ Notification Service:
       └─→ Gửi cho customer:
           "Hồ sơ KYC bị từ chối"
           "Lý do: Hình ảnh CCCD mờ, không rõ"
           "Vui lòng nộp lại hồ sơ"

4. Response: KycResponse với status = REJECTED
```

---

### 5.3. Customer Nộp Lại Hồ Sơ

**Endpoint:** `PUT /api/v1/kyc/{kycId}/resubmit`

**Luồng xử lý:**

```
1. Customer sửa thông tin và nộp lại:
   {
     "frontIdImageUrl": "https://storage/front_new.jpg",
     "backIdImageUrl": "https://storage/back_new.jpg",
     "selfieImageUrl": "https://storage/selfie_new.jpg"
   }

2. User Service:
   ├─→ Tìm KYC request
   ├─→ Kiểm tra status = REJECTED
   ├─→ Cập nhật thông tin mới
   ├─→ Cập nhật status = RESUBMITTED → PENDING
   └─→ Lưu vào database

3. Publish Kafka event: "KYC_RESUBMITTED"
   └─→ Notification cho KYC Staff

4. Response: KycResponse với status = PENDING
```

---

## 🔔 6. LUỒNG THÔNG BÁO (NOTIFICATIONS)

### 6.1. Tạo Thông Báo (Internal)

**Endpoint:** `POST /internal/notifications`

**Luồng xử lý:**

```
1. Service khác gọi (qua Kafka hoặc REST):
   {
     "userId": "uuid",
     "type": "TRANSACTION_SUCCESS",
     "title": "Giao dịch thành công",
     "message": "Bạn vừa nạp 1,000,000 VND thành công",
     "channel": "EMAIL",
     "recipientEmail": "user@example.com"
   }

2. Notification Service:
   ├─→ Tạo notification:
   │   - status = PENDING
   │   - created_at = now
   │
   ├─→ Lưu vào database
   │
   ├─→ Push real-time qua WebSocket:
   │   └─→ Gửi đến /topic/notifications/{userId}
   │
   └─→ Gửi async theo channel:
       ├─→ EMAIL: JavaMailSender
       ├─→ SMS: SmsService
       ├─→ PUSH: PushNotificationService
       └─→ IN_APP: Chỉ lưu DB + WebSocket

3. Sau khi gửi thành công:
   ├─→ Cập nhật status = SENT
   ├─→ Cập nhật sent_at = now
   └─→ Lưu vào database

4. Nếu gửi thất bại:
   ├─→ Cập nhật status = FAILED
   └─→ Retry scheduler sẽ thử lại sau
```


---

### 6.2. Lấy Thông Báo (Customer)

**Endpoint:** `GET /api/notifications`

**Luồng xử lý:**

```
1. Frontend gửi:
   GET /api/notifications?page=0&size=10
   Header: Authorization: Bearer <token>

2. Notification Service:
   ├─→ Extract userId từ token
   ├─→ Query notifications:
   │   WHERE user_id = userId
   │   ORDER BY created_at DESC
   │   LIMIT page, size
   │
   └─→ Map sang NotificationResponse

3. Response:
   {
     "content": [
       {
         "notificationId": "uuid",
         "type": "TRANSACTION_SUCCESS",
         "title": "Giao dịch thành công",
         "message": "Bạn vừa nạp 1,000,000 VND",
         "status": "SENT",
         "createdAt": "2025-12-20T10:30:00",
         "readAt": null
       },
       ...
     ],
     "unreadCount": 5,
     "totalElements": 45
   }
```

---

### 6.3. Đánh Dấu Đã Đọc

**Endpoint:** `POST /api/notifications/{notificationId}/read`

**Luồng xử lý:**

```
1. User click vào notification

2. Notification Service:
   ├─→ Tìm notification
   ├─→ Kiểm tra thuộc về user
   ├─→ Cập nhật:
   │   - status = READ
   │   - read_at = now
   │
   └─→ Lưu vào database

3. Response: 200 OK
```

---

### 6.4. WebSocket Real-time

**Connection:**

```
1. Frontend kết nối WebSocket:
   const socket = new SockJS('/ws/notifications');
   const stompClient = Stomp.over(socket);

2. Authenticate:
   stompClient.connect(
     { Authorization: 'Bearer ' + token },
     onConnected
   );

3. Subscribe:
   stompClient.subscribe(
     '/topic/notifications/' + userId,
     onNotificationReceived
   );

4. Khi có notification mới:
   ├─→ Notification Service push message
   ├─→ Frontend nhận real-time
   ├─→ Hiển thị toast/badge
   └─→ Cập nhật unread count
```

---

## 📊 7. LUỒNG LOGGING & AUDIT

### 7.1. Ghi Log Hệ Thống

**Kafka Consumer:**

```
1. Mọi service publish events lên Kafka:
   - USER_REGISTERED
   - USER_LOGGED_IN
   - TRANSACTION_COMPLETED
   - ACCOUNT_LOCKED
   - ...

2. Log Service consume events:
   ├─→ Parse event data
   ├─→ Tạo log entry:
   │   - user_id
   │   - action
   │   - detail (JSON)
   │   - time
   │
   └─→ Lưu vào log_db

3. Logs có thể query sau này để:
   - Audit trail
   - Debug issues
   - Analytics
   - Compliance
```

---

### 7.2. Admin Action Logs

**Luồng xử lý:**

```
1. Admin thực hiện action (lock/unlock/freeze/...)

2. Admin Service:
   ├─→ Tạo admin_log:
   │   - admin_id = adminId
   │   - action = "LOCK"
   │   - target_user = userId
   │   - time = now
   │
   └─→ Lưu vào admin_db

3. Admin có thể xem logs:
   GET /api/admin/logs?targetUser={userId}
   
   Response: Lịch sử tất cả actions với user này
```

---

## 🔄 8. LUỒNG KAFKA EVENT-DRIVEN

### 8.1. Event Flow

```
┌─────────────┐
│   Service   │
│  (Producer) │
└──────┬──────┘
       │ publish event
       ▼
┌─────────────┐
│    Kafka    │
│   Topics    │
└──────┬──────┘
       │ consume
       ▼
┌─────────────┐
│  Services   │
│ (Consumers) │
└─────────────┘
```

### 8.2. Kafka Topics

| Topic | Producer | Consumers | Purpose |
|-------|----------|-----------|---------|
| USER_EVENTS | User Service | Account, Notification, Log | User lifecycle events |
| TRANSACTION_EVENTS | Transaction Service | Notification, Log | Transaction events |
| ADMIN_EVENTS | Admin Service | Notification, Log | Admin actions |
| KYC_EVENTS | User Service | Notification, Log | KYC workflow |
| COUNTER_EVENTS | Transaction Service | Notification, Log | Counter management |


---

### 8.3. Event Examples

#### USER_REGISTERED Event:

```json
{
  "eventType": "USER_REGISTERED",
  "userId": "uuid",
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "role": "CUSTOMER",
  "timestamp": "2025-12-20T10:30:00"
}
```

**Consumers:**
- Account Service → Tạo account
- Notification Service → Gửi welcome email
- Log Service → Ghi log

#### TRANSACTION_COMPLETED Event:

```json
{
  "eventType": "TRANSACTION_COMPLETED",
  "transactionId": "uuid",
  "userId": "uuid",
  "type": "DEPOSIT",
  "amount": 1000000,
  "status": "SUCCESS",
  "timestamp": "2025-12-20T10:30:00"
}
```

**Consumers:**
- Notification Service → Gửi thông báo
- Log Service → Ghi log

---

## 🔐 9. SECURITY & AUTHORIZATION

### 9.1. JWT Token Flow

```
1. User đăng nhập thành công
   ↓
2. User Service generate JWT:
   - Access Token (1h)
   - Refresh Token (7 days)
   ↓
3. Frontend lưu tokens:
   - localStorage hoặc httpOnly cookie
   ↓
4. Mọi request gửi token:
   Authorization: Bearer <accessToken>
   ↓
5. API Gateway verify token:
   ├─→ Valid → Forward request với headers:
   │   - X-User-Id: userId
   │   - X-User-Role: role
   │   - X-User-Email: email
   │
   └─→ Invalid → 401 Unauthorized
   ↓
6. Service nhận request với user context
```

### 9.2. Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **CUSTOMER** | - Xem account của mình<br>- Thực hiện giao dịch<br>- Xem lịch sử giao dịch<br>- Nộp KYC<br>- Xem thông báo |
| **STAFF** | - Xác nhận giao dịch tại quầy<br>- Xem danh sách customers<br>- Xem thông báo |
| **COUNTER_ADMIN** | - Tất cả quyền của STAFF<br>- Quản lý nhân viên trong quầy<br>- Xem báo cáo quầy |
| **ADMIN** | - Tất cả quyền<br>- Quản lý users<br>- Quản lý counters<br>- Xem logs<br>- Xem báo cáo hệ thống |

### 9.3. Authorization Check

```java
// Trong mỗi endpoint
@GetMapping("/admin/users")
public ResponseEntity<?> getAllUsers(
    @RequestHeader("X-User-Role") String role
) {
    if (!"ADMIN".equals(role)) {
        return ResponseEntity.status(403).body("Forbidden");
    }
    // ... xử lý
}
```

---

## 🎯 10. BUSINESS RULES

### 10.1. Transaction Rules

1. **Deposit:**
   - Amount > 0
   - Không giới hạn số tiền nạp
   - E-wallet: Tự động thành công
   - Counter: Cần staff xác nhận

2. **Withdraw:**
   - Amount > 0
   - Balance >= Amount
   - Có thể set giới hạn rút/ngày (tùy chọn)

3. **Transfer:**
   - Amount > 0
   - Balance >= Amount
   - Không tự chuyển cho mình
   - Account đích phải tồn tại và ACTIVE

### 10.2. Account Rules

1. **Account Creation:**
   - Tự động tạo khi user đăng ký
   - Account number: 12 chữ số unique
   - Initial balance: 0
   - Status: ACTIVE

2. **Account Status:**
   - ACTIVE: Có thể giao dịch
   - FROZEN: Không thể giao dịch
   - LOCKED: Không thể đăng nhập
   - CLOSED: Đã đóng (không thể mở lại)

### 10.3. Counter Rules

1. **Staff Assignment:**
   - Mỗi quầy có 1 admin
   - Số staff <= maxStaff
   - Staff có thể thuộc nhiều quầy
   - Admin quầy cũng là staff của quầy đó

2. **Counter Deposit:**
   - Chỉ staff của quầy mới xác nhận được
   - Transaction timeout: 24h (tự động cancel)
   - Customer phải cung cấp mã giao dịch

### 10.4. KYC Rules

1. **Submission:**
   - Mỗi user chỉ có 1 KYC request active
   - Bắt buộc upload 3 hình: Front, Back, Selfie
   - Citizen ID phải unique

2. **Review:**
   - Chỉ KYC Staff mới review được
   - Reject phải có lý do
   - Approve không cần lý do (có thể có notes)

3. **Resubmit:**
   - Chỉ resubmit được khi status = REJECTED
   - Có thể sửa tất cả thông tin
   - Status chuyển về PENDING

---

## 📈 11. PERFORMANCE & SCALABILITY

### 11.1. Database Indexes

**Quan trọng nhất:**
- users: email, status, role
- accounts: user_id, account_number, status
- transactions: from_acc, to_acc, status, timestamp
- notifications: user_id, status, created_at
- counter_staff: counter_id, user_id

### 11.2. Caching Strategy

**Redis Cache (tùy chọn):**
- User sessions
- Account balances (với TTL ngắn)
- Counter information
- Notification counts

### 11.3. Async Processing

**Sử dụng @Async cho:**
- Gửi email
- Gửi SMS
- Push notifications
- Kafka event publishing
- Log writing

### 11.4. Load Balancing

```
API Gateway có thể scale horizontal:
- Multiple instances
- Load balancer (Nginx/HAProxy)
- Session sticky (nếu cần)
```

---

## 🐛 12. ERROR HANDLING

### 12.1. Common Error Responses

```json
{
  "status": "ERROR",
  "message": "Số dư không đủ",
  "errorCode": "INSUFFICIENT_BALANCE",
  "timestamp": "2025-12-20T10:30:00"
}
```

### 12.2. HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Error | Server error |

### 12.3. Retry Mechanism

**Notification Service:**
- Failed notifications → Retry sau 5 phút
- Max retries: 3 lần
- Sau đó mark as FAILED vĩnh viễn

**Transaction Service:**
- Network errors → Retry ngay lập tức
- Timeout → Rollback transaction
- Database errors → Log và alert admin

---

## 📝 13. TESTING SCENARIOS

### 13.1. Happy Path

1. ✅ User đăng ký → Tạo account → Nhận email
2. ✅ User đăng nhập → Nhận token → Access resources
3. ✅ User nạp tiền → Balance tăng → Nhận thông báo
4. ✅ User chuyển khoản → Balance giảm → Người nhận tăng
5. ✅ Admin tạo quầy → Tạo admin quầy → Nhận password

### 13.2. Error Cases

1. ❌ Đăng ký email trùng → 409 Conflict
2. ❌ Đăng nhập sai password → 401 Unauthorized
3. ❌ Chuyển khoản không đủ tiền → 400 Bad Request
4. ❌ Staff xác nhận giao dịch không thuộc quầy → 403 Forbidden
5. ❌ Admin xóa user đang có giao dịch PENDING → 400 Bad Request

### 13.3. Edge Cases

1. 🔄 Concurrent transfers → Lock mechanism
2. 🔄 Token expired mid-request → Refresh token
3. 🔄 Kafka down → Queue messages, retry
4. 🔄 Database connection lost → Retry with backoff
5. 🔄 Email service down → Mark FAILED, retry later

---

## 🎓 14. BEST PRACTICES

### 14.1. Code Organization

```
service/
├── controller/     # REST endpoints
├── service/        # Business logic
├── repository/     # Database access
├── model/          # Entities
├── dto/            # Data transfer objects
├── config/         # Configuration
├── exception/      # Custom exceptions
└── util/           # Utilities
```

### 14.2. Naming Conventions

- **Endpoints:** `/api/v1/resource` (kebab-case)
- **DTOs:** `ResourceRequest`, `ResourceResponse`
- **Services:** `ResourceService`
- **Repositories:** `ResourceRepository`
- **Entities:** `Resource` (singular)

### 14.3. Documentation

- ✅ README.md cho mỗi service
- ✅ API documentation (Swagger/OpenAPI)
- ✅ Database schema documentation
- ✅ Deployment guide
- ✅ Troubleshooting guide

---

## 🚀 15. DEPLOYMENT

### 15.1. Development

```powershell
# Start infrastructure
docker-compose up -d

# Start services
.\start-services.ps1

# Start frontend
.\start-frontend.ps1
```

### 15.2. Production (Tương lai)

```
1. Containerize services (Docker)
2. Orchestration (Kubernetes)
3. CI/CD pipeline (GitHub Actions)
4. Monitoring (Prometheus + Grafana)
5. Logging (ELK Stack)
6. Secrets management (Vault)
```

---

## 📚 16. TÀI LIỆU THAM KHẢO

- [README.md](./README.md) - Tổng quan hệ thống
- [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Hướng dẫn khởi động
- [DATABASE_OVERVIEW.md](./DATABASE_OVERVIEW.md) - Cấu trúc database
- [COUNTER_IMPLEMENTATION_SUMMARY.md](./COUNTER_IMPLEMENTATION_SUMMARY.md) - Quản lý quầy
- [KYC_IMPLEMENTATION_SUMMARY.md](./KYC_IMPLEMENTATION_SUMMARY.md) - Xác minh KYC
- [USER_MANAGEMENT_IMPLEMENTATION.md](./USER_MANAGEMENT_IMPLEMENTATION.md) - Quản lý user
- [NOTIFICATION_SYSTEM_OVERVIEW.md](./NOTIFICATION_SYSTEM_OVERVIEW.md) - Hệ thống thông báo
- [AUTO_CREATE_COUNTER_ADMIN_SUMMARY.md](./AUTO_CREATE_COUNTER_ADMIN_SUMMARY.md) - Tạo admin quầy

---

**Phiên bản:** 1.0  
**Cập nhật:** 2025-12-20  
**Tác giả:** Mini Banking System Team
