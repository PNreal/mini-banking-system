# Mini Banking System - Database Overview

## Tổng quan hệ thống Database

Hệ thống Mini Banking sử dụng kiến trúc microservices với 6 services chính, mỗi service có database riêng.

---

## 1. User Service Database (`user_db`)

**Service**: user-service  
**Init Script**: ✅ `docker/init-scripts/user-service-init.sql`

### Bảng: `users`
Lưu trữ thông tin người dùng (customers, staff, admin)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| user_id | UUID | Primary key |
| email | VARCHAR(100) | Email (unique) |
| password_hash | VARCHAR(255) | Mật khẩu đã hash |
| full_name | VARCHAR(150) | Họ tên |
| status | VARCHAR(20) | ACTIVE/FROZEN/LOCKED |
| role | VARCHAR(20) | CUSTOMER/STAFF/ADMIN |
| citizen_id | VARCHAR(20) | Số CCCD/CMND |
| employee_code | VARCHAR(20) | Mã nhân viên |
| reset_token | VARCHAR(255) | Token reset password |
| reset_token_expiry | TIMESTAMP | Hết hạn reset token |
| refresh_token | VARCHAR(255) | JWT refresh token |
| refresh_token_expiry | TIMESTAMP | Hết hạn refresh token |
| failed_login_attempts | INTEGER | Số lần đăng nhập sai |
| login_locked_until | TIMESTAMP | Khóa tạm thời đến |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**Indexes**: email, status, role, reset_token, refresh_token

**Sample Data**: 
- 1 admin
- 2 staff (staff1, staff2)
- 4 customers

---

### Bảng: `kyc_requests`
Lưu trữ yêu cầu xác minh KYC (Know Your Customer)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| kyc_id | UUID | Primary key |
| user_id | UUID | Foreign key → users |
| citizen_id | VARCHAR(20) | Số CCCD |
| full_name | VARCHAR(150) | Họ tên |
| date_of_birth | DATE | Ngày sinh |
| gender | VARCHAR(10) | Giới tính |
| place_of_issue | VARCHAR(100) | Nơi cấp |
| date_of_issue | DATE | Ngày cấp |
| expiry_date | DATE | Ngày hết hạn |
| permanent_address | VARCHAR(200) | Địa chỉ thường trú |
| current_address | VARCHAR(200) | Địa chỉ hiện tại |
| phone_number | VARCHAR(20) | Số điện thoại |
| email | VARCHAR(100) | Email |
| front_id_image_url | VARCHAR(500) | URL ảnh CCCD mặt trước |
| back_id_image_url | VARCHAR(500) | URL ảnh CCCD mặt sau |
| selfie_image_url | VARCHAR(500) | URL ảnh chân dung |
| status | VARCHAR(20) | PENDING/APPROVED/REJECTED/RESUBMITTED |
| verified_by | UUID | Staff xác minh |
| verified_at | TIMESTAMP | Thời điểm xác minh |
| rejection_reason | VARCHAR(500) | Lý do từ chối |
| notes | VARCHAR(1000) | Ghi chú |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**Indexes**: user_id, status, citizen_id, verified_by, created_at

**Sample Data**: 4 KYC requests (1 APPROVED, 2 PENDING, 1 REJECTED)

---

## 2. Account Service Database (`account_db`)

**Service**: account-service  
**Init Script**: ❌ THIẾU - Cần tạo `docker/init-scripts/account-service-init.sql`

### Bảng: `accounts`
Lưu trữ tài khoản ngân hàng

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| id | UUID | Primary key |
| account_number | VARCHAR(20) | Số tài khoản (unique, 12 chữ số) |
| user_id | UUID | Foreign key → users (unique) |
| balance | DECIMAL(18,2) | Số dư |
| status | VARCHAR(20) | ACTIVE/FROZEN/LOCKED |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**Indexes**: Cần tạo cho user_id, account_number, status

**Sample Data**: ❌ Không có - Cần tạo

