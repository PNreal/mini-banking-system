# Phân Tích Tính Năng Quản Lý Nhân Viên

## Tổng Quan

Hệ thống có **2 trang quản lý nhân viên riêng biệt** với mục đích khác nhau:

### 1. Users Page (`/admin/users`)
**Mục đích**: Quản lý TẤT CẢ users trong hệ thống (CUSTOMER, STAFF, ADMIN)

**Tính năng**: ✅ HOÀN CHỈNH
- ✅ Xem danh sách tất cả users
- ✅ Tạo user mới (bất kỳ role nào)
- ✅ Chỉnh sửa thông tin user
- ✅ Xóa user
- ✅ Khóa/Mở khóa tài khoản
- ✅ Đóng băng/Mở đóng băng tài khoản
- ✅ Search/Filter users

**Backend APIs**: ✅ ĐẦY ĐỦ
- GET `/api/users/admin/users`
- POST `/api/users/admin/users`
- PUT `/api/users/admin/users/{userId}`
- DELETE `/api/users/admin/users/{userId}`
- PUT `/api/users/admin/users/{userId}/lock`
- PUT `/api/users/admin/users/{userId}/unlock`
- PUT `/api/users/admin/users/{userId}/freeze`
- PUT `/api/users/admin/users/{userId}/unfreeze`

---

### 2. Employees Page (`/admin/employees`)
**Mục đích**: Quản lý NHÂN VIÊN và GÁN VÀO QUẦY GIAO DỊCH

**Tính năng**: ❌ CHƯA HOÀN CHỈNH (Đang dùng mock data)
- ❌ Hiển thị danh sách nhân viên (mock data)
- ❌ Hiển thị quầy được gán (mock data)
- ❌ Thêm nhân viên (form không hoạt động)
- ❌ Chỉnh sửa nhân viên (không hoạt động)
- ❌ Xóa nhân viên (không hoạt động)
- ❌ Gán nhân viên vào quầy (không có API call)
- ❌ Xem lịch sử gán quầy

**Backend APIs**: ✅ CÓ SẴN (trong Transaction Service)
- GET `/api/v1/counter/admin/{counterId}/staff` - Lấy staff của quầy
- POST `/api/v1/counter/admin/{counterId}/staff` - Thêm staff vào quầy
- PUT `/api/v1/counter/admin/{counterId}/staff/{staffUserId}` - Cập nhật staff
- DELETE `/api/v1/counter/admin/{counterId}/staff/{staffUserId}` - Gỡ staff khỏi quầy

**Vấn đề**: Frontend chưa kết nối với backend APIs

---

## Chi Tiết Tính Năng Còn Thiếu

### A. Employees Page - Cần Hoàn Thiện

#### 1. Hiển Thị Danh Sách Nhân Viên ❌
**Hiện tại**: Dùng mock data hardcoded
```typescript
const employees: Employee[] = [
  { id: "1", code: "NV001", name: "Nguyễn Văn Minh", ... }
];
```

**Cần làm**:
- Gọi API để lấy danh sách users có role = STAFF hoặc ADMIN
- Với mỗi staff, lấy thông tin quầy được gán (nếu có)
- Hiển thị thông tin: Tên, Email, Phone, Mã NV, Vai trò, Quầy, Trạng thái

**API cần dùng**:
- GET `/api/users/admin/users` - Lấy tất cả users, filter role = STAFF/ADMIN
- GET `/api/v1/counters` - Lấy danh sách counters
- GET `/api/v1/counters/{counterId}/staff` - Lấy staff của từng counter

**Cấu trúc dữ liệu cần**:
```typescript
interface EmployeeWithCounter {
  userId: string;
  fullName: string;
  email: string;
  employeeCode: string;
  role: string;
  status: string;
  counters: {
    counterId: string;
    counterName: string;
    isActive: boolean;
  }[];
}
```

#### 2. Thêm Nhân Viên Mới ❌
**Hiện tại**: Dialog có form nhưng không submit

