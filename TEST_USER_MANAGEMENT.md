# Hướng Dẫn Test Tính Năng Quản Lý Nhân Viên

## Chuẩn Bị

### 1. Khởi động các services
```bash
# Terminal 1: Start backend services
./start-services.ps1

# Terminal 2: Start frontend
./start-frontend.ps1
```

### 2. Đăng nhập Admin
- Truy cập: http://localhost:3001/admin/login
- Email: `admin@minibank.com`
- Password: `admin123`

## Test Cases

### TEST 1: Xem Danh Sách Users ✅
**Mục đích**: Kiểm tra hiển thị danh sách users

**Các bước**:
1. Sau khi đăng nhập, click vào menu "Người dùng" hoặc truy cập http://localhost:3001/admin/employees
2. Kiểm tra danh sách users hiển thị đầy đủ thông tin:
   - Mã user (8 ký tự đầu)
   - Họ tên
   - Email
   - Vai trò (Badge)
   - CCCD
   - Mã nhân viên
   - Trạng thái (Badge màu)
   - Ngày tạo

**Kết quả mong đợi**:
- Hiển thị ít nhất 5 users mẫu (admin, 2 staff, 2 customers)
- Các badge hiển thị đúng màu sắc
- Không có lỗi trong console

---

### TEST 2: Tìm Kiếm Users ✅
**Mục đích**: Kiểm tra chức năng search

**Các bước**:
1. Nhập "Nguyễn" vào ô tìm kiếm
2. Kiểm tra kết quả lọc
3. Xóa và nhập "staff1@minibank.com"
4. Kiểm tra kết quả

**Kết quả mong đợi**:
- Chỉ hiển thị users có tên/email khớp với từ khóa
- Search không phân biệt hoa thường
- Kết quả cập nhật real-time khi gõ

---

### TEST 3: Tạo User Mới - Customer ✅
**Mục đích**: Kiểm tra tạo customer mới

**Các bước**:
1. Click button "Thêm người dùng"
2. Dialog mở ra, điền thông tin:
   - Email: `customer.test@example.com`
   - Password: `test123`
   - Họ tên: `Nguyễn Văn Test`
   - Vai trò: `Khách hàng`
   - CCCD: `001234567899`
3. Click "Tạo người dùng"

**Kết quả mong đợi**:
- Dialog đóng lại
- User mới xuất hiện trong danh sách
- Không có error message
- Backend log: "USER_CREATED" event

**Test validation**:
- Thử tạo với email trùng → Hiển thị error "Email already in use"
- Thử tạo với password < 6 ký tự → Hiển thị validation error
- Thử tạo với email không hợp lệ → Hiển thị validation error

---

### TEST 4: Tạo User Mới - Staff ✅
**Mục đích**: Kiểm tra tạo nhân viên mới

**Các bước**:
1. Click button "Thêm người dùng"
2. Điền thông tin:
   - Email: `staff.test@minibank.com`
   - Password: `staff123`
   - Họ tên: `Trần Thị Test`
   - Vai trò: `Nhân viên`
   - Mã nhân viên: `STF999`
3. Click "Tạo người dùng"

**Kết quả mong đợi**:
- User mới được tạo với role STAFF
- Mã nhân viên hiển thị trong bảng
- Trường CCCD không hiển thị (vì là STAFF)

---

### TEST 5: Chỉnh Sửa User ✅
**Mục đích**: Kiểm tra cập nhật thông tin user

**Các bước**:
1. Click icon "..." ở user vừa tạo
2. Chọn "Chỉnh sửa"
3. Dialog mở với thông tin pre-filled
4. Thay đổi:
   - Họ tên: `Nguyễn Văn Test Updated`
   - Vai trò: `Nhân viên`
   - Mã nhân viên: `STF888`
5. Click "Lưu thay đổi"

**Kết quả mong đợi**:
- Dialog đóng
- Thông tin user cập nhật trong bảng
- Role badge thay đổi từ CUSTOMER → STAFF
- Mã nhân viên hiển thị

**Test conditional fields**:
- Khi chọn role CUSTOMER → Hiển thị trường CCCD
- Khi chọn role STAFF/ADMIN → Hiển thị trường Mã nhân viên

---

### TEST 6: Khóa Tài Khoản ✅
**Mục đích**: Kiểm tra khóa user

**Các bước**:
1. Click icon "..." ở một user ACTIVE
2. Chọn "Khóa tài khoản"
3. Đợi action hoàn thành

**Kết quả mong đợi**:
- Status badge đổi thành "Bị khóa" (màu đỏ)
- Menu action đổi thành "Mở khóa"
- Backend: PUT /api/users/admin/users/{userId}/lock

**Test login**:
- Thử đăng nhập với user bị khóa → Hiển thị "Account is locked"

---

### TEST 7: Mở Khóa Tài Khoản ✅
**Mục đích**: Kiểm tra mở khóa user

**Các bước**:
1. Click icon "..." ở user LOCKED
2. Chọn "Mở khóa"
3. Đợi action hoàn thành

**Kết quả mong đợi**:
- Status badge đổi thành "Hoạt động" (màu xanh)
- Menu action đổi thành "Khóa tài khoản"
- User có thể đăng nhập lại

---

### TEST 8: Đóng Băng Tài Khoản ✅
**Mục đích**: Kiểm tra freeze user

