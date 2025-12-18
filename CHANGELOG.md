# Changelog

Tất cả các thay đổi đáng chú ý trong dự án Mini Banking System sẽ được ghi lại trong file này.

## [Unreleased]

### Added - 2025-01-XX

#### Quản lý quầy giao dịch và nhân viên (Admin)

**Frontend:**
- Thêm trang `AdminCounters.js` để quản lý quầy giao dịch và nhân viên
- Giao diện quản lý với:
  - Danh sách quầy giao dịch (cột trái)
  - Danh sách nhân viên trong quầy được chọn (cột phải)
  - Modal thêm/sửa quầy giao dịch
  - Modal thêm/sửa nhân viên
- Thêm nút "Quản lý quầy giao dịch" trong AdminDashboard
- Route mới: `/admin/counters` (yêu cầu quyền ADMIN)

**API Endpoints (Frontend):**
- `createCounterApi` - Tạo quầy giao dịch mới
- `updateCounterApi` - Cập nhật thông tin quầy
- `deleteCounterApi` - Xóa quầy giao dịch
- `getCounterDetailsApi` - Lấy chi tiết quầy (bao gồm danh sách nhân viên)
- `addStaffToCounterApi` - Thêm nhân viên vào quầy
- `updateStaffInCounterApi` - Cập nhật thông tin nhân viên
- `removeStaffFromCounterApi` - Xóa nhân viên khỏi quầy

**Tài liệu:**
- Cập nhật `API Specification.md` với các endpoints mới:
  - `POST /admin/counters` - Tạo quầy giao dịch
  - `PUT /admin/counters/{counterId}` - Cập nhật quầy
  - `DELETE /admin/counters/{counterId}` - Xóa quầy
  - `GET /admin/counters/{counterId}` - Lấy chi tiết quầy (bao gồm nhân viên)
  - `POST /admin/counters/{counterId}/staff` - Thêm nhân viên
  - `PUT /admin/counters/{counterId}/staff/{staffId}` - Cập nhật nhân viên
  - `DELETE /admin/counters/{counterId}/staff/{staffId}` - Xóa nhân viên
- Cập nhật `README.md` với thông tin về tính năng mới

#### Cải tiến tính năng rút tiền

**Frontend:**
- Thay đổi phương thức "Rút tại ATM" thành "Rút tiền tại quầy"
- Tích hợp API `getCountersApi` để load danh sách quầy giao dịch
- Logic tương tự như nạp tiền tại quầy
- Cập nhật UI để hiển thị danh sách quầy thay vì danh sách ATM

#### Cải tiến giao diện

**Frontend:**
- Xóa phương thức "Chuyển khoản ngân hàng" khỏi trang rút tiền
- Xóa phương thức "Quét mã QR" khỏi trang nạp tiền

### Changed

- Cập nhật `Withdraw.js` để sử dụng quầy giao dịch thay vì ATM locations
- Cập nhật `Deposit.js` để loại bỏ phương thức QR Code

### Technical Details

**Files Modified:**
- `frontend/src/pages/Withdraw.js`
- `frontend/src/pages/Deposit.js`
- `frontend/src/api/client.js`
- `frontend/src/App.js`
- `frontend/src/pages/AdminDashboard.js`

**Files Created:**
- `frontend/src/pages/AdminCounters.js`
- `CHANGELOG.md`

**Files Updated:**
- `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/API Specification.md`
- `README.md`