**Cần làm**:
- Tạo user mới với role STAFF (gọi POST `/api/users/admin/users`)
- Tùy chọn gán vào quầy ngay (gọi POST `/api/v1/counter/admin/{counterId}/staff`)

**Lưu ý**: Có thể tái sử dụng CreateUserDialog từ Users page

#### 3. Chỉnh Sửa Nhân Viên ❌
**Hiện tại**: Menu có option "Chỉnh sửa" nhưng không hoạt động

**Cần làm**:
- Cập nhật thông tin user (PUT `/api/users/admin/users/{userId}`)
- Thay đổi quầy được gán (POST/DELETE staff từ counter)

#### 4. Xóa Nhân Viên ❌
**Hiện tại**: Menu có option "Xóa" nhưng không hoạt động

**Cần làm**:
- Xóa user (DELETE `/api/users/admin/users/{userId}`)
- Hoặc chỉ gỡ khỏi quầy (DELETE `/api/v1/counter/admin/{counterId}/staff/{staffUserId}`)

#### 5. Gán Nhân Viên Vào Quầy ❌
**Hiện tại**: Không có chức năng này

**Cần làm**:
- Thêm button/dialog để chọn quầy
- Gọi POST `/api/v1/counter/admin/{counterId}/staff` với userId và email
- Hiển thị danh sách quầy hiện tại của nhân viên
- Cho phép gỡ khỏi quầy

**UI đề xuất**:
```
[Nhân viên: Nguyễn Văn A]
Quầy hiện tại:
- Quầy Trung tâm (Active) [Gỡ]
- Quầy Thủ Đức (Inactive) [Kích hoạt]

[+ Thêm vào quầy khác]
```

#### 6. Xem Lịch Sử Gán Quầy ❌
**Hiện tại**: Không có

**Cần làm**:
- Hiển thị lịch sử nhân viên được gán/gỡ khỏi quầy nào
- Thời gian bắt đầu/kết thúc
- Trạng thái (active/inactive)

**Backend**: Cần thêm API mới hoặc dùng audit log

---

### B. Counters Page - Quản Lý Nhân Viên Trong Quầy

**Tình trạng**: ✅ HOÀN CHỈNH (đã có trong COUNTER_IMPLEMENTATION_SUMMARY.md)

Trang Counters đã có đầy đủ chức năng:
- ✅ Xem danh sách nhân viên trong quầy
- ✅ Thêm nhân viên vào quầy
- ✅ Gỡ nhân viên khỏi quầy
- ✅ Kích hoạt/Vô hiệu hóa nhân viên

**Lưu ý**: Đây là view từ góc độ QUẦY (xem quầy có những nhân viên nào)

---

## So Sánh 2 Trang

| Tính năng | Users Page | Employees Page | Counters Page |
|-----------|------------|----------------|---------------|
| Xem tất cả users | ✅ | ❌ (mock) | ❌ |
| Xem chỉ staff | ❌ | ❌ (mock) | ❌ |
| Tạo user/staff | ✅ | ❌ | ❌ |
| Sửa thông tin user | ✅ | ❌ | ❌ |
| Xóa user | ✅ | ❌ | ❌ |
| Khóa/Đóng băng | ✅ | ❌ | ❌ |
| Xem quầy của staff | ❌ | ❌ (mock) | ✅ (ngược lại) |
| Gán vào quầy | ❌ | ❌ | ✅ |
| Gỡ khỏi quầy | ❌ | ❌ | ✅ |

---

## Đề Xuất Giải Pháp

### Option 1: Hoàn Thiện Employees Page (Khuyến nghị)
**Ưu điểm**:
- Tách biệt rõ ràng: Users (tất cả) vs Employees (chỉ staff + quầy)
- UX tốt hơn cho admin quản lý nhân viên
- Có thể thêm nhiều tính năng đặc thù cho nhân viên (lịch làm việc, KPI, etc.)

