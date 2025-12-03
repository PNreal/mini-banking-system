# **DATABASE DESIGN DOCUMENT (DBD)**

**Dự án:** Mini Banking System  
**Phiên bản:** 1.0  
**Ngày:** 20/11/2025  
**Người biên soạn:** Nhóm 7

## **1. Giới thiệu** {#giới-thiệu}

### **1.1. Mục tiêu** {#mục-tiêu}

Tài liệu này mô tả **thiết kế cơ sở dữ liệu (Database Design)** cho hệ
thống **Mini Banking System**.  
Nó bao gồm:

> Cấu trúc bảng (tables)  
> Quan hệ giữa các bảng  
> Ràng buộc toàn vẹn  
> Các chỉ mục, khóa và quy tắc dữ liệu

Mục tiêu: đảm bảo tính **nhất quán, bảo mật và hiệu năng cao** cho các
giao dịch tài chính mô phỏng.

## **2. Kiến trúc cơ sở dữ liệu** {#kiến-trúc-cơ-sở-dữ-liệu}

### **2.1. Kiểu cơ sở dữ liệu** {#kiểu-cơ-sở-dữ-liệu}

- **Hệ quản trị:** PostgreSQL 13+

- **Kiến trúc:** Database per Service (mỗi microservice có DB riêng)

- **Tính chất:** ACID, đảm bảo consistency giữa các transaction.

### **2.2. Danh sách các cơ sở dữ liệu** {#danh-sách-các-cơ-sở-dữ-liệu}

| **Service**          | **Database**   | **Mục đích**                   |
|----------------------|----------------|--------------------------------|
| User Service         | user_db        | Quản lý thông tin người dùng   |
| Account Service      | account_db     | Lưu trữ tài khoản, số dư       |
| Transaction Service  | transaction_db | Ghi nhận giao dịch             |
| Notification Service | notif_db       | Lưu thông tin gửi email/SMS    |
| Admin Service        | admin_db       | Báo cáo, trạng thái người dùng |
| Log Service          | log_db         | Lưu lịch sử hành động          |

## **3. Mô hình dữ liệu tổng thể (ERD Overview)** {#mô-hình-dữ-liệu-tổng-thể-erd-overview}

**Quan hệ chính:**

User (1) ─── (1) Account

Account (1) ─── (n) Transaction

User (1) ─── (n) Log

Admin (1) ─── (n) Log

## **4. Thiết kế chi tiết từng bảng** {#thiết-kế-chi-tiết-từng-bảng}

### **4.1. Bảng users (user_db)** {#bảng-users-user_db}

| **Tên trường** | **Kiểu dữ liệu** | **Ràng buộc**    | **Mô tả**                |
|----------------|------------------|------------------|--------------------------|
| user_id        | UUID             | PK               | Định danh người dùng     |
| email          | VARCHAR(100)     | UNIQUE, NOT NULL | Email đăng ký            |
| password       | VARCHAR(255)     | NOT NULL         | Mật khẩu mã hóa (bcrypt) |
| full_name      | VARCHAR(100)     | NULL             | Tên người dùng           |
| created_at     | TIMESTAMP        | NOT NULL         | Ngày tạo                 |
| last_login     | TIMESTAMP        | NULL             | Lần đăng nhập gần nhất   |

**Ghi chú:**

- Email không được trùng.

- Mật khẩu phải được hash.

### **4.2. Bảng account (account_db)** {#bảng-account-account_db}

