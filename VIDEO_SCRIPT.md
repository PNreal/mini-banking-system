# KỊCH BẢN VIDEO TRÌNH BÀY - MINI BANKING SYSTEM
## Thời lượng: Dưới 7 phút | Team 6 members

---

## PHẦN 1: MỞ ĐẦU (0:00 - 0:45)

### [SLIDE: Logo + Tên dự án]

**Người trình bày xuất hiện trên màn hình**

> "Xin chào mọi người! Hôm nay nhóm chúng mình sẽ giới thiệu đến các bạn sản phẩm **Mini Banking System** - một hệ thống ngân hàng số được xây dựng theo kiến trúc microservices hiện đại.
>
> Đây là sản phẩm được phát triển bởi nhóm 6 thành viên, với mục tiêu mang đến trải nghiệm ngân hàng số tiện lợi, an toàn và dễ sử dụng cho tất cả mọi người."

### [SLIDE: Giới thiệu nhóm - Ảnh các thành viên]

> "Trước tiên, cho phép mình giới thiệu qua về đội ngũ phát triển..."
> 
> *(Giới thiệu nhanh tên và vai trò của 6 thành viên - khoảng 15 giây)*

---

## PHẦN 2: TỔNG QUAN SẢN PHẨM (0:45 - 1:30)

### [SLIDE: Kiến trúc hệ thống - Sơ đồ microservices]

**Người trình bày:**

> "Mini Banking System được xây dựng với kiến trúc microservices, bao gồm:
>
> - **7 Backend Services** độc lập: User Service, Account Service, Transaction Service, Admin Service, Log Service, Notification Service và API Gateway
> - **2 Frontend Applications**: Giao diện khách hàng và Giao diện quản trị
> - **Hệ thống Database** PostgreSQL riêng biệt cho từng service
> - **Message Queue** Kafka để xử lý các sự kiện bất đồng bộ
>
> Toàn bộ hệ thống được đóng gói bằng Docker, chỉ cần một lệnh duy nhất là có thể khởi động toàn bộ."

### [SLIDE: Công nghệ sử dụng]

> "Về công nghệ, chúng mình sử dụng:
> - **Backend**: Java Spring Boot
> - **Frontend**: React + Vite
> - **Database**: PostgreSQL
> - **Message Queue**: Apache Kafka
> - **Containerization**: Docker & Docker Compose"

---

## PHẦN 3: DEMO CHỨC NĂNG KHÁCH HÀNG (1:30 - 3:30)

### [CHUYỂN SANG DEMO TRỰC TIẾP - Màn hình chia đôi: Người trình bày + Giao diện]

**Người trình bày:**

> "Bây giờ mình sẽ demo các chức năng chính dành cho khách hàng."

### 3.1. Đăng ký & Đăng nhập (30 giây)

**[Demo trên màn hình]**

> "Đầu tiên là chức năng **Đăng ký tài khoản**. Khách hàng chỉ cần nhập email, mật khẩu, họ tên và số điện thoại.
>
> Sau khi đăng ký thành công, hệ thống sẽ tự động tạo một tài khoản ngân hàng cho khách hàng.
>
> Tiếp theo là **Đăng nhập**. Mình sẽ đăng nhập với tài khoản test..."

*(Thực hiện đăng nhập)*

### 3.2. Xác minh KYC (30 giây)

**[Demo màn hình KYC]**

> "Để sử dụng đầy đủ các chức năng giao dịch, khách hàng cần hoàn thành **xác minh KYC** - Know Your Customer.
>
> Khách hàng cần cung cấp:
> - Thông tin CCCD: số CCCD, họ tên, ngày sinh, giới tính
> - Địa chỉ thường trú và địa chỉ hiện tại
> - Ảnh CCCD mặt trước, mặt sau và ảnh selfie
>
> Sau khi gửi, yêu cầu sẽ được nhân viên ngân hàng xét duyệt."

### 3.3. Nạp tiền (30 giây)