**Công việc cần làm**:
1. Tạo API functions trong `api.ts`:
   - `getStaffUsers()` - Lấy users có role STAFF/ADMIN
   - `getStaffCounters(userId)` - Lấy danh sách quầy của staff
   - Tái sử dụng các counter staff APIs đã có

2. Cập nhật Employees.tsx:
   - Fetch data từ backend thay vì mock
   - Implement các handlers (create, edit, delete)
   - Thêm chức năng gán/gỡ quầy
   - Hiển thị danh sách quầy của mỗi staff

3. Tạo components mới:
   - `AssignCounterDialog.tsx` - Dialog gán staff vào quầy
   - `StaffCountersView.tsx` - Hiển thị danh sách quầy của staff

**Thời gian ước tính**: 4-6 giờ

### Option 2: Gộp Vào Users Page
**Ưu điểm**:
- Đơn giản hóa, chỉ có 1 trang quản lý users
- Ít code hơn, dễ maintain

**Nhược điểm**:
- Trang Users sẽ phức tạp hơn
- Khó tách biệt logic cho từng loại user

**Công việc cần làm**:
1. Thêm tab/filter trong Users page để xem chỉ staff
2. Thêm cột "Quầy" trong bảng
3. Thêm action "Gán vào quầy" trong dropdown menu
4. Xóa Employees page và route

**Thời gian ước tính**: 2-3 giờ

### Option 3: Giữ Nguyên + Redirect
**Ưu điểm**:
- Nhanh nhất, không cần code nhiều

**Nhược điểm**:
- Không giải quyết vấn đề
- UX kém

**Công việc cần làm**:
1. Redirect `/admin/employees` → `/admin/users?role=STAFF`
2. Thêm filter role trong Users page
3. Xóa Employees.tsx

**Thời gian ước tính**: 30 phút

---

## Checklist Hoàn Thiện (Option 1)

### Backend
- [x] User CRUD APIs (đã có)
- [x] Counter Staff APIs (đã có)
- [ ] API lấy danh sách staff với thông tin quầy (có thể dùng APIs hiện tại)

### Frontend - API Client
- [ ] `getStaffUsers()` - Filter users by role
- [ ] `getStaffWithCounters()` - Aggregate staff + counter data
- [ ] Tái sử dụng counter staff APIs

### Frontend - Employees Page
- [ ] Fetch real data thay vì mock
- [ ] Implement create employee (tái sử dụng CreateUserDialog)
- [ ] Implement edit employee (tái sử dụng EditUserDialog)
- [ ] Implement delete employee
- [ ] Hiển thị danh sách quầy của mỗi staff
- [ ] Implement assign to counter
- [ ] Implement remove from counter
- [ ] Search/filter employees
- [ ] Loading states
- [ ] Error handling

### Frontend - New Components
- [ ] AssignCounterDialog.tsx
- [ ] StaffCountersView.tsx (hoặc inline trong table)

### Testing
- [ ] Test hiển thị danh sách staff
- [ ] Test tạo staff mới
- [ ] Test gán staff vào quầy
- [ ] Test gỡ staff khỏi quầy
- [ ] Test staff có thể ở nhiều quầy
- [ ] Test validation (max staff per counter)

---

## Kết Luận

**Tình trạng hiện tại**:
- ✅ Users Page: HOÀN CHỈNH - Có thể quản lý tất cả users
- ❌ Employees Page: CHƯA HOÀN CHỈNH - Chỉ có UI mock, chưa kết nối backend
- ✅ Counters Page: HOÀN CHỈNH - Có thể quản lý staff trong từng quầy

**Khuyến nghị**:
- Hoàn thiện Employees Page theo Option 1 để có trải nghiệm quản lý nhân viên tốt nhất
- Hoặc nếu muốn đơn giản, dùng Option 3 (redirect) và chỉ dùng Users + Counters pages

**Ưu tiên**:
1. Nếu cần quản lý nhân viên chi tiết → Hoàn thiện Employees Page
2. Nếu chỉ cần basic → Dùng Users Page + Counters Page là đủ