| **Tên trường** | **Kiểu dữ liệu** | **Ràng buộc**                                        | **Mô tả**              |
|----------------|------------------|------------------------------------------------------|------------------------|
| account_id     | UUID             | PK                                                   | Mã tài khoản ngân hàng |
| user_id        | UUID             | FK → users.user_id                                   | Chủ sở hữu             |
| balance        | DECIMAL(18,2)    | DEFAULT 0                                            | Số dư                  |
| status         | VARCHAR(20)      | CHECK (status IN (\'ACTIVE\',\'LOCKED\',\'FROZEN\')) | Trạng thái tài khoản   |
| created_at     | TIMESTAMP        | NOT NULL                                             | Ngày tạo               |

**Ràng buộc:**

- Số dư không âm.

- Nếu status = FROZEN → chặn giao dịch.

**CHECK constraint:**

```sql
CHECK (balance >= 0)
```

Constraint này đảm bảo số dư không bao giờ âm ở database level, ngăn chặn race condition và lỗi logic.

### **4.3. Bảng transaction (transaction_db)** {#bảng-transaction-transaction_db}

| **Tên trường** | **Kiểu dữ liệu** | **Ràng buộc**                                           | **Mô tả**           |
|----------------|------------------|---------------------------------------------------------|---------------------|
| trans_id       | UUID             | PK                                                      | ID giao dịch        |
| from_acc       | UUID             | NULLABLE                                                | Tài khoản gửi       |
| to_acc         | UUID             | NULLABLE                                                | Tài khoản nhận      |
| amount         | DECIMAL(18,2)    | NOT NULL                                                | Số tiền             |
| type           | VARCHAR(20)      | CHECK (type IN (\'DEPOSIT\',\'WITHDRAW\',\'TRANSFER\')) | Loại giao dịch      |
| timestamp      | TIMESTAMP        | NOT NULL                                                | Thời gian thực hiện |
| status         | VARCHAR(20)      | CHECK (status IN (\'SUCCESS\',\'FAILED\'))              | Trạng thái          |

**Ràng buộc nghiệp vụ:**

- amount \> 0

- TRANSFER → from_acc & to_acc đều NOT NULL

- DEPOSIT → to_acc NOT NULL và from_acc phải NULL

- WITHDRAW → from_acc NOT NULL và to_acc phải NULL

- Giao dịch **atomic** (rollback khi lỗi).

**CHECK constraints:**

```sql
-- Đảm bảo amount > 0
CHECK (amount > 0)

-- Đảm bảo logic đúng cho từng loại giao dịch
CHECK (
  (type = 'DEPOSIT' AND from_acc IS NULL AND to_acc IS NOT NULL) OR
  (type = 'WITHDRAW' AND from_acc IS NOT NULL AND to_acc IS NULL) OR
  (type = 'TRANSFER' AND from_acc IS NOT NULL AND to_acc IS NOT NULL)
)
```

Các constraints này đảm bảo logic đúng cho từng loại giao dịch và ngăn chặn dữ liệu không hợp lệ.

### **4.4. Bảng log (log_db)** {#bảng-log-log_db}

| **Trường** | **Kiểu dữ liệu** | **Ràng buộc**      | **Mô tả**                               |
|------------|------------------|--------------------|-----------------------------------------|
| log_id     | UUID             | PK                 | Mã log                                  |
| user_id    | UUID             | FK → users.user_id | Ai thực hiện                            |
| action     | VARCHAR(255)     | NOT NULL           | Hành động (login, withdraw, freeze\...) |
| detail     | TEXT             | NULL               | Chi tiết                                |
| time       | TIMESTAMP        | NOT NULL           | Thời điểm ghi log                       |

### **4.5. Bảng notification (notif_db)** {#bảng-notification-notif_db}

| **Trường** | **Kiểu dữ liệu** | **Ràng buộc**      | **Mô tả**          |
|------------|------------------|--------------------|--------------------|
| notif_id   | UUID             | PK                 | ID thông báo       |
| user_id    | UUID             | FK → users.user_id | Người nhận         |
| type       | VARCHAR(20)      | CHECK (type IN ('EMAIL', 'SMS')) | Loại thông báo |
| content    | TEXT             | NOT NULL           | Nội dung thông báo |
| status     | VARCHAR(20)      | CHECK (status IN ('SENT', 'FAILED')) | Trạng thái |
| sent_at    | TIMESTAMP        | NOT NULL           | Thời gian gửi      |

**CHECK constraints:**

```sql
CHECK (type IN ('EMAIL', 'SMS'))
CHECK (status IN ('SENT', 'FAILED'))
```

### **4.6. Bảng admin_logs (admin_db)** {#bảng-admin_logs-admin_db}

| **Trường**   | **Kiểu dữ liệu** | **Ràng buộc**      | **Mô tả**              |
|--------------|------------------|--------------------|------------------------|
| admin_log_id | UUID             | PK                 | ID log quản trị        |
| admin_id     | UUID             | FK → users.user_id | Quản trị viên          |
| action       | VARCHAR(100)     | CHECK (action IN ('FREEZE', 'UNFREEZE', 'LOCK', 'UNLOCK')) | Hành động |
| target_user  | UUID             | FK → users.user_id | Người bị tác động      |
| time         | TIMESTAMP        | NOT NULL           | Thời điểm              |

**CHECK constraint:**

```sql
CHECK (action IN ('FREEZE', 'UNFREEZE', 'LOCK', 'UNLOCK'))
```

## **5. Ràng buộc toàn vẹn dữ liệu** {#ràng-buộc-toàn-vẹn-dữ-liệu}

| **Loại**                  | **Mô tả**                                       |
|---------------------------|-------------------------------------------------|
| **Toàn vẹn thực thể**     | Mỗi bảng có khóa chính duy nhất                 |
| **Toàn vẹn tham chiếu**   | Tất cả FK phải trỏ tới record tồn tại           |
| **Toàn vẹn miền giá trị** | Dùng CHECK cho trạng thái, loại giao dịch       |
| **Toàn vẹn nghiệp vụ**    | Không cho phép balance \< 0, log không được xóa |

### **5.1. Foreign Key Constraints** {#foreign-key-constraints}

**Bảng account:**
```sql
FOREIGN KEY (user_id) REFERENCES users(user_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE
```

**Bảng transaction:**
```sql
FOREIGN KEY (from_acc) REFERENCES account(account_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE

FOREIGN KEY (to_acc) REFERENCES account(account_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE
```

**Bảng log:**
```sql
FOREIGN KEY (user_id) REFERENCES users(user_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE
```

**Bảng notification:**
```sql
FOREIGN KEY (user_id) REFERENCES users(user_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE
```

**Bảng admin_logs:**
```sql
FOREIGN KEY (admin_id) REFERENCES users(user_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE

FOREIGN KEY (target_user) REFERENCES users(user_id) 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE
```

**Lưu ý:** 
- ON DELETE RESTRICT: Không cho phép xóa user nếu còn account/log liên quan
- ON UPDATE CASCADE: Tự động cập nhật FK khi user_id thay đổi

## **6. Chỉ mục và tối ưu hóa** {#chỉ-mục-và-tối-ưu-hóa}

| **Bảng**    | **Cột**          | **Loại Index** | **Mục đích**                     |
|-------------|------------------|----------------|----------------------------------|
| users       | email            | UNIQUE         | Tăng tốc đăng nhập               |
| account     | user_id          | BTREE          | Join với users, tìm account theo user |
| account     | status           | BTREE          | Filter accounts theo trạng thái  |
| transaction | timestamp        | BTREE          | Tăng tốc truy vấn lịch sử        |
| transaction | from_acc         | BTREE          | Tăng tốc tìm giao dịch gửi đi    |
| transaction | to_acc           | BTREE          | Tăng tốc tìm giao dịch nhận về   |
| transaction | type             | BTREE          | Filter theo loại giao dịch       |
| log         | user_id          | BTREE          | Tìm log theo user                |
| log         | time             | BTREE          | Tìm log theo thời gian           |
| notification| user_id          | BTREE          | Tìm notification theo user       |
| notification| status           | BTREE          | Filter notification theo trạng thái |
| admin_logs  | admin_id         | BTREE          | Tìm log theo admin               |
| admin_logs  | target_user      | BTREE          | Tìm log theo user bị tác động   |

**SQL để tạo indexes:**

```sql
-- Account indexes
CREATE INDEX idx_account_user_id ON account(user_id);
CREATE INDEX idx_account_status ON account(status);

-- Transaction indexes
CREATE INDEX idx_transaction_timestamp ON transaction(timestamp);
CREATE INDEX idx_transaction_from_acc ON transaction(from_acc);
CREATE INDEX idx_transaction_to_acc ON transaction(to_acc);
CREATE INDEX idx_transaction_type ON transaction(type);

-- Log indexes
CREATE INDEX idx_log_user_id ON log(user_id);
CREATE INDEX idx_log_time ON log(time);

-- Notification indexes
CREATE INDEX idx_notification_user_id ON notification(user_id);
CREATE INDEX idx_notification_status ON notification(status);

-- Admin logs indexes
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_target_user ON admin_logs(target_user);
```