**[Demo chức năng nạp tiền]**

> "Hệ thống hỗ trợ **3 hình thức nạp tiền**:
>
> 1. **Nạp qua ví điện tử** - nạp trực tiếp, tiền vào tài khoản ngay lập tức
> 2. **Quét mã QR** - tích hợp thanh toán QR
> 3. **Nạp tại quầy** - tạo yêu cầu nạp tiền, nhân viên xác nhận
>
> Mình sẽ demo nạp tiền qua ví điện tử..."

*(Thực hiện nạp 1,000,000 VND)*

> "Như các bạn thấy, số dư đã được cập nhật ngay lập tức."

### 3.4. Chuyển khoản (30 giây)

**[Demo chức năng chuyển khoản]**

> "Tiếp theo là chức năng **Chuyển khoản**. Khách hàng nhập số tài khoản người nhận và số tiền muốn chuyển.
>
> Hệ thống sẽ kiểm tra số dư và thực hiện giao dịch. Cả người gửi và người nhận đều nhận được thông báo ngay lập tức."

*(Thực hiện chuyển khoản)*

### 3.5. Rút tiền & Lịch sử giao dịch (30 giây)

**[Demo rút tiền và lịch sử]**

> "Chức năng **Rút tiền** cũng hỗ trợ rút qua ví điện tử hoặc rút tại quầy.
>
> Và đây là **Lịch sử giao dịch** - khách hàng có thể xem tất cả các giao dịch đã thực hiện, lọc theo loại giao dịch, thời gian, và xem chi tiết từng giao dịch."

---

## PHẦN 4: DEMO CHỨC NĂNG NHÂN VIÊN (3:30 - 4:30)

### [CHUYỂN SANG GIAO DIỆN NHÂN VIÊN]

**Người trình bày:**

> "Tiếp theo, mình sẽ demo các chức năng dành cho nhân viên ngân hàng."

### 4.1. Dashboard nhân viên (20 giây)

**[Demo dashboard]**

> "Sau khi đăng nhập, nhân viên sẽ thấy **Dashboard** với các thống kê:
> - Số giao dịch hôm nay
> - Tổng số tiền giao dịch
> - Số yêu cầu đang chờ xử lý
> - Danh sách khách hàng gần đây"

### 4.2. Xác nhận giao dịch tại quầy (20 giây)

**[Demo xác nhận giao dịch]**

> "Khi khách hàng tạo yêu cầu nạp tiền tại quầy, nhân viên sẽ nhận được **thông báo real-time**.
>
> Nhân viên kiểm tra thông tin và nhấn **Xác nhận** để hoàn tất giao dịch. Tiền sẽ được cộng vào tài khoản khách hàng ngay lập tức."

### 4.3. Duyệt KYC (20 giây)

**[Demo duyệt KYC]**

> "Nhân viên cũng có quyền **duyệt yêu cầu KYC** của khách hàng.
>
> Nhân viên xem thông tin, kiểm tra ảnh CCCD, và quyết định **Phê duyệt** hoặc **Từ chối** với lý do cụ thể."

---

## PHẦN 5: DEMO CHỨC NĂNG ADMIN (4:30 - 5:30)

### [CHUYỂN SANG GIAO DIỆN ADMIN]

**Người trình bày:**

> "Cuối cùng là các chức năng dành cho Admin - quản trị viên hệ thống."

### 5.1. Dashboard Admin (20 giây)

**[Demo admin dashboard]**

> "Admin có **Dashboard tổng quan** với:
> - Thống kê người dùng theo trạng thái
> - Biểu đồ giao dịch theo ngày
> - Tổng số tiền giao dịch
> - Các giao dịch gần đây"

### 5.2. Quản lý người dùng (20 giây)

**[Demo quản lý user]**

> "Admin có thể **quản lý tất cả người dùng**:
> - Xem danh sách users
> - **Khóa/Mở khóa** tài khoản vi phạm
> - **Đóng băng/Mở đóng băng** tài khoản theo yêu cầu
> - Xóa tài khoản nếu cần"

