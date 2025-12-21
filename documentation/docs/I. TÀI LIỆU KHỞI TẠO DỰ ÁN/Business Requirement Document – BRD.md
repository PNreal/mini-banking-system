# **BUSINESS REQUIREMENT DOCUMENT (BRD)**

**Dự án:** Mini Banking System  
**Phiên bản:** 1.0  
**Ngày phát hành:** 22/12/2025  
**Người biên soạn:** Nhóm 7

## **1. Mục tiêu dự án (Project Purpose)** {#mục-tiêu-dự-án-project-purpose}

Hệ thống **Mini Banking System** được xây dựng nhằm mô phỏng các chức
năng cơ bản của ngân hàng trực tuyến, phục vụ mục đích **học tập, nghiên
cứu và thực hành phát triển hệ thống tài chính an toàn**.

Mục tiêu chính:

- Cung cấp nền tảng giao dịch (nạp, rút, chuyển tiền) mô phỏng.

- Quản lý người dùng, tài khoản, lịch sử giao dịch và log hệ thống.

- Xây dựng kiến trúc **Microservices** hiện đại với **Spring Boot,
  > PostgreSQL, ReactJS**.

- Đảm bảo **tính toàn vẹn dữ liệu, bảo mật và hiệu năng cao**.

## **2. Phạm vi (Scope)** {#phạm-vi-scope}

Hệ thống bao gồm 3 nhóm nghiệp vụ chính:

| **Nhóm**                | **Mô tả nghiệp vụ**                                                       | **Tác nhân chính** |
|-------------------------|---------------------------------------------------------------------------|--------------------|
| 1\. Quản lý tài khoản   | Đăng ký, đăng nhập, quên mật khẩu, đăng xuất, tự đóng băng (Self-Freeze). | User               |
| 2\. Giao dịch tài chính | Nạp tiền, rút tiền, chuyển khoản nội bộ, xem lịch sử giao dịch.           | User               |
| 3\. Quản trị hệ thống   | Quản lý người dùng, khóa/mở/đóng băng tài khoản, xem báo cáo giao dịch.   | Admin              |

## **3. Mục tiêu kinh doanh (Business Objectives)** {#mục-tiêu-kinh-doanh-business-objectives}

| **ID** | **Mục tiêu**                                | **Thành công khi**                                                      |
|--------|---------------------------------------------|-------------------------------------------------------------------------|
| OBJ-01 | Xây dựng hệ thống ngân hàng mô phỏng        | Các nghiệp vụ nạp, rút, chuyển, đăng ký, đăng nhập hoạt động chính xác. |
| OBJ-02 | Tăng cường bảo mật và minh bạch giao dịch   | Mọi hành động đều có log, mật khẩu mã hóa, token an toàn.               |
| OBJ-03 | Cung cấp công cụ giám sát cho quản trị viên | Admin có thể khóa/mở tài khoản, xem báo cáo, biểu đồ giao dịch.         |
| OBJ-04 | Đảm bảo khả năng mở rộng và hiệu năng       | Hệ thống hỗ trợ 10.000 user đồng thời, phản hồi \< 2 giây.              |

## **4. Tác nhân và nhu cầu (Stakeholders & Needs)** {#tác-nhân-và-nhu-cầu-stakeholders-needs}

| **Tác nhân**              | **Nhu cầu / Mong đợi**                                     |
|---------------------------|------------------------------------------------------------|
| Người dùng (User)         | Giao dịch dễ dàng, an toàn, lịch sử minh bạch.             |
| Quản trị viên (Admin)     | Quản lý hệ thống, kiểm soát tài khoản và báo cáo thống kê. |
| Nhóm phát triển           | Cấu trúc hệ thống rõ ràng, dễ mở rộng và kiểm thử.         |
| Giảng viên / Doanh nghiệp | Sản phẩm minh họa tốt cho quy trình phát triển phần mềm.   |

## **5. Phân tích nghiệp vụ chính (Business Process Overview)** {#phân-tích-nghiệp-vụ-chính-business-process-overview}

### **5.1. Quản lý tài khoản người dùng** {#quản-lý-tài-khoản-người-dùng}

| **Chức năng** | **Input**                  | **Output**            |
|---------------|----------------------------|-----------------------|
| Đăng ký       | Email, Mật khẩu            | Tài khoản mới         |
| Đăng nhập     | Email, Mật khẩu            | Token phiên đăng nhập |
| Quên mật khẩu | Email → OTP → Mật khẩu mới | Reset thành công      |
| Đăng xuất     | Token                      | Phiên bị hủy          |
| Self-Freeze   | Mật khẩu/OTP               | Tài khoản → FROZEN    |

### **5.2. Giao dịch tài chính** {#giao-dịch-tài-chính}

