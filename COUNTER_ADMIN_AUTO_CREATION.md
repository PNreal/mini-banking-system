# Tự động tạo tài khoản Admin Quầy khi tạo Quầy mới

## Tổng quan

Khi tạo quầy giao dịch mới, hệ thống sẽ tự động tạo tài khoản cho người quản lý quầy (COUNTER_ADMIN) nếu cung cấp thông tin email, họ tên và số điện thoại.

## Luồng hoạt động

```
1. Admin tổng tạo quầy mới với thông tin admin quầy
   ↓
2. Transaction Service gọi User Service để tạo tài khoản COUNTER_ADMIN
   ↓
3. User Service tạo tài khoản với:
   - Role: COUNTER_ADMIN
   - Employee Code: Tự động sinh (CA + 6 số)
   - Password: Tự động sinh (12 ký tự ngẫu nhiên)
   - Status: ACTIVE
   - Email Verified: true
   ↓
4. Transaction Service tạo quầy và liên kết với admin vừa tạo
   ↓
5. Thêm admin vào danh sách nhân viên quầy (counter_staff)
   ↓
6. Trả về thông tin quầy + thông tin tài khoản admin (bao gồm password tạm thời)
```

## API Endpoint

### Tạo quầy với admin mới

**POST** `/api/v1/counters`

**Headers:**
```
X-User-Role: ADMIN
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "counterCode": "Q001",
  "name": "Quầy Giao Dịch Số 1",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "maxStaff": 5,
  "adminEmail": "admin.q001@minibank.com",
  "adminFullName": "Nguyễn Văn A",
  "adminPhoneNumber": "0901234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "counter": {
      "counterId": "uuid-counter",
      "counterCode": "Q001",
      "name": "Quầy Giao Dịch Số 1",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "maxStaff": 5,
      "adminUserId": "uuid-admin",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    },
    "adminAccount": {
      "userId": "uuid-admin",
      "email": "admin.q001@minibank.com",
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0901234567",
      "role": "COUNTER_ADMIN",
      "employeeCode": "CA123456",
      "generatedPassword": "Abc123!@#Xyz"
    }
  }
}
```

### Tạo quầy với admin có sẵn

Nếu đã có tài khoản admin, chỉ cần truyền `adminUserId`:

```json
{
  "counterCode": "Q002",
  "name": "Quầy Giao Dịch Số 2",
  "address": "456 Đường XYZ, Quận 2, TP.HCM",
  "maxStaff": 3,
  "adminUserId": "existing-admin-uuid"
}
```

## Thông tin tài khoản được tạo

### Employee Code
- Format: `{PREFIX}{6_DIGITS}`
- Prefix theo role:
  - `CA` - COUNTER_ADMIN
  - `CS` - COUNTER_STAFF
  - `KS` - KYC_STAFF
  - `AD` - ADMIN
- Ví dụ: `CA123456`, `CA789012`

### Password
- Độ dài: 12 ký tự
- Bao gồm: chữ hoa, chữ thường, số, ký tự đặc biệt
- Ví dụ: `Abc123!@#Xyz`, `P@ssw0rd2024`
- **Lưu ý:** Password chỉ hiển thị 1 lần trong response, cần lưu lại để gửi cho admin quầy

### Trạng thái
- Status: `ACTIVE`
- Email Verified: `true`
- Role: `COUNTER_ADMIN`

## Database

### Bảng users (user-service)
```sql
INSERT INTO users (
  user_id, email, password_hash, full_name, phone_number,
  role, employee_code, status, email_verified
) VALUES (
  'uuid', 'admin.q001@minibank.com', 'hashed_password',
  'Nguyễn Văn A', '0901234567',
  'COUNTER_ADMIN', 'CA123456', 'ACTIVE', true
);
```

### Bảng counters (transaction-service)
```sql
INSERT INTO counters (
  counter_id, counter_code, name, address, max_staff, admin_user_id, is_active
) VALUES (
  'uuid', 'Q001', 'Quầy Giao Dịch Số 1', '123 Đường ABC', 5, 'admin_uuid', true
);
```

### Bảng counter_staff (transaction-service)
```sql
INSERT INTO counter_staff (
  counter_staff_id, counter_id, user_id, is_active
) VALUES (
  'uuid', 'counter_uuid', 'admin_uuid', true
);
```

## Validation

### Khi tạo admin mới (có adminEmail)
- ✅ `adminEmail` phải hợp lệ và chưa tồn tại
- ✅ `adminFullName` bắt buộc
- ✅ `adminPhoneNumber` bắt buộc
- ✅ `counterCode` phải unique

### Khi dùng admin có sẵn (có adminUserId)
- ✅ `adminUserId` phải tồn tại trong user-service
- ✅ `counterCode` phải unique

## Error Handling

### Email đã tồn tại
```json
{
  "success": false,
  "message": "Email already in use",
  "data": null
}
```

### Thiếu thông tin admin
```json
{
  "success": false,
  "message": "Admin full name is required when creating admin account",
  "data": null
}
```

### Counter code đã tồn tại
```json
{
  "success": false,
  "message": "Counter code already exists: Q001",
  "data": null
}
```

## Quyền truy cập

- Chỉ **ADMIN** (admin tổng) mới có quyền tạo quầy
- Header `X-User-Role: ADMIN` bắt buộc

## Lưu ý quan trọng

1. **Password tạm thời:** Chỉ hiển thị 1 lần trong response, cần lưu lại và gửi cho admin quầy qua kênh bảo mật
2. **Employee Code:** Được tự động sinh, không thể tùy chỉnh (trừ khi truyền trong request)
3. **Email verification:** Tài khoản admin quầy được tạo sẵn nên đã verified, không cần xác thực email
4. **Counter staff:** Admin quầy tự động được thêm vào danh sách nhân viên của quầy đó

## Testing

### Test case 1: Tạo quầy với admin mới
```bash
curl -X POST http://localhost:8082/api/v1/counters \
  -H "Content-Type: application/json" \
  -H "X-User-Role: ADMIN" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "counterCode": "Q001",
    "name": "Quầy Giao Dịch Số 1",
    "address": "123 Đường ABC",
    "maxStaff": 5,
    "adminEmail": "admin.q001@minibank.com",
    "adminFullName": "Nguyễn Văn A",
    "adminPhoneNumber": "0901234567"
  }'
```

### Test case 2: Tạo quầy với admin có sẵn
```bash
curl -X POST http://localhost:8082/api/v1/counters \
  -H "Content-Type: application/json" \
  -H "X-User-Role: ADMIN" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "counterCode": "Q002",
    "name": "Quầy Giao Dịch Số 2",
    "address": "456 Đường XYZ",
    "maxStaff": 3,
    "adminUserId": "existing-admin-uuid"
  }'
```

## Tích hợp Frontend

Khi tạo quầy mới, frontend cần:

1. Hiển thị form với các trường:
   - Counter Code (required)
   - Name (required)
   - Address (optional)
   - Max Staff (required)
   - Admin Email (required nếu tạo mới)
   - Admin Full Name (required nếu tạo mới)
   - Admin Phone Number (required nếu tạo mới)

2. Sau khi tạo thành công:
   - Hiển thị thông tin quầy
   - **Hiển thị password tạm thời** trong modal/dialog
   - Cung cấp nút copy password
   - Cảnh báo: "Password chỉ hiển thị 1 lần, vui lòng lưu lại"

3. Gửi thông tin cho admin quầy:
   - Email: admin.q001@minibank.com
   - Employee Code: CA123456
   - Password: Abc123!@#Xyz
   - Link đăng nhập: https://minibank.com/staff/login
