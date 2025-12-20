# Tài Liệu Triển Khai Quản Lý Nhân Viên

## Tổng Quan

Tài liệu này mô tả việc triển khai đầy đủ tính năng quản lý nhân viên tại `http://localhost:3001/admin/employees`, bao gồm các chức năng CRUD (Create, Read, Update, Delete) và quản lý trạng thái tài khoản.

## Các Tính Năng Đã Triển Khai

### 1. Backend APIs - User Service

#### 1.1. DTOs Mới
- **CreateUserRequest.java**: DTO cho việc tạo user mới
  - Các trường: email, password, fullName, role, citizenId, employeeCode
  - Validation: email format, password min length 6 characters

- **UpdateUserRequest.java**: DTO cho việc cập nhật thông tin user
  - Các trường: fullName, role, citizenId, employeeCode

#### 1.2. Endpoints Mới trong UserController

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/users/admin/users` | Tạo user mới |
| PUT | `/api/users/admin/users/{userId}` | Cập nhật thông tin user |
| DELETE | `/api/users/admin/users/{userId}` | Xóa user |
| PUT | `/api/users/admin/users/{userId}/lock` | Khóa tài khoản |
| PUT | `/api/users/admin/users/{userId}/unlock` | Mở khóa tài khoản |
| PUT | `/api/users/admin/users/{userId}/freeze` | Đóng băng tài khoản |
| PUT | `/api/users/admin/users/{userId}/unfreeze` | Mở đóng băng tài khoản |

#### 1.3. Phương Thức Mới trong UserService
- `createUser(CreateUserRequest)`: Tạo user mới với validation email trùng lặp
- `updateUser(UUID, UpdateUserRequest)`: Cập nhật thông tin user
- `deleteUser(UUID)`: Xóa user khỏi database
- Các phương thức này đều publish Kafka events để tracking

### 2. Frontend Implementation

#### 2.1. API Client Functions (api.ts)

Đã thêm các functions:
```typescript
- createUser(token, payload): Tạo user mới
- updateUser(token, userId, payload): Cập nhật user
- deleteUser(token, userId): Xóa user
- lockUser(token, userId): Khóa tài khoản
- unlockUser(token, userId): Mở khóa
- freezeUser(token, userId): Đóng băng
- unfreezeUser(token, userId): Mở đóng băng
```

#### 2.2. Dialog Components

**CreateUserDialog.tsx**:
- Form tạo user mới với các trường:
  - Email (required)
  - Password (required, min 6 chars)
  - Họ tên (required)
  - Vai trò (CUSTOMER/STAFF/ADMIN)
  - CCCD (cho CUSTOMER)
  - Mã nhân viên (cho STAFF/ADMIN)
- Validation và error handling
- Auto-reset form sau khi tạo thành công

**EditUserDialog.tsx**:
- Form chỉnh sửa thông tin user
- Các trường tương tự CreateUserDialog (trừ email và password)
- Pre-fill dữ liệu hiện tại của user
- Conditional rendering dựa trên role

#### 2.3. Users Page (Users.tsx)

Đã cập nhật với đầy đủ chức năng:

**Chức năng chính:**
1. ✅ Xem danh sách users với search/filter
2. ✅ Thêm user mới (button + dialog)
3. ✅ Chỉnh sửa thông tin user
4. ✅ Xóa user (với confirmation dialog)
5. ✅ Khóa/Mở khóa tài khoản
6. ✅ Đóng băng/Mở đóng băng tài khoản

**Dropdown Menu Actions:**
- Chỉnh sửa (Edit icon)
- Khóa/Mở khóa (Lock/Unlock icon) - conditional
- Đóng băng/Mở đóng băng (Snowflake icon) - conditional
- Xóa (Trash icon) - với confirmation

**State Management:**
- Loading states
- Error handling với error messages
- Dialog states (create, edit, delete)
- Auto-refresh sau mỗi action

## Cấu Trúc Database

### Bảng users (user_db)
```sql
- user_id: UUID (PK)
- email: VARCHAR(100) UNIQUE
- password_hash: VARCHAR(255)
- full_name: VARCHAR(150)
- status: VARCHAR(20) (ACTIVE/LOCKED/FROZEN)
- role: VARCHAR(20) (CUSTOMER/STAFF/ADMIN)
- citizen_id: VARCHAR(20)
- employee_code: VARCHAR(20)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Bảng counter_staff (transaction_db)
```sql
- counter_staff_id: UUID (PK)
- counter_id: UUID (FK)
- user_id: UUID (FK to users)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Luồng Hoạt Động

### 1. Tạo User Mới
```
User clicks "Thêm người dùng" 
→ CreateUserDialog opens
→ User fills form (email, password, name, role, etc.)
→ Submit → POST /api/users/admin/users
→ Backend validates & creates user
→ Success → Dialog closes & table refreshes
```

### 2. Chỉnh Sửa User
```
User clicks "..." → "Chỉnh sửa"
→ EditUserDialog opens with pre-filled data
→ User modifies fields
→ Submit → PUT /api/users/admin/users/{userId}
→ Backend updates user
→ Success → Dialog closes & table refreshes
```

### 3. Xóa User
```
User clicks "..." → "Xóa"
→ AlertDialog shows confirmation
→ User confirms
→ DELETE /api/users/admin/users/{userId}
→ Backend deletes user
→ Success → Dialog closes & table refreshes
```

### 4. Thay Đổi Trạng Thái
```
User clicks "..." → "Khóa/Mở khóa/Đóng băng"
→ PUT /api/users/admin/users/{userId}/{action}
→ Backend updates status
→ Success → Table refreshes
```

## Security & Authorization

- Tất cả endpoints yêu cầu JWT token trong Authorization header
- Chỉ user có role ADMIN mới có quyền truy cập
- Backend verify role từ JWT token trước khi thực hiện action
- Return 403 Forbidden nếu không có quyền

## Testing Checklist

### Backend Testing
- [ ] POST /api/users/admin/users - Tạo user mới
- [ ] POST /api/users/admin/users - Validate email trùng lặp
- [ ] PUT /api/users/admin/users/{userId} - Cập nhật user
- [ ] DELETE /api/users/admin/users/{userId} - Xóa user
- [ ] PUT /api/users/admin/users/{userId}/lock - Khóa user
- [ ] PUT /api/users/admin/users/{userId}/unlock - Mở khóa user
- [ ] PUT /api/users/admin/users/{userId}/freeze - Đóng băng user
- [ ] PUT /api/users/admin/users/{userId}/unfreeze - Mở đóng băng user
- [ ] Verify admin authorization cho tất cả endpoints

### Frontend Testing
- [ ] Hiển thị danh sách users
- [ ] Search/filter users
- [ ] Mở CreateUserDialog và tạo user mới
- [ ] Validate form fields (email format, password length)
- [ ] Mở EditUserDialog và cập nhật user
- [ ] Conditional rendering (CCCD cho CUSTOMER, Mã NV cho STAFF/ADMIN)
- [ ] Xóa user với confirmation
- [ ] Khóa/Mở khóa user
- [ ] Đóng băng/Mở đóng băng user
- [ ] Error handling và hiển thị error messages
- [ ] Auto-refresh sau mỗi action

## Files Modified/Created

### Backend
- ✅ `services/user-service/.../dto/CreateUserRequest.java` (NEW)
- ✅ `services/user-service/.../dto/UpdateUserRequest.java` (NEW)
- ✅ `services/user-service/.../service/UserService.java` (MODIFIED)
- ✅ `services/user-service/.../controller/UserController.java` (MODIFIED)

### Frontend
- ✅ `banking-admin-hub-main/.../lib/api.ts` (MODIFIED)
- ✅ `banking-admin-hub-main/.../components/admin/CreateUserDialog.tsx` (NEW)
- ✅ `banking-admin-hub-main/.../components/admin/EditUserDialog.tsx` (NEW)
- ✅ `banking-admin-hub-main/.../pages/admin/Users.tsx` (MODIFIED)

## Ghi Chú Quan Trọng

1. **Password Security**: Password được hash bằng BCrypt trước khi lưu vào database
2. **Kafka Events**: Mỗi action (CREATE, UPDATE, DELETE) đều publish event để tracking
3. **Soft Delete vs Hard Delete**: Hiện tại đang dùng hard delete, có thể cân nhắc chuyển sang soft delete
4. **Role-based UI**: Form fields thay đổi dựa trên role được chọn
5. **Validation**: Cả frontend và backend đều có validation để đảm bảo data integrity

## Next Steps (Tùy Chọn)

1. Thêm chức năng gán nhân viên vào quầy từ trang Users
2. Thêm pagination cho danh sách users
3. Thêm advanced filters (theo role, status, date range)
4. Thêm bulk actions (xóa nhiều users cùng lúc)
5. Thêm audit log để track changes
6. Thêm chức năng export users to CSV/Excel
