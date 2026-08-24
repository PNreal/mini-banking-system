# Core Banking Service - MiniBank System

Core Banking Service là dịch vụ **hạt nhân tài chính** của hệ thống Mini Banking, chịu trách nhiệm quản lý toàn diện:
1. **Tài khoản & Số dư (Accounts & Balances)**
2. **Giao dịch Trực tuyến (Online Transactions):** Nạp, Rút, Chuyển khoản
3. **Giao dịch & Quản lý Quầy (Counter Operations):** Nạp/Rút tiền tại quầy, Phân bổ nhân viên quầy, Quản trị quầy giao dịch

---

## 🚀 Thông tin Kỹ thuật & Cổng kết nối

* **Cổng dịch vụ (App Port):** `http://localhost:8082`
* **Cơ sở dữ liệu (PostgreSQL):** `localhost:5433` (Database: `banking_db`, User: `banking_user`, Pass: `banking_password`)
* **Message Broker (Kafka):** `localhost:9092` (Host) / `kafka:29092` (Docker Network)

---

## 📌 Các API Endpoints Chính

### 1. Tài khoản Người dùng (`/account`)
| Method | Endpoint | Header / Param | Mô tả |
| :---: | :--- | :--- | :--- |
| `GET` | `/account/me` | `X-User-Id` | Lấy thông tin tài khoản & số dư hiện tại |
| `GET` | `/account/status` | `X-User-Id` | Kiểm tra trạng thái tài khoản (`ACTIVE`, `FROZEN`, `LOCKED`) |

### 2. Giao dịch Tài chính (`/api/v1/transactions`)
| Method | Endpoint | Body / Param | Mô tả |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/transactions/deposit` | `{ "amount": 100000 }` | Nạp tiền vào tài khoản |
| `POST` | `/api/v1/transactions/withdraw` | `{ "amount": 50000 }` | Rút tiền khỏi tài khoản |
| `POST` | `/api/v1/transactions/transfer` | `{ "toAccountNumber": "...", "amount": 50000 }` | Chuyển khoản đến số tài khoản khác |
| `GET` | `/api/v1/transactions/me` | `page`, `size`, `type`, `from`, `to` | Lấy lịch sử giao dịch (có phân trang & lọc) |
| `GET` | `/api/v1/transactions/admin/dashboard` | `days=7` | Thống kê số liệu giao dịch cho Admin |

### 3. Giao dịch tại Quầy (`/api/v1/transactions` & `/api/v1/counter`)
| Method | Endpoint | Mô tả |
| :---: | :--- | :--- |
| `POST` | `/api/v1/transactions/counter/deposit` | Khách hàng tạo yêu cầu nạp tiền tại quầy (trạng thái `PENDING`) |
| `POST` | `/api/v1/transactions/counter/withdraw` | Khách hàng tạo yêu cầu rút tiền tại quầy (trạng thái `PENDING`) |
| `POST` | `/api/v1/transactions/counter/deposit/{id}/confirm` | Nhân viên quầy xác nhận nhận tiền ➔ Cập nhật số dư |
| `POST` | `/api/v1/transactions/counter/withdraw/{id}/confirm` | Nhân viên quầy xác nhận chi tiền ➔ Trừ số dư |
| `GET` | `/api/v1/transactions/counter/staff/dashboard` | Bảng điều khiển giao dịch dành cho Nhân viên quầy |

### 4. Quản lý Quầy Giao Dịch (`/api/v1/counters` & `/api/v1/counter`)
| Method | Endpoint | Mô tả |
| :---: | :--- | :--- |
| `GET` | `/api/v1/counters` | Danh sách tất cả các quầy giao dịch |
| `POST` | `/api/v1/counters` | Tạo quầy giao dịch mới |
| `PUT` | `/api/v1/counters/{id}` | Cập nhật thông tin quầy |
| `POST` | `/api/v1/counters/{id}/staff` | Gán nhân viên vào quầy làm việc |
| `GET` | `/api/v1/counter/admin/staff` | Danh sách nhân viên quầy của Counter Admin |

---

## 🔒 Cơ chế Bảo vệ Toàn vẹn Dữ liệu (Data Integrity)

1. **ACID Transaction trong cùng 1 Service:** 
   * Cập nhật số dư (`accounts`) và ghi nhận giao dịch (`transactions`) được thực thi trong cùng một Spring `@Transactional`. Nếu có lỗi xảy ra, toàn bộ thao tác sẽ được rollback 100%.
2. **Pessimistic Locking (`findWithLockingById`):**
   * Sử dụng `SELECT ... FOR UPDATE` khi đọc số dư để chống xung đột dữ liệu (Race condition / Lost Update) khi có nhiều giao dịch đồng thời trên 1 tài khoản.
3. **Thứ tự khóa tránh Deadlock:**
   * Khi chuyển tiền, khóa 2 tài khoản nguồn & đích theo thứ tự UUID tăng dần (`first.compareTo(second) > 0`) để loại bỏ hoàn toàn nguy cơ Deadlock.

---

## 📊 Database Schema (`banking_db`)

1. **`accounts`:** Lưu trữ thông tin tài khoản ngân hàng (`id`, `user_id`, `account_number`, `balance`, `status`, `created_at`, `updated_at`).
2. **`transactions`:** Lưu trữ lịch sử giao dịch (`id`, `from_account_id`, `to_account_id`, `amount`, `type`, `status`, `timestamp`, `transaction_code`, `counter_id`, `staff_id`).
3. **`counters`:** Quản lý danh sách quầy (`id`, `counter_code`, `counter_name`, `branch_name`, `status`).
4. **`counter_staff`:** Liên kết nhân viên với quầy (`id`, `counter_id`, `user_id`, `employee_code`, `status`).

---

## 📨 Kafka Events

Core Banking Service phát ra các Event sau lên Kafka Message Broker:

| Topic | Khi nào phát ra? | Mục đích |
| :--- | :--- | :--- |
| **`TRANSACTION_COMPLETED`** | Giao dịch nạp/rút/chuyển thành công | Kích hoạt `notification-service` gửi Email/WebSocket và `log-service` ghi Audit log |
| **`ACCOUNT_EVENT`** | Khi tài khoản được tạo/khóa/đóng băng | Thông báo trạng thái tài khoản |
| **`COUNTER_DEPOSIT_NOTIFICATION`** | Khi có yêu cầu nạp tiền tại quầy | Bắn thông báo đến quầy nhân viên trực tiếp |
| **`ADMIN_ACTION`** | Khi nhân viên duyệt giao dịch quầy | Ghi nhật ký quản trị |