**Các bước**:
1. Click icon "..." ở một user ACTIVE
2. Chọn "Đóng băng"
3. Đợi action hoàn thành

**Kết quả mong đợi**:
- Status badge đổi thành "Đóng băng" (màu vàng)
- Menu action đổi thành "Mở đóng băng"
- Backend: PUT /api/users/admin/users/{userId}/freeze

---

### TEST 9: Mở Đóng Băng ✅
**Mục đích**: Kiểm tra unfreeze user

**Các bước**:
1. Click icon "..." ở user FROZEN
2. Chọn "Mở đóng băng"
3. Đợi action hoàn thành

**Kết quả mong đợi**:
- Status badge đổi thành "Hoạt động"
- Menu action đổi thành "Đóng băng"

---

### TEST 10: Xóa User ✅
**Mục đích**: Kiểm tra xóa user

**Các bước**:
1. Click icon "..." ở user test
2. Chọn "Xóa"
3. Confirmation dialog hiển thị với tên và email user
4. Click "Xóa" để confirm

**Kết quả mong đợi**:
- Confirmation dialog hiển thị đúng thông tin
- Sau khi confirm, user biến mất khỏi danh sách
- Backend: DELETE /api/users/admin/users/{userId}

**Test cancel**:
- Click "Hủy" → Dialog đóng, user vẫn còn

---

### TEST 11: Error Handling ✅
**Mục đích**: Kiểm tra xử lý lỗi

**Test cases**:
1. **Network error**: Tắt backend, thử tạo user
   - Kết quả: Hiển thị error message trong dialog
   
2. **Validation error**: Tạo user với email trùng
   - Kết quả: Hiển thị "Email already in use"
   
3. **Authorization error**: Đăng nhập với user không phải admin, truy cập /admin/employees
   - Kết quả: Redirect hoặc hiển thị "Access denied"

---

### TEST 12: Multiple Actions ✅
**Mục đích**: Kiểm tra nhiều actions liên tiếp

**Các bước**:
1. Tạo 3 users mới
2. Chỉnh sửa user thứ nhất
3. Khóa user thứ hai
4. Xóa user thứ ba
5. Mở khóa user thứ hai

**Kết quả mong đợi**:
- Tất cả actions hoạt động độc lập
- Danh sách cập nhật đúng sau mỗi action
- Không có memory leak hoặc state issues

---

## API Testing với cURL/Postman

### 1. Get All Users
```bash
curl -X GET http://localhost:8080/api/v1/users/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Create User
```bash
curl -X POST http://localhost:8080/api/v1/users/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "fullName": "Test User",
    "role": "CUSTOMER",
    "citizenId": "001234567890"
  }'
```

### 3. Update User
```bash
curl -X PUT http://localhost:8080/api/v1/users/admin/users/{userId} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "role": "STAFF",
    "employeeCode": "STF999"
  }'
```

### 4. Lock User
```bash
curl -X PUT http://localhost:8080/api/v1/users/admin/users/{userId}/lock \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Delete User
```bash
curl -X DELETE http://localhost:8080/api/v1/users/admin/users/{userId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Checklist Tổng Hợp

### Backend
- [ ] Tất cả endpoints trả về status code đúng (200, 201, 400, 403, 404)
- [ ] Validation hoạt động (email format, password length, email unique)
- [ ] Authorization check (chỉ ADMIN có quyền)
- [ ] Kafka events được publish (USER_CREATED, USER_UPDATED, USER_DELETED)
- [ ] Database được cập nhật đúng

### Frontend
- [ ] Danh sách users hiển thị đầy đủ
- [ ] Search/filter hoạt động
- [ ] Create dialog hoạt động với validation
- [ ] Edit dialog pre-fill data đúng
- [ ] Delete confirmation dialog hiển thị
- [ ] Status change actions hoạt động
- [ ] Error messages hiển thị rõ ràng
- [ ] Loading states hiển thị
- [ ] Auto-refresh sau mỗi action
- [ ] Conditional rendering (CCCD vs Mã NV)
- [ ] Responsive design

### Integration
- [ ] Frontend gọi đúng API endpoints
- [ ] Token được gửi trong Authorization header
- [ ] Response data được parse đúng
- [ ] Error responses được handle đúng

---

## Known Issues & Limitations

1. **Hard Delete**: Hiện tại xóa user là hard delete, không thể khôi phục
2. **No Pagination**: Danh sách users chưa có pagination, có thể chậm với nhiều users
3. **No Bulk Actions**: Chưa hỗ trợ xóa/khóa nhiều users cùng lúc
4. **No Audit Log**: Chưa có log tracking ai thực hiện action gì

---

## Troubleshooting

### Lỗi: "Failed to load users"
- Kiểm tra backend có đang chạy không
- Kiểm tra token có hợp lệ không
- Xem console log để biết chi tiết lỗi

### Lỗi: "Email already in use"
- Email đã tồn tại trong database
- Thử với email khác

### Lỗi: "Access denied"
- User hiện tại không phải ADMIN
- Đăng nhập lại với tài khoản admin

### Dialog không mở
- Kiểm tra console có lỗi JavaScript không
- Refresh trang và thử lại

### Actions không hoạt động
- Kiểm tra network tab trong DevTools
- Xem response từ backend
- Kiểm tra token có expired không
