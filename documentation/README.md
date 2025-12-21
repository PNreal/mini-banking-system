# Documentation - Tài Liệu Hệ Thống Docker

Thư mục này chứa tất cả tài liệu kỹ thuật và hướng dẫn sử dụng Mini Banking System chạy bằng Docker.

## Danh Sách Tài Liệu

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

### Tài Liệu Chi Tiết

#### **docs/ - Tài liệu chi tiết theo phân loại**

Thư mục `docs/` chứa toàn bộ tài liệu chi tiết của dự án, được phân loại theo các nhóm:

##### **I. TÀI LIỆU KHỞI TẠO DỰ ÁN**
- [`Business Requirement Document – BRD.md`](./docs/I.%20TÀI%20LIỆU%20KHỞI%20TẠO%20DỰ%20ÁN/Business%20Requirement%20Document%20%E2%80%93%20BRD.md) - Yêu cầu nghiệp vụ
- [`Project Overview.md`](./docs/I.%20TÀI%20LIỆU%20KHỞI%20TẠO%20DỰ%20ÁN/Project%20Overview.md) - Tổng quan dự án

##### **II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG**
- [`API Specification.md`](./docs/II.%20TÀI%20LIỆU%20PHÂN%20TÍCH%20&%20THIẾT%20KẾ%20HỆ%20THỐNG/API%20Specification.md) - Đặc tả API
- [`Database Design Document (DBD).md`](./docs/II.%20TÀI%20LIỆU%20PHÂN%20TÍCH%20&%20THIẾT%20KẾ%20HỆ%20THỐNG/Database%20Design%20Document%20(DBD).md) - Thiết kế CSDL
- [`Service Interaction Specification (SIS).md`](./docs/II.%20TÀI%20LIỆU%20PHÂN%20TÍCH%20&%20THIẾT%20KẾ%20HỆ%20THỐNG/Service%20Interaction%20Specification%20(SIS).md) - Tương tác service
- [`Software Architecture Document (SAD).md`](./docs/II.%20TÀI%20LIỆU%20PHÂN%20TÍCH%20&%20THIẾT%20KẾ%20HỆ%20THỐNG/Software%20Architecture%20Document%20(SAD).md) - Kiến trúc hệ thống
- [`Software Requirements Specification (SRD).md`](./docs/II.%20TÀI%20LIỆU%20PHÂN%20TÍCH%20&%20THIẾT%20KẾ%20HỆ%20THỐNG/Software%20Requirements%20Specification%20(SRD).md) - Đặc tả yêu cầu phần mềm

##### **III. TÀI LIỆU GIAO DIỆN (UI/UX)**
- [`README.md`](./docs/III.%20TÀI%20LIỆU%20GIAO%20DIỆN%20(UIUX)/README.md) - Tổng quan tài liệu UI/UX
- [`01. Design System & Style Guide.md`](./docs/III.%20TÀI%20LIỆU%20GIAO%20DIỆN%20(UIUX)/01.%20Design%20System%20&%20Style%20Guide.md) - Hệ thống thiết kế
- [`02. Component Library.md`](./docs/III.%20TÀI%20LIỆU%20GIAO%20DIỆN%20(UIUX)/02.%20Component%20Library.md) - Thư viện component
- [`03. Screen Specifications.md`](./docs/III.%20TÀI%20LIỆU%20GIAO%20DIỆN%20(UIUX)/03.%20Screen%20Specifications.md) - Đặc tả màn hình
- Các tài liệu UI/UX khác...

##### **IV. TÀI LIỆU KỸ THUẬT**
- [`Docker Conventions & Guidelines.md`](./docs/IV.%20TÀI%20LIỆU%20KỸ%20THUẬT/Docker%20Conventions%20&%20Guidelines.md) - Quy chuẩn Docker

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

