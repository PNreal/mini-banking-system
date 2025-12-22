# BÁO CÁO KIỂM THỬ HỆ THỐNG MINI BANKING

## Thông Tin Chung

| Thông tin | Chi tiết |
|-----------|----------|
| Dự án | Mini Banking System |
| Ngày báo cáo | 23/12/2024 |
| Phiên bản | 1.0 |
| Môi trường test | Docker (localhost:8080) |

---

## TỔNG KẾT NHANH

| Hạng mục | Số lượng | Trạng thái |
|----------|----------|------------|
| Tổng số Test Cases | 70+ | - |
| Chức năng đã test đầy đủ | 45+ | ✅ PASS |
| Chức năng test một phần | 8 | ⚠️ PARTIAL |
| Chức năng chưa test | 12 | ❌ NOT TESTED |
| Lỗi đã phát hiện | 5 | 🐛 BUG |

---

## 1. Tổng Quan Các Loại Test

Hệ thống Mini Banking được kiểm thử với **4 loại test chính**:

### 1.1. Unit Tests (run-tests.ps1)
Kiểm thử đơn vị cho từng service riêng lẻ sử dụng Maven.

**Services được test:**
- log-service
- account-service
- transaction-service
- admin-service
- user-service
- notification-service

### 1.2. API Integration Tests (test-api.ps1)
Kiểm thử tích hợp API với **14 module test** bao gồm 50+ test cases.

### 1.3. Business Logic Tests (test-business-logic.ps1)
Kiểm thử các logic nghiệp vụ quan trọng với **10 test cases**.

### 1.4. End-to-End Scenario Tests
- test-full-scenario.ps1
- test-deposit-counter-full.ps1
- test-transfer-by-stk.ps1
- test-withdraw-counter.ps1

---

## 2. Chi Tiết Test Cases

### 2.1. Authentication Tests (14 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 1.1 | Register new user | Đăng ký user mới | PASS - User được tạo |
| 1.2 | Register duplicate email | Đăng ký email trùng | FAIL - Từ chối |
| 1.3 | Customer login | Đăng nhập customer | PASS - Nhận token |
| 1.4 | Login wrong password | Đăng nhập sai mật khẩu | FAIL - Từ chối |
| 1.5 | Admin login | Đăng nhập admin | PASS - Nhận token |
| 1.6 | Refresh token | Làm mới token | PASS - Token mới |
| 1.7 | Get user info (/me) | Lấy thông tin user | PASS - Trả về data |

### 2.2. Account Tests (2 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 2.1 | Get account info | Lấy thông tin tài khoản | PASS |
| 2.2 | Get account status | Lấy trạng thái tài khoản | PASS |

### 2.3. Transaction Tests (6 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 3.1 | Deposit | Nạp tiền 1,000,000 VND | PASS |
| 3.2 | Deposit negative amount | Nạp số tiền âm | FAIL - Từ chối |
| 3.3 | Withdraw | Rút tiền 100,000 VND | PASS |
| 3.4 | Withdraw exceeds balance | Rút quá số dư | FAIL - Từ chối |
| 3.5 | Get transaction history | Lấy lịch sử giao dịch | PASS |
| 3.6 | Get history filtered | Lọc theo loại DEPOSIT | PASS |

### 2.4. KYC Tests (4 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 4.1 | Get KYC status | Lấy trạng thái KYC | PASS |
| 4.2 | Get KYC history | Lấy lịch sử KYC | PASS |
| 4.3 | Admin: Get pending KYC | Admin xem KYC chờ duyệt | PASS |
| 4.4 | Admin: Count pending KYC | Đếm số KYC chờ duyệt | PASS |

### 2.5. Counter Tests (3 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 5.1 | Get all counters | Lấy danh sách quầy | PASS |
| 5.2 | Get counter detail | Lấy chi tiết quầy | PASS |
| 5.3 | Get counter staff | Lấy nhân viên quầy | PASS |

### 2.6. Admin Tests (4 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 6.1 | Get all users | Lấy danh sách users | PASS |
| 6.2 | Get system report | Lấy báo cáo hệ thống | PASS |
| 6.3 | Get dashboard | Lấy dashboard admin | PASS |
| 6.4 | Get all transactions | Lấy tất cả giao dịch | PASS |

### 2.7. Notification Tests (2 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 7.1 | Get my notifications | Lấy thông báo của tôi | PASS |
| 7.2 | Mark all read | Đánh dấu đã đọc tất cả | PASS |

