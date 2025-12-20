# Hướng dẫn thiết lập Counters (Quầy giao dịch)

## Tổng quan

Hệ thống đã được cấu hình để tự động tạo dữ liệu mẫu cho các quầy giao dịch khi Transaction Service khởi động.

## Cấu trúc Database

### Bảng `counters`
- `counter_id` (UUID): Primary key
- `counter_code` (VARCHAR): Mã quầy (VD: Q001, Q002) - UNIQUE
- `name` (VARCHAR): Tên quầy
- `address` (VARCHAR): Địa chỉ
- `max_staff` (INTEGER): Số nhân viên tối đa
- `admin_user_id` (UUID): ID của admin quầy
- `is_active` (BOOLEAN): Trạng thái hoạt động
- `created_at`, `updated_at` (TIMESTAMP)

### Bảng `counter_staff`
- `counter_staff_id` (UUID): Primary key
- `counter_id` (UUID): Foreign key đến counters
- `user_id` (UUID): ID nhân viên (từ user-service)
- `is_active` (BOOLEAN): Trạng thái
- `created_at`, `updated_at` (TIMESTAMP)
- UNIQUE constraint: (counter_id, user_id)

## Dữ liệu mẫu

Khi Transaction Service khởi động, `TestCounterAdminInitializer` sẽ tự động tạo:

1. **Quầy Q001 - Quầy Trung tâm**
   - Địa chỉ: 123 Nguyễn Huệ, Q.1, TP.HCM
   - Max staff: 10
   - Admin: counter.admin@minibank.com
   - Trạng thái: Active

2. **Quầy Q002 - Quầy Thủ Đức**
   - Địa chỉ: 456 Võ Văn Ngân, TP. Thủ Đức
   - Max staff: 8
   - Admin: staff@minibank.com
   - Trạng thái: Active

3. **Quầy Q003 - Quầy Bình Thạnh**
   - Địa chỉ: 789 Điện Biên Phủ, Q. Bình Thạnh
   - Max staff: 6
   - Admin: Không có
   - Trạng thái: Inactive

4. **Quầy Q004 - Quầy Quận 7**
   - Địa chỉ: 321 Nguyễn Lương Bằng, Q.7
   - Max staff: 12
   - Admin: Không có
   - Trạng thái: Active

## Cách khởi động

### 1. Khởi động Database (Docker)
```powershell
docker-compose up -d postgres-transaction
```

### 2. Khởi động Transaction Service
```powershell
cd services/transaction-service/transaction-service
./mvnw spring-boot:run
```

Hoặc sử dụng script tổng:
```powershell
./start-services.ps1
```

### 3. Kiểm tra dữ liệu

Kết nối đến database:
```powershell
docker exec -it postgres-transaction-service psql -U transaction_user -d transaction_db
```

Xem các quầy:
```sql
SELECT counter_code, name, address, max_staff, is_active FROM counters;
```

Xem nhân viên trong quầy:
```sql
SELECT cs.counter_id, c.counter_code, cs.user_id, cs.is_active 
FROM counter_staff cs 
JOIN counters c ON cs.counter_id = c.counter_id;
```

## API Endpoints

### Lấy danh sách quầy
```
GET http://localhost:8083/api/v1/counters
```

### Lấy chi tiết quầy
```
GET http://localhost:8083/api/v1/counters/{counterId}
```

### Lấy danh sách nhân viên trong quầy
```
GET http://localhost:8083/api/v1/counters/{counterId}/staff
```

### Chỉ định admin quầy (chỉ ADMIN)
```
PATCH http://localhost:8083/api/v1/counters/{counterId}/admin-user
Headers: X-User-Role: ADMIN
Body: {
  "adminUserId": "uuid-here",
  "email": "admin@example.com"
}
```

## Truy cập Admin UI

1. Khởi động Frontend:
```powershell
cd frontend
npm start
```

2. Truy cập: http://localhost:3001/admin/counters

3. Đăng nhập với tài khoản admin:
   - Email: admin@minibank.com
   - Password: Admin@123

## Tài khoản test

### Admin tổng
- Email: admin@minibank.com
- Password: Admin@123
- Role: ADMIN

### Counter Admin
- Email: counter.admin@minibank.com
- Password: CounterAdmin@123
- Role: STAFF (nhưng là admin của Quầy Q001)

### Staff
- Email: staff@minibank.com
- Password: Staff@123
- Role: STAFF (admin của Quầy Q002)

## Xử lý sự cố

### Nếu không có dữ liệu mẫu

1. Kiểm tra logs của Transaction Service:
```powershell
# Xem logs trong console khi chạy service
```

2. Xóa database và tạo lại:
```powershell
docker-compose down -v postgres-transaction
docker-compose up -d postgres-transaction
```

3. Khởi động lại Transaction Service

### Nếu cần thêm quầy mới

Sửa file `TestCounterAdminInitializer.java` và thêm:
```java
createCounterIfNotExists("Q005", "Tên quầy mới", "Địa chỉ", 10, null, true);
```

Sau đó restart Transaction Service.

## Lưu ý

- Dữ liệu mẫu chỉ được tạo khi chưa tồn tại (kiểm tra theo `counter_code`)
- Hibernate sử dụng `ddl-auto=update` nên sẽ tự động tạo/cập nhật schema
- Init script SQL chỉ để tham khảo, không thực thi vì Hibernate đã tự động tạo bảng
- Trong production, nên tắt auto-initialization và sử dụng migration tools như Flyway/Liquibase