#### `LOGIC_LUONG_HOAT_DONG.md`
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
 README.md                              # File này - Tổng quan tài liệu
 README_DOCKER.md                       # Docker & Ports
 DATABASE_OVERVIEW.md                   # Tổng quan database
 docs/                                  # Tài liệu chi tiết
   I. TÀI LIỆU KHỞI TẠO DỰ ÁN/
     Business Requirement Document – BRD.md
     Project Overview.md
   II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/
     API Specification.md
     Database Design Document (DBD).md
     Service Interaction Specification (SIS).md
     Software Architecture Document (SAD).md
     Software Requirements Specification (SRD).md
   III. TÀI LIỆU GIAO DIỆN (UIUX)/
     README.md
     01. Design System & Style Guide.md
     02. Component Library.md
     03. Screen Specifications.md
     04. User Flow Diagrams.md
     05. Responsive Design Guidelines.md
     06. Accessibility Guidelines.md
     07. Interaction Patterns.md
     08. Wireframes & Mockups.md
     UI Guideline _ Design System.md
   IV. TÀI LIỆU KỸ THUẬT/
     Docker Conventions & Guidelines.md
```

---

## Hướng Dẫn Đọc Tài Liệu

### Cho Developer Mới:
1. **Bắt đầu**: `README_DOCKER.md` - Khởi động hệ thống bằng Docker
2. **Tổng quan**: `docs/I. TÀI LIỆU KHỞI TẠO DỰ ÁN/Project Overview.md` - Tổng quan dự án
3. **Database**: `DATABASE_OVERVIEW.md` - Cấu trúc dữ liệu
4. **Kiến trúc**: `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/Software Architecture Document (SAD).md` - Kiến trúc hệ thống
5. **API**: `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/API Specification.md` - Đặc tả API
6. **UI/UX**: `docs/III. TÀI LIỆU GIAO DIỆN (UIUX)/README.md` - Tài liệu giao diện

### Cho DevOps/Infrastructure:
1. `README_DOCKER.md` - Docker setup
2. `DATABASE_OVERVIEW.md` - Database configuration
3. `docs/IV. TÀI LIỆU KỸ THUẬT/Docker Conventions & Guidelines.md` - Docker conventions
4. `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/Software Architecture Document (SAD).md` - Kiến trúc triển khai

### Cho Product Owner/BA:
1. `docs/I. TÀI LIỆU KHỞI TẠO DỰ ÁN/Business Requirement Document – BRD.md` - Yêu cầu nghiệp vụ
2. `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/Software Requirements Specification (SRD).md` - Đặc tả yêu cầu
3. `docs/III. TÀI LIỆU GIAO DIỆN (UIUX)/README.md` - Tài liệu giao diện

### Cho Frontend Developer:
1. `docs/III. TÀI LIỆU GIAO DIỆN (UIUX)/README.md` - Tổng quan tài liệu UI/UX
2. `docs/III. TÀI LIỆU GIAO DIỆN (UIUX)/01. Design System & Style Guide.md` - Hệ thống thiết kế
3. `docs/III. TÀI LIỆU GIAO DIỆN (UIUX)/02. Component Library.md` - Thư viện component
4. `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/API Specification.md` - API endpoints

### Khi Thêm Tính Năng Mới:
1. `README_DOCKER.md` - Check port allocation
2. `DATABASE_OVERVIEW.md` - Database design
3. Cập nhật tài liệu liên quan trong thư mục `docs/`

---

## Tìm Kiếm Nhanh

### Tôi muốn...

**Khởi động hệ thống bằng Docker**
→ `README_DOCKER.md` → "QUICK START"

**Thêm service mới**
→ `README_DOCKER.md` → "THÊM SERVICE MỚI?"

**Hiểu tổng quan dự án**
→ `docs/I. TÀI LIỆU KHỞI TẠO DỰ ÁN/Project Overview.md`

**Xem yêu cầu nghiệp vụ**
→ `docs/I. TÀI LIỆU KHỞI TẠO DỰ ÁN/Business Requirement Document – BRD.md`

**Hiểu kiến trúc hệ thống**
→ `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/Software Architecture Document (SAD).md`

**Xem đặc tả API**
→ `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/API Specification.md`

**Xem cấu trúc database**
→ `DATABASE_OVERVIEW.md`

**Xem tài liệu UI/UX**
→ `docs/III. TÀI LIỆU GIAO DIỆN (UIUX)/README.md`

**Quy chuẩn Docker**
→ `docs/IV. TÀI LIỆU KỸ THUẬT/Docker Conventions & Guidelines.md`

**Xử lý lỗi khi chạy**
→ `README_DOCKER.md` → "TROUBLESHOOTING"

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
4. Kiểm tra `docker-compose.yml` cho cấu hình hiện tại

---

**Cập nhật lần cuối**: 2025-12-22