# Tóm tắt các tài khoản trong Database

## Thống kê tổng quan

| Vai trò | Tổng số | Active | Locked | Frozen |
|---------|---------|--------|--------|--------|
| ADMIN | 1 | 1 | 0 | 0 |
| STAFF | 4 | 4 | 0 | 0 |
| CUSTOMER | 5 | 3 | 1 | 1 |
| **TỔNG** | **10** | **8** | **1** | **1** |

---

## Chi tiết tài khoản

### 1. ADMIN (1 tài khoản)

| Email | Họ tên | Mã nhân viên | Trạng thái |
|-------|--------|--------------|------------|
| admin@minibank.com | Admin User | ADM001 | ACTIVE |

**Mật khẩu:** `Admin@123`

---

### 2. STAFF (4 tài khoản)

| Email | Họ tên | Mã nhân viên | Trạng thái |
|-------|--------|--------------|------------|
| staff1@minibank.com | Nguyễn Văn A | STF001 | ACTIVE |
| staff2@minibank.com | Trần Thị B | STF002 | ACTIVE |
| staff@minibank.com | Staff User | ST001 | ACTIVE |
| counter.admin@minibank.com | Counter Admin | CA001 | ACTIVE |

**Mật khẩu:** `staff123`

---

### 3. CUSTOMER (5 tài khoản)

| Email | Họ tên | CCCD | Trạng thái | Ghi chú |
|-------|--------|------|------------|---------|
| customer1@example.com | Lê Văn C | 001234567890 | ACTIVE | KYC đã duyệt |
| customer2@example.com | Phạm Thị D | 001234567891 | ACTIVE | KYC đang chờ |
| customer3@example.com | Hoàng Văn E | 001234567892 | LOCKED | KYC bị từ chối |
| customer4@example.com | Vũ Thị F | 001234567893 | FROZEN | - |
| test.user@example.com | Nguyen Van Test | - | ACTIVE | Tài khoản test |

**Mật khẩu:** `customer123`

---

## Yêu cầu xác minh KYC (3 yêu cầu)

| Email khách hàng | Họ tên | CCCD | Trạng thái | Người xác minh | Ngày tạo |
|------------------|--------|------|------------|----------------|----------|
| customer1@example.com | Lê Văn C | 001234567890 | ✅ APPROVED | staff1@minibank.com | 2025-12-19 |
| customer2@example.com | Phạm Thị D | 001234567891 | ⏳ PENDING | - | 2025-12-21 |
| customer3@example.com | Hoàng Văn E | 001234567892 | ❌ REJECTED | staff2@minibank.com | 2025-12-20 |

**Lý do từ chối customer3:** Hình ảnh CCCD không rõ ràng. Vui lòng chụp lại.

---

## Cách sử dụng

### Đăng nhập với các tài khoản mẫu:

1. **Admin** - Quản trị hệ thống
   - Email: `admin@minibank.com`
   - Password: `Admin@123`

2. **Staff** - Nhân viên ngân hàng
   - Email: `staff1@minibank.com` hoặc `staff2@minibank.com`
   - Password: `staff123`

3. **Customer** - Khách hàng
   - Email: `customer1@example.com` (tài khoản hoạt động bình thường)
   - Password: `customer123`

### Kiểm tra lại database:

```powershell
# Chạy script kiểm tra
.\scripts\check-accounts.ps1
```

---

## Ghi chú

- Tất cả mật khẩu đã được hash bằng BCrypt
- Database: `user_db` trên container `postgres-user-service` (port 5434)
- Có thể kết nối trực tiếp: `docker exec -it postgres-user-service psql -U user_user -d user_db`