**Note**: 
- Bảng được Hibernate tự động tạo
- Số tài khoản được generate tự động (12 chữ số)
- Có backfill mechanism cho account_number

---

## 3. Transaction Service Database (`transaction_db`)

**Service**: transaction-service  
**Init Script**: ✅ `docker/init-scripts/transaction-service-init.sql` (chỉ comment)

### Bảng: `transactions`
Lưu trữ giao dịch

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| trans_id | UUID | Primary key |
| from_acc | UUID | Tài khoản nguồn |
| to_acc | UUID | Tài khoản đích |
| amount | DECIMAL(18,2) | Số tiền |
| type | VARCHAR(20) | DEPOSIT/WITHDRAW/TRANSFER/COUNTER_DEPOSIT |
| status | VARCHAR(20) | PENDING/SUCCESS/FAILED/CANCELLED |
| timestamp | TIMESTAMP | Thời điểm giao dịch |
| transaction_code | VARCHAR(50) | Mã giao dịch |
| staff_id | UUID | Nhân viên xử lý |
| counter_id | UUID | Quầy giao dịch |

**Indexes**: Cần tạo cho from_acc, to_acc, status, timestamp, staff_id

**Sample Data**: ❌ Không có

---

### Bảng: `counters`
Lưu trữ quầy giao dịch

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| counter_id | UUID | Primary key |
| counter_code | VARCHAR(20) | Mã quầy (unique) |
| name | VARCHAR(100) | Tên quầy |
| address | VARCHAR(200) | Địa chỉ |
| max_staff | INTEGER | Số nhân viên tối đa |
| admin_user_id | UUID | Admin quầy |
| is_active | BOOLEAN | Trạng thái hoạt động |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**Indexes**: Cần tạo cho counter_code, admin_user_id, is_active

**Sample Data**: ✅ 20 counters (Q001-Q020) được tạo bởi TestCounterAdminInitializer.java

---

### Bảng: `counter_staff`
Liên kết nhân viên với quầy

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| counter_staff_id | UUID | Primary key |
| counter_id | UUID | Foreign key → counters |
| user_id | UUID | Foreign key → users |
| is_active | BOOLEAN | Trạng thái |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**Unique Constraint**: (counter_id, user_id)

**Sample Data**: ✅ Được tạo bởi TestCounterAdminInitializer.java

---

## 4. Log Service Database (`log_db`)

**Service**: log-service  
**Init Script**: ✅ `docker/init-scripts/log-service-init.sql`

### Bảng: `log`
Lưu trữ logs hệ thống

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| log_id | UUID | Primary key |
| user_id | UUID | User thực hiện action |
| action | VARCHAR(255) | Loại action |
| detail | TEXT | Chi tiết |
| time | TIMESTAMP | Thời điểm |

**Indexes**: user_id, time, action

**Sample Data**: ❌ Không có

---

## 5. Notification Service Database (`notification_db`)

**Service**: notification-service  
**Init Script**: ❌ THIẾU - Cần tạo `docker/init-scripts/notification-service-init.sql`

### Bảng: `notifications`
Lưu trữ thông báo

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| notification_id | UUID | Primary key |
| user_id | UUID | User nhận thông báo |
| type | VARCHAR(50) | Loại thông báo (enum) |
| title | VARCHAR(200) | Tiêu đề |
| message | TEXT | Nội dung |
| recipient_email | VARCHAR(255) | Email nhận |
| recipient_phone | VARCHAR(20) | SĐT nhận |
| status | VARCHAR(20) | PENDING/SENT/DELIVERED/FAILED/READ |
| channel | VARCHAR(20) | EMAIL/SMS/PUSH/IN_APP |
| sent_at | TIMESTAMP | Thời điểm gửi |
| read_at | TIMESTAMP | Thời điểm đọc |
| created_at | TIMESTAMP | Thời gian tạo |