### 2.8. Log Tests (3 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 8.1 | Get my logs | Lấy logs của tôi | PASS |
| 8.2 | Admin: Get all logs | Admin xem tất cả logs | PASS |
| 8.3 | Admin: Get log statistics | Thống kê logs | PASS |

### 2.9. Password Management Tests (2 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 9.1 | Change password | Đổi mật khẩu | PASS |
| 9.2 | Forgot password | Quên mật khẩu | PASS |

### 2.10. User Management Tests (3 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 10.1 | Get users list | Lấy danh sách users | PASS |
| 10.2 | Freeze user | Đóng băng tài khoản | PASS |
| 10.3 | Unfreeze user | Mở khóa tài khoản | PASS |

### 2.11. Counter Transaction Tests (3 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 11.1 | Create counter deposit | Tạo yêu cầu nạp tại quầy | PASS |
| 11.2 | Get pending transactions | Lấy giao dịch chờ xử lý | PASS |
| 11.3 | Cancel counter deposit | Hủy giao dịch nạp tiền | PASS |

### 2.12. Transfer Tests (2 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 12.1 | Transfer to another account | Chuyển tiền | PASS |
| 12.2 | Transfer to self | Chuyển cho chính mình | FAIL - Từ chối |

### 2.13. Security Tests (3 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 13.1 | Access without token | Truy cập không có token | FAIL - Từ chối |
| 13.2 | Customer access admin | Customer truy cập admin | FAIL - Từ chối |
| 13.3 | Invalid token | Token không hợp lệ | FAIL - Từ chối |

### 2.14. Staff Dashboard Tests (2 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 14.1 | Staff dashboard | Dashboard nhân viên | PASS |
| 14.2 | Staff recent customers | Khách hàng gần đây | PASS |

---

## 3. Business Logic Tests (10 test cases)

| # | Test Case | Mô tả | Kết quả mong đợi |
|---|-----------|-------|------------------|
| 1 | Account Balance Consistency | Kiểm tra tính nhất quán số dư sau nạp/rút | PASS |
| 2 | Insufficient Balance Prevention | Ngăn rút tiền quá số dư | FAIL - Từ chối |
| 3 | Negative Amount Prevention | Ngăn số tiền âm | FAIL - Từ chối |
| 4 | Self-Transfer Prevention | Ngăn chuyển tiền cho chính mình | FAIL - Từ chối |
| 5 | Login Lock After Failed Attempts | Khóa sau 5 lần đăng nhập sai | PASS - Tài khoản bị khóa |
| 6 | Role-Based Access Control | Phân quyền truy cập | PASS |
| 7 | Transaction History Isolation | Cô lập lịch sử giao dịch | PASS |
| 8 | Frozen Account Restrictions | Hạn chế tài khoản bị đóng băng | PASS |
| 9 | Duplicate Email Prevention | Ngăn email trùng lặp | FAIL - Từ chối |
| 10 | Token Validation | Xác thực token | PASS |

---

## 4. End-to-End Scenario Tests

### 4.1. Full Scenario Test (test-full-scenario.ps1)

**Kịch bản:**
1. Admin đăng nhập
2. Admin tạo 5 nhân viên mới
3. Admin tạo 1 quầy mới và thêm 5 nhân viên vào
4. Đăng ký 3 user mới
5. Admin duyệt KYC cho 3 user
6. 3 user thực hiện nạp tiền tại quầy
7. Staff xác nhận giao dịch

### 4.2. Deposit Counter Full Test (test-deposit-counter-full.ps1)

**Kịch bản:**
1. Admin đăng nhập
2. Tạo 5 nhân viên mới
3. Tạo quầy giao dịch mới
4. Thêm 5 nhân viên vào quầy
5. Đăng ký 3 user mới
6. Submit KYC cho 3 users
7. Admin duyệt KYC
8. 3 Users nạp tiền tại quầy (1M, 2M, 3M VND)
9. Kiểm tra giao dịch pending
10. Staff xác nhận giao dịch

### 4.3. Transfer by STK Test (test-transfer-by-stk.ps1)

**Kịch bản:**
1. Đăng ký User A (Sender)
2. Đăng ký User B (Receiver)
3. Thử chuyển tiền KHÔNG có KYC (phải fail)
4. Submit và duyệt KYC cho cả 2 users
5. Nạp tiền cho User A
6. Chuyển tiền từ A sang B bằng số tài khoản
7. Kiểm tra số dư User B

---

## 5. Cách Chạy Tests

### 5.1. Chạy Unit Tests
```powershell
# Tất cả services
.\scripts\run-tests.ps1

# Service cụ thể
.\scripts\run-tests.ps1 account-service
```

