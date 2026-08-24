# User Service - MiniBank System

User Service là dịch vụ **quản lý danh tính, xác thực và phân quyền (IAM & RBAC)** của hệ thống Mini Banking.

---

## 🚀 Thông tin Kỹ thuật & Cổng kết nối

* **Cổng dịch vụ (App Port):** `http://localhost:8081`
* **Cơ sở dữ liệu (PostgreSQL):** `localhost:5432` (Database: `user_db`, User: `user_user`, Pass: `user_password`)
* **Message Broker (Kafka):** `localhost:9092` (Host) / `kafka:29092` (Docker Network)
* **Bảo mật:** Spring Security 6 với `JwtAuthenticationFilter` chuẩn Stateless & `@PreAuthorize`

---

## 📌 Danh Mục API Endpoints

### 1. Khách Hàng & Xác Thực (`/api/users`)
| Method | Endpoint | Quyền | Mô tả |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/users/register` | Public | Đăng ký tài khoản khách hàng mới |
| `POST` | `/api/users/login` | Public | Đăng nhập lấy JWT Access Token & Refresh Token |
| `POST` | `/api/users/forgot-password` | Public | Yêu cầu mã OTP đặt lại mật khẩu |
| `POST` | `/api/users/reset-password` | Public | Đặt lại mật khẩu qua Token xác nhận |
| `GET` | `/api/users/me` | Authenticated | Xem thông tin hồ sơ của người dùng hiện tại |
| `PUT` | `/api/users/me` | Authenticated | Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ) |
| `POST` | `/api/users/change-password` | Authenticated | Đổi mật khẩu đăng nhập |
| `POST` | `/api/users/refresh-token` | Authenticated | Cấp Access Token mới từ Refresh Token |
| `POST` | `/api/users/self-freeze` | Authenticated | Người dùng tự khóa/đóng băng tài khoản khẩn cấp |

### 2. Xác Minh Danh Tính KYC (`/api/kyc`)
| Method | Endpoint | Quyền | Mô tả |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/kyc/submit` | Authenticated | Nộp hồ sơ KYC (CCCD mặt trước/sau, thông tin cá nhân) |
| `GET` | `/api/kyc/my-status` | Authenticated | Kiểm tra trạng thái KYC hiện tại (`PENDING`, `APPROVED`, `REJECTED`) |
| `GET` | `/api/kyc/admin/requests` | Admin / Staff | Lấy danh sách hồ sơ KYC đang chờ duyệt |
| `GET` | `/api/kyc/admin/requests/{id}` | Admin / Staff | Xem chi tiết 1 hồ sơ KYC |
| `PUT` | `/api/kyc/admin/requests/{id}/review` | Admin / Staff | Phê duyệt (`APPROVED`) hoặc Từ chối (`REJECTED`) KYC |

### 3. Quản Trị Hệ Thống & Nhân Viên (`/api/users/admin`)
| Method | Endpoint | Quyền | Mô tả |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/users/admin/login` | Public | Đăng nhập riêng cho Admin & Staff |
| `GET` | `/api/users/admin/users` | Admin (`hasRole('ADMIN')`) | Lấy danh sách tất cả người dùng trong hệ thống |
| `POST` | `/api/users/admin/users` | Admin (`hasRole('ADMIN')`) | Tạo mới người dùng hoặc quản trị viên |
| `PUT` | `/api/users/admin/users/{id}` | Admin (`hasRole('ADMIN')`) | Cập nhật thông tin bất kỳ người dùng nào |
| `PUT` | `/api/users/admin/users/{id}/lock` | Admin (`hasRole('ADMIN')`) | Khóa tài khoản người dùng |
| `PUT` | `/api/users/admin/users/{id}/unlock` | Admin (`hasRole('ADMIN')`) | Mở khóa tài khoản người dùng |
| `POST` | `/api/users/admin/employees` | Admin (`hasRole('ADMIN')`) | Tạo tài khoản nhân viên giao dịch quầy |
| `GET` | `/api/users/admin/employees` | Admin (`hasRole('ADMIN')`) | Danh sách nhân viên giao dịch |

### 4. Internal API dành cho Microservices (`/internal/users`)
* Được bảo vệ bằng header `X-Internal-Secret: internal-secret`
* `GET /internal/users/by-email?email=...`: Lấy thông tin user bằng email
* `GET /internal/users/{id}`: Lấy thông tin chi tiết user theo UUID

---

## 🔒 Cơ Chế Bảo Mật

1. **Spring Security Filter Chain:**
   * `JwtAuthenticationFilter` tự động trích xuất token từ header `Authorization: Bearer <token>`, giải mã claim `role` và gắn `ROLE_ADMIN` / `ROLE_CUSTOMER` / `ROLE_STAFF` vào `SecurityContextHolder`.
   * Endpoint Admin được bảo vệ bởi annotation chuẩn `@PreAuthorize("hasRole('ADMIN')")`.
2. **Chống tấn công dò mật khẩu (Brute-force Protection):**
   * Tự động khóa tài khoản sau 5 lần nhập sai mật khẩu liên tiếp.
3. **Mã hóa Mật khẩu:** Sử dụng thuật toán BCrypt băm mật khẩu 1 chiều an toàn.

---

## 📊 Database Schema (`user_db`)

1. **`users`:** `id` (UUID), `email`, `password_hash`, `full_name`, `phone_number`, `role` (`CUSTOMER`, `ADMIN`, `STAFF`, `COUNTER_ADMIN`), `status` (`ACTIVE`, `LOCKED`, `FROZEN`), `kyc_status` (`NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`), `failed_attempts`, `created_at`, `updated_at`.
2. **`kyc_requests`:** `id` (UUID), `user_id`, `citizen_id`, `front_card_url`, `back_card_url`, `status`, `rejection_reason`, `reviewed_by`, `reviewed_at`.
3. **`refresh_tokens`:** Quản lý phiên đăng nhập và gia hạn token.

---

## 📨 Kafka Events

| Topic | Khi nào phát ra? | Mục đích |
| :--- | :--- | :--- |
| **`USER_EVENT`** | Khi có người dùng đăng ký mới, cập nhật hồ sơ | Đồng bộ trạng thái sang `log-service` và `notification-service` |
| **`ADMIN_ACTION`** | Khi Admin khóa/mở khóa/thao tác người dùng | Ghi nhật ký kiểm toán hệ thống |