| **Chức năng** | **Input**               | **Output**                         |
|---------------|-------------------------|------------------------------------|
| Nạp tiền      | Số tiền                 | Số dư tăng, lưu Transaction        |
| Rút tiền      | Số tiền                 | Số dư giảm, lưu Transaction        |
| Chuyển tiền   | Tài khoản nhận, số tiền | Giao dịch 2 chiều, lưu Transaction |
| Xem lịch sử   | Bộ lọc                  | Danh sách giao dịch                |

### **5.3. Quản trị hệ thống (Admin)** {#quản-trị-hệ-thống-admin}

| **Chức năng**       | **Input** | **Output**                          |
|---------------------|-----------|-------------------------------------|
| Xem danh sách user  | ---       | Danh sách người dùng                |
| Khóa / Mở tài khoản | user_id   | Cập nhật trạng thái                 |
| Freeze / Unfreeze   | user_id   | Trạng thái cập nhật                 |
| Xem báo cáo         | ---       | Báo cáo giao dịch, biểu đồ thống kê |

## **6. Yêu cầu nghiệp vụ (Business Requirements)** {#yêu-cầu-nghiệp-vụ-business-requirements}

| **ID** | **Tên yêu cầu**       | **Mô tả**                                           |
|--------|-----------------------|-----------------------------------------------------|
| BR-01  | Đăng ký tài khoản     | Người dùng tạo tài khoản mới với email duy nhất.    |
| BR-02  | Đăng nhập / Đăng xuất | Xác thực qua JWT, quản lý phiên đăng nhập.          |
| BR-03  | Quên mật khẩu         | Gửi OTP/token qua email, đổi mật khẩu trong 5 phút. |
| BR-04  | Nạp tiền              | Cộng số dư, lưu transaction, log lại hành động.     |
| BR-05  | Rút tiền              | Kiểm tra số dư, trừ tiền, ghi log giao dịch.        |
| BR-06  | Chuyển tiền           | Giao dịch ACID, cập nhật 2 tài khoản.               |
| BR-07  | Lịch sử giao dịch     | Hiển thị có phân trang, lọc theo thời gian / loại.  |
| BR-08  | Self-Freeze           | Người dùng tự khóa giao dịch của mình.              |
| BR-09  | Admin quản lý user    | Khóa, mở, freeze, unfreeze tài khoản.               |
| BR-10  | Xem báo cáo hệ thống  | Thống kê tổng số người dùng, giao dịch, lỗi.        |

## **7. Rủi ro và giả định (Risks & Assumptions)** {#rủi-ro-và-giả-định-risks-assumptions}

| **Loại**   | **Mô tả**                  | **Giải pháp**                |
|------------|----------------------------|------------------------------|
| Risk       | Lỗi mất đồng bộ giao dịch  | Dùng ACID, rollback tự động  |
| Risk       | Brute-force login          | Giới hạn 5 lần sai, khóa tạm |
| Assumption | Người dùng có email hợp lệ | Bắt buộc xác thực OTP        |
| Assumption | Server PostgreSQL ổn định  | Backup tự động hàng ngày     |

## **8. Tiêu chí chấp nhận (Acceptance Criteria)** {#tiêu-chí-chấp-nhận-acceptance-criteria}

| **Mã FR** | **Điều kiện đạt**                                                 |
|-----------|-------------------------------------------------------------------|
| FR-01     | Đăng ký thành công với email mới, mật khẩu hợp lệ.                |
| FR-04     | Số dư tăng chính xác sau khi nạp tiền.                            |
| FR-06     | Chuyển tiền thực hiện 2 chiều và ghi log đầy đủ.                  |
| FR-09     | Admin thao tác thay đổi trạng thái user thành công, log ghi nhận. |

## **9. Kết nối với các tài liệu kỹ thuật (Traceability Matrix)** {#kết-nối-với-các-tài-liệu-kỹ-thuật-traceability-matrix}

| **BRD**       | **SRS**       | **SAD**                   | **DBD**          |
|---------------|---------------|---------------------------|------------------|
| BR-01 → BR-03 | FR-01 → FR-03 | User Service              | users, account   |
| BR-04 → BR-06 | FR-04 → FR-06 | Transaction Service       | transaction      |
| BR-07         | FR-07         | Transaction + Log Service | transaction, log |
| BR-08         | FR-09         | User Service              | account.status   |
| BR-09 → BR-10 | FR-08         | Admin Service             | admin_db, log_db |

## **10. Kết luận** 

Tài liệu **BRD -- Mini Banking System** xác định rõ:

- Phạm vi nghiệp vụ, đối tượng liên quan, và yêu cầu chính.

- Cấu trúc nghiệp vụ gắn liền với tài liệu **SRS**, **SAD** và **DBD**.

- Là nền tảng cho việc thiết kế chi tiết (SDD), lập trình và kiểm thử.