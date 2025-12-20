# Documentation - Tài Liệu Hệ Thống

Thư mục này chứa tất cả tài liệu kỹ thuật và hướng dẫn sử dụng Mini Banking System.

## Danh Sách Tài Liệu

### Hướng Dẫn Khởi Động

#### [`HUONG_DAN_KHOI_DONG_BACKEND.md`](./HUONG_DAN_KHOI_DONG_BACKEND.md)  **MỚI**
**Phương pháp đã kiểm chứng - Khuyến nghị đọc đầu tiên**

Hướng dẫn khởi động backend đã được kiểm chứng thành công:
-  Phương pháp đã test thành công (2025-12-20)
-  Sửa lỗi API Gateway dependency
-  Khởi động từng service chi tiết
-  Checklist đầy đủ
-  Xử lý lỗi thường gặp
-  Tips và tricks

**Phù hợp cho**: Khởi động backend lần đầu hoặc khi gặp vấn đề

---

#### [`HUONG_DAN_CHAY_TUNG_BUOC.md`](./HUONG_DAN_CHAY_TUNG_BUOC.md)
**Hướng dẫn tổng quan**

Hướng dẫn chi tiết từng bước để khởi động và sử dụng hệ thống:
- Yêu cầu hệ thống
- Các bước khởi động chi tiết
- Các điểm truy cập (URLs)
- Xử lý sự cố thường gặp
- Quy trình làm việc hàng ngày
- Tips và best practices

**Phù hợp cho**: Development, khi cần kiểm soát và debug từng service

---

### Docker

#### [`README_DOCKER.md`](./README_DOCKER.md)
**Hướng dẫn Docker và Port Allocation**

Tài liệu về cấu hình Docker:
- Quick start với Docker
- Port allocation (8080-8089, 5432-5439)
- Thêm service mới
- Templates và conventions
- Troubleshooting Docker issues

**Quan trọng**: Đọc trước khi thêm service mới để tránh conflict ports

---

### Triển Khai Tính Năng

#### [`COUNTER_IMPLEMENTATION_SUMMARY.md`](./COUNTER_IMPLEMENTATION_SUMMARY.md)
**Tóm tắt triển khai Quầy Giao Dịch**

Chi tiết về hệ thống quản lý quầy:
- Backend: Entity, Repository, Service, Controller
- Database: counters, counter_staff tables
- Frontend: Admin UI với CRUD operations
- API endpoints đầy đủ
- Dữ liệu mẫu (20 quầy)
- Tính năng đã hoàn thành

**Liên quan**: Transaction Service, Counter Admin

---

#### [`USER_MANAGEMENT_IMPLEMENTATION.md`](./USER_MANAGEMENT_IMPLEMENTATION.md)
**Tài liệu quản lý người dùng và nhân viên**

Triển khai đầy đủ tính năng quản lý user:
- Backend APIs: CRUD users
- DTOs: CreateUserRequest, UpdateUserRequest
- Frontend: Users page với dialogs
- Khóa/Mở khóa/Đóng băng tài khoản
- Role-based access control
- Testing checklist

**Liên quan**: User Service, Admin Panel

---

#### [`NOTIFICATION_SYSTEM_OVERVIEW.md`](./NOTIFICATION_SYSTEM_OVERVIEW.md)
**Tổng quan hệ thống thông báo**

Chi tiết về Notification Service:
- Database schema (notifications table)
- 12 loại thông báo (TRANSACTION_SUCCESS, ACCOUNT_LOCKED, etc.)
- 4 kênh gửi (EMAIL, SMS, PUSH, IN_APP)
- WebSocket real-time notifications
- Retry mechanism
- API endpoints
- Integration với services khác

**Liên quan**: Notification Service, Kafka Events

---

### Database

#### [`DATABASE_OVERVIEW.md`](./DATABASE_OVERVIEW.md)
**Tổng quan toàn bộ database hệ thống**

Tài liệu tổng hợp về 6 databases:
- **user_db**: users, kyc_requests
- **account_db**: accounts
- **transaction_db**: transactions, counters, counter_staff
- **log_db**: log
- **notification_db**: notifications
- **admin_db**: admin_logs

Bao gồm:
- Schema chi tiết từng bảng
- Indexes và foreign keys
- Sample data
- Database relationships
- Init scripts status
- Khuyến nghị cần làm

**Quan trọng**: Tài liệu tham khảo chính cho database design

---

### Logic Hệ Thống

#### [`LOGIC_LUONG_HOAT_DONG.md`](./LOGIC_LUONG_HOAT_DONG.md)
**Logic các luồng hoạt động - Tài liệu quan trọng**

Mô tả chi tiết logic nghiệp vụ:
1. **Luồng đăng ký & đăng nhập**
   - Customer registration
   - Login (Customer/Admin/Staff)
   - Refresh token
   - Logout