### 5.2. Chạy API Tests
```powershell
# Tất cả tests
.\scripts\test-api.ps1

# Module cụ thể
.\scripts\test-api.ps1 auth
.\scripts\test-api.ps1 transaction
.\scripts\test-api.ps1 security
```

### 5.3. Chạy Business Logic Tests
```powershell
.\scripts\test-business-logic.ps1
```

### 5.4. Chạy Scenario Tests
```powershell
.\scripts\test-full-scenario.ps1
.\scripts\test-deposit-counter-full.ps1
.\scripts\test-transfer-by-stk.ps1
```

---

## 6. Tổng Kết

### 6.1. Thống Kê Test Cases

| Loại Test | Số lượng Test Cases | Modules |
|-----------|---------------------|---------|
| API Integration Tests | 53+ | 14 modules |
| Business Logic Tests | 10 | 1 module |
| Unit Tests | Varies | 6 services |
| E2E Scenario Tests | 4 | 4 scripts |

### 6.2. Phạm Vi Kiểm Thử

- ✅ Authentication & Authorization
- ✅ Account Management
- ✅ Transaction Processing (Deposit, Withdraw, Transfer)
- ✅ KYC Verification
- ✅ Counter Operations
- ✅ Admin Functions
- ✅ Notification System
- ✅ Logging System
- ✅ Security Controls
- ✅ Staff Dashboard

### 6.3. Các Tính Năng Bảo Mật Được Test

- Token-based Authentication
- Role-Based Access Control (RBAC)
- Account Lockout sau nhiều lần đăng nhập sai
- Frozen Account Restrictions
- Input Validation (số tiền âm, số dư không đủ)
- Self-Transfer Prevention

---

## 7. CHỨC NĂNG CHƯA ĐƯỢC TEST / TEST CHƯA ĐẦY ĐỦ

### 7.1. Chức Năng Chưa Được Test (❌ NOT TESTED)

| # | Chức năng | API Endpoint | Lý do chưa test |
|---|-----------|--------------|-----------------|
| 1 | Upload Avatar | `POST /users/me/avatar` | Chưa có test script cho upload file |
| 2 | Tự khóa tài khoản | `PUT /users/self-freeze` | Chưa có test case |
| 3 | Đặt lại mật khẩu | `POST /users/reset-password` | Cần token từ email, khó test tự động |
| 4 | Logout | `POST /users/logout` | Chưa có test case |
| 5 | Xóa tài khoản user | `DELETE /admin/users/{userId}` | Chưa có test case |
| 6 | Kích hoạt lại quầy | `PUT /counters/{counterId}/reactivate` | Chưa có test case |
| 7 | Chỉ định admin quầy | `PATCH /counters/{counterId}/admin-user` | Chưa có test case |
| 8 | Counter Admin APIs | `/counter/admin/*` | Chưa có test script riêng |
| 9 | Gửi lại thông báo | `POST /notifications/{id}/resend` | Chưa có test case |
| 10 | Thống kê thông báo | `GET /notifications/user/{userId}/stats` | Chưa có test case |
| 11 | Tìm kiếm logs | `GET /admin/logs/search` | Chưa có test case |
| 12 | Chuyển tiền bằng STK | `POST /transactions/transfer` (by accountNumber) | Test script có nhưng chưa hoàn chỉnh |

### 7.2. Chức Năng Test Chưa Đầy Đủ (⚠️ PARTIAL)

| # | Chức năng | Vấn đề | Đề xuất |
|---|-----------|--------|---------|
| 1 | Rút tiền tại quầy | Test script có nhưng phụ thuộc vào staff confirm thủ công | Cần tự động hóa hoàn toàn |
| 2 | Transfer by STK | Script `test-transfer-by-stk.ps1` cần admin approve KYC thủ công | Cần tích hợp auto-approve |
| 3 | Counter Staff Management | Chỉ test thêm nhân viên, chưa test xóa/cập nhật | Bổ sung test cases |
| 4 | Notification Types | Chỉ test TRANSACTION, chưa test SECURITY/SYSTEM/PROMOTION | Bổ sung test cases |
| 5 | Transaction Filters | Chỉ test filter by type, chưa test filter by date range | Bổ sung test cases |
| 6 | Pagination | Chưa test đầy đủ các edge cases (page lớn, size = 0) | Bổ sung test cases |
| 7 | KYC Resubmit | Chưa test flow REJECTED → RESUBMITTED → PENDING | Bổ sung test case |
| 8 | Concurrent Transactions | Chưa test giao dịch đồng thời | Cần stress test |

### 7.3. Lỗi Đã Phát Hiện (🐛 BUGS)

