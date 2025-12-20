# KYC Database Design Documentation

## Tổng quan

Hệ thống KYC (Know Your Customer) được thiết kế để lưu trữ và quản lý thông tin định danh khách hàng, bao gồm thông tin CCCD/CMND và hình ảnh xác minh.

## Database Schema

### Bảng: `kyc_requests`

Lưu trữ các yêu cầu xác minh KYC của khách hàng.

#### Cấu trúc bảng:

| Cột | Kiểu dữ liệu | Mô tả |
|-----|-------------|-------|
| `kyc_id` | UUID | Primary key, ID duy nhất của KYC request |
| `user_id` | UUID | Foreign key đến bảng users |
| `citizen_id` | VARCHAR(20) | Số CCCD/CMND |
| `full_name` | VARCHAR(150) | Họ tên đầy đủ |
| `date_of_birth` | DATE | Ngày sinh |
| `gender` | VARCHAR(10) | Giới tính (MALE, FEMALE, OTHER) |
| `place_of_issue` | VARCHAR(100) | Nơi cấp CCCD |
| `date_of_issue` | DATE | Ngày cấp |
| `expiry_date` | DATE | Ngày hết hạn |
| `permanent_address` | VARCHAR(200) | Địa chỉ thường trú |
| `current_address` | VARCHAR(200) | Địa chỉ hiện tại |
| `phone_number` | VARCHAR(20) | Số điện thoại |
| `email` | VARCHAR(100) | Email |
| `front_id_image_url` | VARCHAR(500) | URL hình CCCD mặt trước |
| `back_id_image_url` | VARCHAR(500) | URL hình CCCD mặt sau |
| `selfie_image_url` | VARCHAR(500) | URL ảnh chân dung |
| `status` | VARCHAR(20) | Trạng thái (PENDING, APPROVED, REJECTED, RESUBMITTED) |
| `verified_by` | UUID | ID nhân viên xác minh |
| `verified_at` | TIMESTAMP | Thời điểm xác minh |
| `rejection_reason` | VARCHAR(500) | Lý do từ chối (nếu có) |
| `notes` | VARCHAR(1000) | Ghi chú của nhân viên |
| `created_at` | TIMESTAMP | Thời điểm tạo |
| `updated_at` | TIMESTAMP | Thời điểm cập nhật |

#### Indexes:

- `idx_kyc_user_id` - Index trên user_id để tìm KYC của user nhanh
- `idx_kyc_status` - Index trên status để lọc theo trạng thái
- `idx_kyc_citizen_id` - Index trên citizen_id để tìm theo CCCD
- `idx_kyc_verified_by` - Index trên verified_by để xem KYC do staff nào xác minh
- `idx_kyc_created_at` - Index trên created_at để sắp xếp theo thời gian

#### Foreign Keys:

- `fk_kyc_user`: user_id → users(user_id) ON DELETE CASCADE

## Enum: KycStatus

Các trạng thái của KYC request:

- `PENDING` - Chờ xác minh
- `APPROVED` - Đã duyệt
- `REJECTED` - Từ chối
- `RESUBMITTED` - Nộp lại sau khi bị từ chối

## Entity: KycRequest

Java entity tương ứng với bảng `kyc_requests`.

### Các trường chính:

```java
@Entity
@Table(name = "kyc_requests")
public class KycRequest {
    @Id
    @UuidGenerator
    private UUID id;
    
    private UUID userId;
    private String citizenId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String placeOfIssue;
    private LocalDate dateOfIssue;
    private LocalDate expiryDate;
    private String permanentAddress;
    private String currentAddress;
    private String phoneNumber;
    private String email;
    private String frontIdImageUrl;
    private String backIdImageUrl;
    private String selfieImageUrl;
    
    @Enumerated(EnumType.STRING)
    private KycStatus status;
    
    private UUID verifiedBy;
    private Instant verifiedAt;
    private String rejectionReason;
    private String notes;
    
    private Instant createdAt;
    private Instant updatedAt;
}
```

## Repository: KycRequestRepository

Interface repository với các query methods:

### Các methods chính:

1. `findFirstByUserIdOrderByCreatedAtDesc(UUID userId)` - Lấy KYC request mới nhất của user
2. `findByUserIdOrderByCreatedAtDesc(UUID userId)` - Lấy tất cả KYC requests của user
3. `findByStatus(KycStatus status, Pageable pageable)` - Tìm theo trạng thái với phân trang
4. `findByStatusOrderByCreatedAtAsc(KycStatus status, Pageable pageable)` - Tìm theo trạng thái, sắp xếp theo thời gian
5. `countByStatus(KycStatus status)` - Đếm số lượng KYC theo trạng thái
6. `countPendingRequests(KycStatus status)` - Đếm số KYC đang chờ
7. `findByVerifiedByOrderByVerifiedAtDesc(UUID staffId, Pageable pageable)` - Lấy KYC do staff xác minh
8. `existsByUserIdAndStatus(UUID userId, KycStatus status)` - Kiểm tra user đã có KYC approved chưa
9. `findByCitizenIdAndStatus(String citizenId, KycStatus status)` - Tìm theo CCCD và trạng thái