2. **Luồng giao dịch**
   - Nạp tiền (E-Wallet, Counter)
   - Rút tiền
   - Chuyển khoản
   - Xem lịch sử

3. **Luồng quản lý người dùng (Admin)**
   - CRUD users
   - Khóa/Mở khóa/Đóng băng
   - Xóa user

4. **Luồng quản lý quầy giao dịch**
   - Tạo quầy với auto-create admin
   - Quản lý nhân viên trong quầy

5. **Luồng xác minh KYC**
   - Submit KYC
   - Staff review (Approve/Reject)
   - Resubmit

6. **Luồng thông báo**
   - Tạo notification
   - Multi-channel delivery
   - WebSocket real-time

7. **Luồng logging & audit**

**Phù hợp cho**: Hiểu business logic, onboarding developers mới

---

## Cấu Trúc Tài Liệu

```
documentation/
 README.md (file này)
 HUONG_DAN_KHOI_DONG_BACKEND.md       #  Khởi động backend (đã kiểm chứng)
 HUONG_DAN_CHAY_TUNG_BUOC.md          # Hướng dẫn khởi động tổng quan
 README_DOCKER.md                      # Docker & Ports
 COUNTER_IMPLEMENTATION_SUMMARY.md     # Quầy giao dịch
 USER_MANAGEMENT_IMPLEMENTATION.md     # Quản lý user
 NOTIFICATION_SYSTEM_OVERVIEW.md       # Hệ thống thông báo
 DATABASE_OVERVIEW.md                  # Tổng quan database
 LOGIC_LUONG_HOAT_DONG.md             # Logic nghiệp vụ
```

---

## Hướng Dẫn Đọc Tài Liệu

### Cho Developer Mới:
1. **Bắt đầu**: `HUONG_DAN_KHOI_DONG_BACKEND.md`  - Khởi động backend (đã kiểm chứng)
2. **Tổng quan**: `HUONG_DAN_CHAY_TUNG_BUOC.md` - Hướng dẫn đầy đủ
3. **Hiểu kiến trúc**: `LOGIC_LUONG_HOAT_DONG.md` - Logic nghiệp vụ
4. **Database**: `DATABASE_OVERVIEW.md` - Cấu trúc dữ liệu
5. **Tính năng cụ thể**: Đọc các file implementation tương ứng

### Cho DevOps/Infrastructure:
1. `README_DOCKER.md` - Docker setup
2. `DATABASE_OVERVIEW.md` - Database configuration
3. `HUONG_DAN_CHAY_TUNG_BUOC.md` - Deployment guide

### Cho Product Owner/BA:
1. `LOGIC_LUONG_HOAT_DONG.md` - Business flows
2. Các file implementation - Feature details

### Khi Thêm Tính Năng Mới:
1. `README_DOCKER.md` - Check port allocation
2. `DATABASE_OVERVIEW.md` - Database design
3. Tạo file implementation summary mới

---

## Tìm Kiếm Nhanh

### Tôi muốn...

**Khởi động backend**
→ `HUONG_DAN_KHOI_DONG_BACKEND.md`  (Phương pháp đã kiểm chứng)

**Khởi động hệ thống (tổng quan)**
→ `HUONG_DAN_CHAY_TUNG_BUOC.md`

**Hiểu luồng đăng nhập**
→ `LOGIC_LUONG_HOAT_DONG.md` → Section 1

**Thêm service mới**
→ `README_DOCKER.md` → "Thêm Service Mới"

**Xem cấu trúc database**
→ `DATABASE_OVERVIEW.md`

**Hiểu hệ thống thông báo**
→ `NOTIFICATION_SYSTEM_OVERVIEW.md`

**Quản lý quầy giao dịch**
→ `COUNTER_IMPLEMENTATION_SUMMARY.md`

**Quản lý users**
→ `USER_MANAGEMENT_IMPLEMENTATION.md`

**Xử lý lỗi khi chạy**
→ `HUONG_DAN_CHAY_TUNG_BUOC.md` → "Xử Lý Sự Cố"

---

## Quy Tắc Viết Tài Liệu

Khi thêm/cập nhật tài liệu:

1. **Đặt tên file**: `FEATURE_NAME_SUMMARY.md` hoặc `FEATURE_NAME_OVERVIEW.md`
2. **Cấu trúc**: Sử dụng headers rõ ràng, bullet points, code blocks
3. **Ngôn ngữ**: Tiếng Việt cho hướng dẫn, tiếng Anh cho technical terms
4. **Cập nhật README**: Thêm link vào file này
5. **Liên kết**: Link đến các tài liệu liên quan

---

## Hỗ Trợ

Nếu không tìm thấy thông tin cần thiết:
1. Tìm kiếm trong các file markdown (Ctrl+F)
2. Kiểm tra `../README.md` (root README)
3. Xem code comments trong source code
4. Kiểm tra `../CHANGELOG.md` cho lịch sử thay đổi

---

**Cập nhật lần cuối**: 2025-12-20