| # | Mô tả lỗi | Mức độ | Trạng thái | Ghi chú |
|---|-----------|--------|------------|---------|
| 1 | Staff confirm rút tiền có thể fail nếu staffId không đúng | Medium | Open | Cần validate staffId |
| 2 | Một số API trả về format response không nhất quán | Low | Open | Cần chuẩn hóa response |
| 3 | Counter deposit/withdraw cần staff được assign vào counter | Medium | Open | Cần kiểm tra logic assign |
| 4 | Token refresh có thể fail nếu refreshToken hết hạn | Low | Open | Cần xử lý edge case |
| 5 | KYC submit có thể trùng citizenId với user khác | High | Open | Cần validate unique |

### 7.4. Các Test Case Cần Bổ Sung

#### Authentication & Authorization
- [ ] Test logout và invalidate token
- [ ] Test token expiration handling
- [ ] Test concurrent login từ nhiều devices
- [ ] Test brute force protection (rate limiting)

#### Account Management
- [ ] Test self-freeze và unfreeze flow
- [ ] Test account deletion và data cleanup
- [ ] Test account recovery

#### Transactions
- [ ] Test concurrent deposits/withdrawals
- [ ] Test transaction rollback khi fail
- [ ] Test daily/monthly transaction limits
- [ ] Test minimum/maximum amount validation

#### KYC
- [ ] Test KYC resubmission flow
- [ ] Test duplicate citizenId prevention
- [ ] Test KYC document validation
- [ ] Test KYC expiry handling

#### Counter Operations
- [ ] Test counter admin full CRUD
- [ ] Test staff assignment/removal
- [ ] Test counter deactivation với pending transactions
- [ ] Test max staff limit enforcement

#### Notifications
- [ ] Test all notification types
- [ ] Test notification delivery failure handling
- [ ] Test bulk notification sending

#### Security
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Test sensitive data exposure

---

## 8. KẾ HOẠCH KIỂM THỬ TIẾP THEO

### 8.1. Ưu Tiên Cao (Sprint tiếp theo)
1. Hoàn thiện test rút tiền tại quầy (tự động hóa staff confirm)
2. Test chuyển tiền bằng số tài khoản (STK)
3. Fix và test lại các bugs đã phát hiện
4. Bổ sung test cho Counter Admin APIs

### 8.2. Ưu Tiên Trung Bình
1. Test upload avatar
2. Test logout flow
3. Test KYC resubmission
4. Test notification types

### 8.3. Ưu Tiên Thấp
1. Performance testing
2. Stress testing
3. Security penetration testing
4. UI/UX testing

---

## 9. Ghi Chú

- Tất cả tests yêu cầu hệ thống Docker đang chạy
- Base URL: `http://localhost:8080/api/v1`
- Cần có tài khoản test: `test.user@example.com` / `TestPassword#123`
- Cần có tài khoản admin: `admin@minibank.com` / `Admin@123`
- Scripts chạy từ thư mục gốc của project

---

## 10. PHỤ LỤC

### 10.1. Danh Sách Test Scripts

| Script | Mô tả | Trạng thái |
|--------|-------|------------|
| `run-tests.ps1` | Unit tests cho services | ✅ Hoạt động |
| `test-api.ps1` | API integration tests | ✅ Hoạt động |
| `test-business-logic.ps1` | Business logic tests | ✅ Hoạt động |
| `test-full-scenario.ps1` | E2E full scenario | ✅ Hoạt động |
| `test-deposit-counter-full.ps1` | Nạp tiền tại quầy | ✅ Hoạt động |
| `test-withdraw-counter.ps1` | Rút tiền tại quầy | ⚠️ Cần staff confirm |
| `test-withdraw-counter-full.ps1` | Rút tiền full flow | ⚠️ Cần staff confirm |
| `test-withdraw-simple.ps1` | Rút tiền đơn giản | ⚠️ Cần staff confirm |
| `test-transfer-by-stk.ps1` | Chuyển tiền bằng STK | ⚠️ Cần admin approve KYC |
| `test-quick.bat` | Quick health check | ✅ Hoạt động |

### 10.2. Test Accounts

| Email | Password | Role | Ghi chú |
|-------|----------|------|---------|
| test.user@example.com | TestPassword#123 | CUSTOMER | Đã có KYC approved |
| admin@minibank.com | Admin@123 | ADMIN | System admin |
| staff@minibank.com | Staff@123 | STAFF | Default staff |
| counter.admin@minibank.com | CounterAdmin@123 | COUNTER_ADMIN | Counter admin |