### 5.3. Quản lý quầy giao dịch (20 giây)

**[Demo quản lý quầy]**

> "Một tính năng đặc biệt là **Quản lý quầy giao dịch**:
> - Tạo quầy mới với mã quầy, tên, địa chỉ
> - Hệ thống tự động tạo tài khoản admin quầy
> - Thêm/xóa nhân viên vào quầy
> - Theo dõi hoạt động của từng quầy"

---

## PHẦN 6: ĐIỂM NỔI BẬT & KẾT LUẬN (5:30 - 6:30)

### [SLIDE: Điểm nổi bật]

**Người trình bày:**

> "Tóm lại, Mini Banking System có những **điểm nổi bật** sau:
>
> 1. **Kiến trúc Microservices** - dễ mở rộng, bảo trì độc lập từng service
>
> 2. **Bảo mật cao** - JWT authentication, mã hóa mật khẩu BCrypt, cơ chế khóa tạm thời sau 5 lần đăng nhập sai
>
> 3. **Real-time Notification** - thông báo tức thì qua WebSocket
>
> 4. **Đa kênh giao dịch** - online và tại quầy
>
> 5. **Xác minh KYC** - đảm bảo định danh khách hàng
>
> 6. **Docker hóa hoàn toàn** - triển khai dễ dàng với một lệnh duy nhất"

### [SLIDE: Kết quả đạt được]

> "Về kết quả đạt được:
> - Hoàn thành **100% các chức năng** theo yêu cầu
> - Hệ thống chạy ổn định với **10+ tài khoản test**
> - Xử lý được các giao dịch đồng thời
> - Giao diện thân thiện, dễ sử dụng"

---

## PHẦN 7: KẾT THÚC (6:30 - 7:00)

### [SLIDE: Cảm ơn + Thông tin liên hệ]

**Người trình bày:**

> "Đó là toàn bộ phần trình bày về Mini Banking System của nhóm chúng mình.
>
> Cảm ơn mọi người đã theo dõi! Nếu có bất kỳ câu hỏi nào, xin vui lòng liên hệ với nhóm.
>
> Xin cảm ơn!"

---

## GHI CHÚ CHO NGƯỜI TRÌNH BÀY

### Chuẩn bị trước khi quay:

1. **Khởi động hệ thống:**
   ```bash
   docker-compose up -d
   ```

2. **Chuẩn bị các tài khoản test:**
   - Customer: `test.user@example.com` / `TestPassword#123`
   - Staff: `staff@minibank.com` / `Staff@123`
   - Admin: `admin@minibank.com` / `Admin@123`

3. **Mở sẵn các tab:**
   - Customer Web: http://localhost:3002
   - Admin Panel: http://localhost:3001

4. **Nạp sẵn tiền** vào tài khoản test để demo chuyển khoản

### Tips khi quay:

- Nói chậm, rõ ràng
- Pause 1-2 giây trước khi click để người xem theo kịp
- Zoom vào các phần quan trọng khi cần
- Giữ camera ổn định, ánh sáng đủ
- Kiểm tra âm thanh trước khi quay

### Phân chia thời gian:

| Phần | Thời gian | Nội dung |
|------|-----------|----------|
| 1 | 0:00 - 0:45 | Mở đầu, giới thiệu nhóm |
| 2 | 0:45 - 1:30 | Tổng quan sản phẩm |
| 3 | 1:30 - 3:30 | Demo khách hàng |
| 4 | 3:30 - 4:30 | Demo nhân viên |
| 5 | 4:30 - 5:30 | Demo admin |
| 6 | 5:30 - 6:30 | Điểm nổi bật |
| 7 | 6:30 - 7:00 | Kết thúc |

---

**Tổng thời lượng: ~7 phút**

*Lưu ý: KHÔNG speed-up video, giữ tốc độ tự nhiên*
