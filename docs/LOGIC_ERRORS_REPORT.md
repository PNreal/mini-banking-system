# BÁO CÁO CÁC LỖI LOGIC TRONG TÀI LIỆU DỰ ÁN

**Ngày:** 2025-12-01  
**Người phân tích:** AI Assistant  
**Phiên bản tài liệu:** 1.0-2.0

---

## TÓM TẮT

Đã phát hiện **7 lỗi logic và mâu thuẫn** trong các tài liệu dự án Mini Banking System.

### Phân loại theo mức độ nghiêm trọng

| Mức độ | Số lượng | Mã lỗi |
|--------|----------|--------|
| **Nghiêm trọng (Critical)** | 3 | #1, #3, #7 |
| **Quan trọng (Important)** | 2 | #2, #5 |
| **Cảnh báo (Warning)** | 2 | #4, #6 |

### Tác động

Các lỗi này có thể dẫn đến:
- Triển khai sai nghiệp vụ
- Mâu thuẫn trong validation
- Lỗi bảo mật tiềm ẩn
- Vấn đề về tính nhất quán dữ liệu

---

## 1. LỖI: Mâu thuẫn điều kiện kiểm tra trạng thái tài khoản cho DEPOSIT

**Mức độ:** Nghiêm trọng (Critical)  
**File:** SRD.md  
**Vị trí:** FR-04 (Nạp tiền), dòng 389

### Mô tả

| Functional Requirement | Điều kiện hiện tại | Đánh giá |
|----------------------|-------------------|----------|
| **FR-04 (Nạp tiền)** | "Tài khoản **không** ở trạng thái FROZEN" | SAI - Cho phép LOCKED nạp tiền |
| **FR-05 (Rút tiền)** | "Tài khoản **ACTIVE**" | ĐÚNG |
| **FR-06 (Chuyển tiền)** | "Tài khoản người gửi **ACTIVE**" | ĐÚNG |

### Vấn đề

Theo định nghĩa trạng thái tài khoản (SRD 6.6):

| Trạng thái | Ý nghĩa |
|------------|---------|
| **ACTIVE** | Có thể giao dịch |
| **LOCKED** | Không thể đăng nhập |
| **FROZEN** | Đăng nhập được nhưng không giao dịch được |

**Logic đúng:** Tài khoản LOCKED không thể đăng nhập, nên không thể thực hiện bất kỳ giao dịch nào (kể cả nạp tiền).

### Giải pháp

**FR-04** nên sửa thành: **"Tài khoản ACTIVE"** (giống FR-05 và FR-06)

---

## 2. LỖI: Thiếu kiểm tra trạng thái tài khoản người nhận trong TRANSFER

**Mức độ:** Quan trọng (Important)  
**File:** SRD.md  
**Vị trí:** FR-06 (Chuyển tiền), dòng 479

### Mô tả

FR-06 hiện tại chỉ yêu cầu:

| Yêu cầu | Trạng thái |
|---------|-----------|
| Tài khoản người gửi | **ACTIVE** |
| Tài khoản người nhận | **Tồn tại** (THIẾU kiểm tra trạng thái) |

### Vấn đề

Nếu tài khoản người nhận ở trạng thái:

| Trạng thái | Vấn đề |
|------------|--------|
| **LOCKED** | Không thể đăng nhập → không thể nhận tiền? |
| **FROZEN** | Đăng nhập được nhưng không giao dịch được → có nên nhận tiền không? |

Theo logic nghiệp vụ, việc **nhận tiền** có thể được coi là một loại giao dịch, nên tài khoản FROZEN có thể không được phép nhận tiền.

### Giải pháp

Thêm điều kiện: **"Tài khoản người nhận phải ở trạng thái ACTIVE hoặc FROZEN"** (hoặc chỉ ACTIVE tùy nghiệp vụ)

---

## 3. LỖI: Flow Transfer không đảm bảo ACID trong kiến trúc Microservice

**Mức độ:** Nghiêm trọng (Critical)  
**File:** SIS.md  
**Vị trí:** 7.4 Chuyển tiền, dòng 202-208

### Mô tả

Flow hiện tại:

```
1. Transaction → Account Service (check balance)
2. Transaction → Account Service (decrease sender)
3. Transaction → Account Service (increase receiver)
4. Transaction → DB transaction commit
```

### Vấn đề

| Vấn đề | Mô tả |
|--------|-------|
| **HTTP calls riêng biệt** | Mỗi bước là một HTTP call riêng biệt giữa các microservice |
| **Mất tiền** | Nếu bước 3 thất bại sau khi bước 2 thành công → **MẤT TIỀN** |
| **Thiếu cơ chế** | Không có distributed transaction (2PC, Saga pattern) |

### Giải pháp

1. **Saga Pattern** với compensating transactions
2. **Distributed Transaction Manager** (nếu hỗ trợ)
3. **Gộp API call** - Gộp decrease + increase vào một API call duy nhất với transaction DB ở Account Service

---

## 4. LỖI: Thiếu validation trạng thái tài khoản trong Self-Freeze

**Mức độ:** Cảnh báo (Warning)  
**File:** SRD.md  
**Vị trí:** FR-09 (Self-Freeze), dòng 592

### Mô tả

FR-09 hiện tại chỉ yêu cầu:

| Yêu cầu | Trạng thái |
|---------|-----------|
| Tài khoản | **ACTIVE** |
| Người dùng | Đang đăng nhập |

**Thiếu:** Không đề cập rõ ràng đến trường hợp tài khoản đã **LOCKED**

### Vấn đề