## DTOs

### 1. KycRequestDto

DTO để tạo KYC request mới:

```java
@Data
public class KycRequestDto {
    @NotBlank
    private String citizenId;
    
    @NotBlank
    private String fullName;
    
    @NotNull
    private LocalDate dateOfBirth;
    
    private String gender;
    private String placeOfIssue;
    private LocalDate dateOfIssue;
    private LocalDate expiryDate;
    
    @NotBlank
    private String permanentAddress;
    
    private String currentAddress;
    
    @NotBlank
    private String phoneNumber;
    
    @Email
    private String email;
    
    private String frontIdImageUrl;
    private String backIdImageUrl;
    private String selfieImageUrl;
}
```

### 2. KycResponse

DTO để trả về thông tin KYC:

```java
@Data
public class KycResponse {
    private UUID kycId;
    private UUID userId;
    private String citizenId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String placeOfIssue;
    private LocalDate dateOfIssue;
    private LocalDate expiryDate;
    private String permanentAddress;
    private String currentAddress;
    private String phoneNumber;
    private String email;
    private String frontIdImageUrl;
    private String backIdImageUrl;
    private String selfieImageUrl;
    private KycStatus status;
    private UUID verifiedBy;
    private LocalDateTime verifiedAt;
    private String rejectionReason;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 3. KycReviewRequest

DTO để nhân viên xác minh KYC:

```java
@Data
public class KycReviewRequest {
    @NotNull
    private KycStatus status; // APPROVED or REJECTED
    
    private String rejectionReason; // Required if REJECTED
    private String notes;
}
```

## Dữ liệu mẫu

Script khởi tạo bao gồm 4 KYC requests mẫu:

1. **customer1@example.com** - APPROVED (đã được staff1 xác minh)
2. **customer2@example.com** - PENDING (đang chờ xác minh)
3. **customer3@example.com** - REJECTED (bị staff2 từ chối do hình ảnh mờ)
4. **test.user@example.com** - PENDING (KYC mới)

## Workflow KYC

### 1. Customer submit KYC:
- Customer điền thông tin và upload hình ảnh
- Status: PENDING
- Tạo record mới trong `kyc_requests`

### 2. Staff review KYC:
- Staff xem danh sách KYC PENDING
- Kiểm tra thông tin và hình ảnh
- Approve hoặc Reject

### 3. Approve:
- Status: PENDING → APPROVED
- Set `verified_by` = staff ID
- Set `verified_at` = current timestamp
- Có thể thêm notes

### 4. Reject:
- Status: PENDING → REJECTED
- Set `verified_by` = staff ID
- Set `verified_at` = current timestamp
- Bắt buộc có `rejection_reason`
- Customer có thể submit lại (RESUBMITTED)

### 5. Resubmit:
- Customer sửa thông tin/hình ảnh
- Tạo KYC request mới hoặc update existing
- Status: RESUBMITTED → PENDING (sau khi submit)

## Tích hợp với hệ thống

### User Service:
- KYC data được lưu trong user-service database
- Liên kết với bảng `users` qua `user_id`

### Transaction Service:
- Có thể check KYC status trước khi cho phép giao dịch lớn
- Dashboard nhân viên hiển thị `kycRequestsCount`

### File Storage:
- Hình ảnh CCCD và selfie được lưu trên file storage
- URL được lưu trong database
- Có thể dùng local storage, S3, hoặc MinIO

## Security Considerations

1. **Data Privacy**: Thông tin KYC là dữ liệu nhạy cảm, cần mã hóa khi lưu trữ
2. **Access Control**: Chỉ staff có quyền xem/xác minh KYC
3. **Image Storage**: Hình ảnh nên được lưu an toàn với access control
4. **Audit Trail**: Lưu lại lịch sử thay đổi status và người xác minh
5. **Data Retention**: Cần policy về thời gian lưu trữ dữ liệu KYC

## Next Steps

Để hoàn thiện hệ thống KYC, cần implement:

1. **KycService** - Business logic cho KYC operations
2. **KycController** - REST API endpoints
3. **File Upload Service** - Xử lý upload hình ảnh
4. **KYC Verification UI** - Giao diện cho staff xác minh
5. **Customer KYC UI** - Giao diện cho customer submit KYC
6. **Notification** - Thông báo khi KYC được approve/reject
7. **Integration Tests** - Test các workflow KYC