**Indexes**: Cần tạo cho user_id, status, type, created_at

**Sample Data**: ❌ Không có

**Notification Types**:
- TRANSACTION_SUCCESS, TRANSACTION_FAILED
- ACCOUNT_CREATED, ACCOUNT_LOCKED, ACCOUNT_UNLOCKED
- ACCOUNT_FROZEN, ACCOUNT_UNFROZEN
- BALANCE_LOW, PAYMENT_DUE
- SECURITY_ALERT, SYSTEM_UPDATE, PROMOTIONAL

---

## 6. Admin Service Database (`admin_db`)

**Service**: admin-service  
**Init Script**: ❌ THIẾU - Cần tạo `docker/init-scripts/admin-service-init.sql`

### Bảng: `admin_logs`
Lưu trữ logs của admin actions

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| admin_log_id | UUID | Primary key |
| admin_id | UUID | Admin thực hiện |
| action | VARCHAR(100) | Action (FREEZE/UNFREEZE/LOCK/UNLOCK) |
| target_user | UUID | User bị tác động |
| time | TIMESTAMP | Thời điểm |

**Indexes**: admin_id, target_user, time

**Sample Data**: ❌ Không có

---

## Tổng kết

### ✅ Đã hoàn thiện:
1. **User Service** - users, kyc_requests (có init script + sample data)
2. **Log Service** - log (có init script)

### ⚠️ Hoàn thiện một phần:
3. **Transaction Service** - transactions, counters, counter_staff (entity có, init script comment, data từ Java)

### ❌ Thiếu init scripts:
4. **Account Service** - accounts (entity có, thiếu init script + sample data)
5. **Notification Service** - notifications (entity có, thiếu init script + sample data)
6. **Admin Service** - admin_logs (entity có, thiếu init script + sample data)

---

## Khuyến nghị

### Priority HIGH - Cần tạo ngay:
1. ✅ **account-service-init.sql**
   - Tạo bảng accounts
   - Tạo indexes
   - Tạo sample accounts cho test users

2. ✅ **notification-service-init.sql**
   - Tạo bảng notifications
   - Tạo indexes
   - Tạo sample notifications

3. ✅ **admin-service-init.sql**
   - Tạo bảng admin_logs
   - Tạo indexes
   - Tạo sample admin logs

### Priority MEDIUM:
4. **transaction-service-init.sql**
   - Uncomment table definitions
   - Thêm indexes
   - Thêm sample transactions

### Priority LOW:
5. **Data consistency**
   - Đảm bảo foreign keys hợp lệ
   - Tạo dữ liệu test nhất quán giữa các services

---

## Database Relationships

```
users (user_db)
  ├─→ accounts (account_db) [user_id]
  ├─→ kyc_requests (user_db) [user_id]
  ├─→ transactions (transaction_db) [staff_id]
  ├─→ counter_staff (transaction_db) [user_id]
  ├─→ counters (transaction_db) [admin_user_id]
  ├─→ log (log_db) [user_id]
  ├─→ notifications (notification_db) [user_id]
  └─→ admin_logs (admin_db) [admin_id, target_user]

accounts (account_db)
  └─→ transactions (transaction_db) [from_acc, to_acc]

counters (transaction_db)
  └─→ counter_staff (transaction_db) [counter_id]
```

---

## Docker Compose Configuration

Cần đảm bảo docker-compose.yml có cấu hình đúng cho tất cả databases:

```yaml
services:
  postgres:
    volumes:
      - ./docker/init-scripts:/docker-entrypoint-initdb.d/
    environment:
      - POSTGRES_MULTIPLE_DATABASES=user_db,account_db,transaction_db,log_db,notification_db,admin_db
```

---

## Next Steps

1. Tạo 3 init scripts còn thiếu (account, notification, admin)
2. Thêm indexes cho tất cả bảng
3. Tạo sample data nhất quán
4. Test database initialization
5. Document foreign key relationships
6. Add database migration strategy