| Tình huống | Đánh giá |
|------------|----------|
| Tài khoản LOCKED → không thể đăng nhập → không thể self-freeze | Hợp lý |
| Admin unlock → user đăng nhập → có thể self-freeze ngay? | Cần làm rõ |

Logic này có vẻ đúng, nhưng cần làm rõ trong tài liệu.

### Giải pháp

Làm rõ: **"Tài khoản phải ở trạng thái ACTIVE (không được LOCKED hoặc FROZEN)"**

---

## 5. CẢNH BÁO: Ràng buộc Transaction không đầy đủ trong Database

**Mức độ:** Quan trọng (Important)  
**File:** DBD.md, SRD.md  
**Vị trí:** DBD.md - 4.3 Bảng transaction, SRD.md - 6.4 Bảng Transaction

### Mô tả

Ràng buộc hiện tại:

| Loại giao dịch | Ràng buộc hiện tại |
|----------------|-------------------|
| DEPOSIT | to_acc NOT NULL |
| WITHDRAW | from_acc NOT NULL |
| TRANSFER | from_acc & to_acc đều NOT NULL |

### Vấn đề

**Thiếu ràng buộc:** Không có CHECK constraint đảm bảo:

| Loại giao dịch | Ràng buộc thiếu |
|----------------|----------------|
| DEPOSIT | from_acc phải NULL |
| WITHDRAW | to_acc phải NULL |
| TRANSFER | Cả hai đều NOT NULL |

### Giải pháp

Thêm CHECK constraint trong database:

```sql
CHECK (
  (type = 'DEPOSIT' AND from_acc IS NULL AND to_acc IS NOT NULL) OR
  (type = 'WITHDRAW' AND from_acc IS NOT NULL AND to_acc IS NULL) OR
  (type = 'TRANSFER' AND from_acc IS NOT NULL AND to_acc IS NOT NULL)
)
```

---

## 6. LỖI: Thiếu kiểm tra số dư tài khoản người nhận trong TRANSFER

**Mức độ:** Cảnh báo (Warning)  
**File:** SRD.md  
**Vị trí:** FR-06 (Chuyển tiền), dòng 477

### Mô tả

FR-06 hiện tại chỉ kiểm tra:

| Kiểm tra | Trạng thái |
|----------|-----------|
| Số dư người gửi | Đủ |
| Tài khoản người nhận | Tồn tại |

**Thiếu:** Không kiểm tra số dư tài khoản người nhận có hợp lệ không

### Vấn đề

Mặc dù không cần kiểm tra số dư người nhận để thực hiện chuyển tiền, nhưng có thể cần kiểm tra:

| Vấn đề tiềm ẩn | Mô tả |
|----------------|-------|
| Giới hạn số dư tối đa | Tài khoản người nhận có bị giới hạn không? |
| Ràng buộc số dư | Có ràng buộc nào về số dư sau khi nhận tiền không? |

### Giải pháp

Làm rõ trong tài liệu: **"Không cần kiểm tra số dư tài khoản người nhận"** (nếu đúng nghiệp vụ)

---

## 7. CẢNH BÁO: Thiếu xử lý race condition trong Transfer

**Mức độ:** Nghiêm trọng (Critical)  
**File:** SIS.md, SRD.md  
**Vị trí:** SIS.md - 7.4 Chuyển tiền, SRD.md - FR-06

### Mô tả

Flow hiện tại **thiếu**:
- Xử lý khi có nhiều request transfer đồng thời từ cùng một tài khoản
- Lock mechanism để tránh double spending

### Vấn đề

**Kịch bản:** User A có số dư 100.000 VND và thực hiện 2 request chuyển 80.000 VND đồng thời

| Request | Bước 1 | Bước 2 | Kết quả |
|---------|--------|--------|---------|
| Request 1 | check balance → 100.000 (đủ) | decrease → 20.000 | Thành công |
| Request 2 | check balance → 100.000 (đủ) | decrease → 20.000 | Thành công |
| **Kết quả** | | | **Số dư âm** (LỖI NGHIÊM TRỌNG) |

### Giải pháp

1. **Pessimistic locking** - SELECT FOR UPDATE khi check balance
2. **Optimistic locking** - Sử dụng version field
3. **Database constraint** - CHECK (balance >= 0) và handle exception

---

## TỔNG KẾT

### Thống kê lỗi

| Mức độ | Số lượng | Mã lỗi | Mô tả |
|--------|----------|--------|-------|
| **Nghiêm trọng (Critical)** | 3 | #1, #3, #7 | Ảnh hưởng đến tính toàn vẹn dữ liệu |
| **Quan trọng (Important)** | 2 | #2, #5 | Ảnh hưởng đến nghiệp vụ |
| **Cảnh báo (Warning)** | 2 | #4, #6 | Cải thiện tài liệu |

### Khuyến nghị sửa chữa

| Ưu tiên | Lỗi | Lý do |
|---------|-----|-------|
| **Cao** | #1, #3, #7 | Ảnh hưởng đến tính toàn vẹn dữ liệu và bảo mật |
| **Trung bình** | #2, #5 | Ảnh hưởng đến nghiệp vụ và validation |
| **Thấp** | #4, #6 | Cải thiện chất lượng tài liệu |

---

## GHI CHÚ

Tài liệu này được tạo tự động dựa trên phân tích các tài liệu:
- Software Requirements Specification (SRD)
- Database Design Document (DBD)
- Service Interaction Specification (SIS)
- API Specification

Cần review và xác nhận lại với team trước khi triển khai sửa chữa.

