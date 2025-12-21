TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRD)

Dự án: Mini Banking System

**Phiên bản:** 2.0

**Ngày:** 10/11/2025

**Cập nhật:** 22/12/2025

**Người biên soạn:** Nguyễn Văn Phương

1\. Giới thiệu

## 1.1. Mục tiêu {#mục-tiêu}

Tài liệu này mô tả đầy đủ các yêu cầu phần mềm cho hệ thống **Mini
Banking System**, một nền tảng mô phỏng ngân hàng trực tuyến phục vụ mục
đích học tập, thực hành phát triển hệ thống, và nghiên cứu quy trình
giao dịch tài chính cơ bản.

Mục tiêu chính của tài liệu:

- Xác định yêu cầu chức năng & phi chức năng.

- Làm cơ sở cho thiết kế, phát triển, kiểm thử.

- Thống nhất phạm vi hệ thống giữa các thành viên trong nhóm.

## 1.2. Phạm vi {#phạm-vi}

Mini Banking System cung cấp các chức năng:

- Đăng ký, đăng nhập, quên mật khẩu / đặt lại mật khẩu.

- Nạp tiền, rút tiền, chuyển khoản nội bộ.

- Xem lịch sử giao dịch.

- Quản lý người dùng dành cho Admin.

Hệ thống mô phỏng quy trình ngân hàng, **không xử lý tiền thật**, không
kết nối ngân hàng bên ngoài.

## 1.3. Đối tượng sử dụng {#đối-tượng-sử-dụng}

- **Khách hàng (User):  
  > **

  - Người có tài khoản giao dịch.

  - Có thể thực hiện các chức năng nạp -- rút -- chuyển tiền -- xem lịch
    > sử.

- **Quản trị viên (Admin):  
  > **

  - Quản lý tài khoản người dùng, khóa/mở tài khoản, xem báo cáo hệ
    > thống.

## 1.4. Định nghĩa & Từ viết tắt {#định-nghĩa-từ-viết-tắt}

| Từ viết tắt | Ý nghĩa                             |
|-------------|-------------------------------------|
| API         | Application Programming Interface   |
| UI          | User Interface                      |
| DB          | Database                            |
| OTP         | One-Time Password                   |
| SRS         | Software Requirements Specification |

## 1.5. Tài liệu tham chiếu {#tài-liệu-tham-chiếu}

- IEEE 830 -- Software Requirements Specification Standard

- Software Design Document (SDD)

- Test Plan

- Database Design Specification

- API Specification Document

##  **1.6. Giả định & phụ thuộc** {#giả-định-phụ-thuộc}

- Người dùng có kết nối Internet.

- Máy chủ hoạt động ổn định, database PostgreSQL sẵn sàng.

- Mỗi user chỉ có **một tài khoản giao dịch**.

- Mọi giao dịch tuân theo nguyên tắc **ACID** tại DB để tránh sai lệch
  > số dư.

# **2. Tổng quan hệ thống (Overall Description)** {#tổng-quan-hệ-thống-overall-description}

## 2.1. Góc nhìn sản phẩm (Product Perspective) {#góc-nhìn-sản-phẩm-product-perspective}

Mini Banking System là một hệ thống web mô phỏng ngân hàng, bao gồm:

Thành phần chính

- **Frontend (React)  
  > ** Hiển thị giao diện web, gửi yêu cầu đến backend qua API REST.

- **Backend (Spring Boot -- Java)  
  > ** Xử lý nghiệp vụ, xác thực, kiểm tra số dư, thực hiện giao dịch,
  > quản lý người dùng.

- **Database (PostgreSQL)  
  > ** Lưu trữ dữ liệu người dùng, tài khoản, giao dịch và log hệ thống.

- **Mail Service  
  > ** Dùng để gửi email xác thực cho chức năng **quên mật khẩu / reset
  > mật khẩu (FR-08)**.

### **Luồng hoạt động tổng quát**

- Người dùng đăng ký / đăng nhập.

- Ngay sau xác thực, người dùng được phép thực hiện:

  - Nạp tiền

  - Rút tiền

  - Chuyển khoản

  - Xem lịch sử giao dịch

- Mỗi giao dịch đều được lưu vào bảng **Transaction**.

- Mọi hành động của user/admin được ghi vào bảng **Log** để phục vụ theo
  > dõi.

- Admin truy cập trang quản trị để khóa/mở tài khoản hoặc xem thống kê.

## 2.2. Các chức năng tổng quát (System Features Overview) {#các-chức-năng-tổng-quát-system-features-overview}

Hệ thống cung cấp các nhóm chức năng chính:

1.  **Quản lý tài khoản người dùng  
    > **

    - Đăng ký

    - Đăng nhập

    - Đăng xuất

    - **Quên mật khẩu / đặt lại mật khẩu** (mới bổ sung)

2.  **Giao dịch tài chính  
    > **

    - Nạp tiền

    - Rút tiền

    - Chuyển khoản nội bộ

    - Xem lịch sử giao dịch

3.  **Quản trị hệ thống (Admin)  
    > **

    - Xem danh sách người dùng

    - Khoá / mở tài khoản

    - Xem báo cáo tổng quan giao dịch

## **2.3. Đặc điểm người dùng (User Characteristics)** {#đặc-điểm-người-dùng-user-characteristics}

### **Người dùng cuối (Customer)**

- Có kiến thức cơ bản về Internet.

- Biết thao tác với các hệ thống web phổ thông.

- Không yêu cầu kỹ năng kỹ thuật.

### **Quản trị viên (Administrator)**

- Thành thạo quản lý hệ thống.

- Có quyền truy cập vào bảng điều khiển admin.

- Được phép thực hiện tác vụ mức hệ thống.

## **2.4. Giới hạn hệ thống (System Constraints)** {#giới-hạn-hệ-thống-system-constraints}

- Tất cả giao dịch đều là **mô phỏng**, không dùng tiền thật.

- Tất cả giao dịch đều diễn ra **nội bộ** trong hệ thống Mini Banking.

- Token reset mật khẩu chỉ có hiệu lực **5 phút**.

- Không hỗ trợ đa tiền tệ.

- Backend phải duy trì tính nhất quán **ACID** (giao dịch ngân hàng bắt
  > buộc).

- Tốc độ phản hồi giao dịch ≤ 2 giây.

## **2.5. Giả định và phụ thuộc (Assumptions & Dependencies)** {#giả-định-và-phụ-thuộc-assumptions-dependencies}

- Người dùng có email hợp lệ để nhận OTP / link khôi phục mật khẩu.

- Máy chủ email hoạt động ổn định.

- Hệ thống sử dụng HTTPS cho toàn bộ giao tiếp.

- Mọi giao dịch rút/chuyển tiền chỉ thực hiện được khi **số dư đủ**.

- Quy tắc mật khẩu phải được tuân thủ (độ dài tối thiểu, độ mạnh).

## **2.6. Yêu cầu hệ thống (System Requirements)** {#yêu-cầu-hệ-thống-system-requirements}

### **Thiết bị & môi trường** {#thiết-bị-môi-trường}

- Trình duyệt hỗ trợ: Chrome, Firefox, Edge, Safari.

- Không yêu cầu cài đặt phần mềm phía người dùng.

- Hỗ trợ chạy trên PC & mobile.

### **Server yêu cầu**

- Spring Boot 3+

- PostgreSQL 13+

- Nginx / Apache (tuỳ triển khai)

- Mail server hoặc dịch vụ SMTP (Gmail API, Mailgun...)

# **PHẦN 3 --- YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS** {#phần-3-yêu-cầu-chức-năng-functional-requirements}

## **3.1. FR-01 --- Đăng ký tài khoản (Register)** {#fr-01-đăng-ký-tài-khoản-register}

### **Mô tả**

Cho phép người dùng tạo tài khoản mới với email duy nhất và mật khẩu hợp
lệ.

### **Tác nhân**

- User

### **Input**

- Email

- Mật khẩu

- Xác nhận mật khẩu

### **Điều kiện tiên quyết**

- Email chưa tồn tại

- Mật khẩu tuân thủ quy tắc độ mạnh

### **Luồng chính**

1.  Người dùng nhập email và mật khẩu.

2.  Hệ thống kiểm tra thông tin.

3.  Nếu hợp lệ → tạo tài khoản mới.

4.  Thông báo kết quả.

### **Luồng thay thế**

- Email tồn tại

- Mật khẩu yếu

### **Output**

- Tài khoản mới được tạo

## 3.2. FR-02 --- Đăng nhập (Login) {#fr-02-đăng-nhập-login}

### **Mô tả**

Xác thực người dùng bằng email và mật khẩu.

### **Tác nhân**

- User

### **Input**

- Email

- Mật khẩu

### **Điều kiện tiên quyết**

- Tài khoản không bị khóa

### **Luồng chính**

1.  Người dùng nhập email/mật khẩu.

2.  Hệ thống xác thực.

3.  Nếu hợp lệ → tạo phiên đăng nhập.

### **Luồng thay thế**

- Sai mật khẩu

- Tài khoản bị khóa

### **Output**

- Token/Session đăng nhập

## 3.3. FR-03 --- Quên mật khẩu / Reset mật khẩu (Forgot Password) {#fr-03-quên-mật-khẩu-reset-mật-khẩu-forgot-password}

### **Mô tả**

Cho phép người dùng khôi phục mật khẩu khi quên thông qua email xác
thực.

### **Tác nhân**

- User

### **Input**

- Email

- OTP hoặc reset token

- Mật khẩu mới

### **Điều kiện tiên quyết**

- Email tồn tại

- Token còn hiệu lực (≤ 5 phút)

### **Luồng chính**

1.  Người dùng chọn "Quên mật khẩu".

2.  Nhập email.

3.  Hệ thống gửi OTP/token.

4.  Người dùng nhập OTP hoặc mở link.

5.  Nhập mật khẩu mới.

6.  Hệ thống cập nhật mật khẩu.

### **Luồng thay thế**

- Email không tồn tại

- Token hết hạn

- OTP sai

### **Output**

- Mật khẩu mới được đặt

## 3.4. FR-04 --- Nạp tiền (Deposit Money) {#fr-04-nạp-tiền-deposit-money}

### **Mô tả**

Người dùng nạp tiền vào tài khoản của mình.

### **Tác nhân**

- User

### **Input**

- Số tiền nạp

### **Điều kiện tiên quyết**

- Đăng nhập

- Tài khoản **ACTIVE**

### **Luồng chính**

1.  Nhập số tiền nạp.

2.  Hệ thống kiểm tra hợp lệ.

3.  Cập nhật số dư.

4.  Ghi giao dịch.

### **Luồng thay thế**

- Nhập số tiền không hợp lệ (amount <= 0 hoặc không phải số)

- Tài khoản không ở trạng thái ACTIVE (FROZEN hoặc LOCKED) → trả về lỗi validation

### **Output**

- Số dư tăng

## 3.5. FR-05 --- Rút tiền (Withdraw Money) {#fr-05-rút-tiền-withdraw-money}

### **Mô tả**

Người dùng rút tiền từ tài khoản.

### **Tác nhân**

- User

### **Input**

- Số tiền rút

### **Điều kiện tiên quyết**

- Đăng nhập

- Tài khoản **ACTIVE  
  > **

- Có đủ số dư

### **Luồng chính**

1.  Nhập số tiền rút.

2.  Kiểm tra số dư.

3.  Trừ số dư.

4.  Ghi giao dịch.

### **Luồng thay thế**

- Không đủ số dư → trả về lỗi INSUFFICIENT_BALANCE

- Tài khoản không ở trạng thái ACTIVE (FROZEN hoặc LOCKED) → trả về lỗi validation

- Nhập số tiền không hợp lệ (amount <= 0 hoặc không phải số) → trả về lỗi validation

### **Output**

- Số dư giảm

## 3.6. FR-06 --- Chuyển tiền (Transfer Money) {#fr-06-chuyển-tiền-transfer-money}

### **Mô tả**

Người dùng chuyển tiền nội bộ đến tài khoản khác.

### **Tác nhân**

- User

### **Input**

- Số tài khoản người nhận

- Số tiền chuyển

### **Điều kiện tiên quyết**

- Đăng nhập

- Tài khoản người gửi **ACTIVE**

- Có đủ số dư

- Tài khoản người nhận tồn tại và ở trạng thái **ACTIVE** hoặc **FROZEN**

### **Luồng chính**

1.  Nhập thông tin chuyển tiền.

2.  Kiểm tra tài khoản nhận (tồn tại và trạng thái hợp lệ).

3.  Kiểm tra số dư người gửi (sử dụng pessimistic locking để tránh race condition).

4.  Thực hiện giao dịch ACID trong một transaction duy nhất (trừ người gửi -- cộng người nhận).

5.  Lưu lịch sử.

**Lưu ý:** 
- Không cần kiểm tra số dư tài khoản người nhận để thực hiện chuyển tiền.
- Phải sử dụng database locking (SELECT FOR UPDATE) khi kiểm tra và cập nhật số dư để tránh double spending.

### **Luồng thay thế**

- Tài khoản nhận không tồn tại

- Số dư không đủ

- Tài khoản bị đóng băng

### **Output**

- Giao dịch hoàn tất

## 3.7. FR-07 --- Xem lịch sử giao dịch (View Transaction History) {#fr-07-xem-lịch-sử-giao-dịch-view-transaction-history}

### **Mô tả**

Người dùng xem danh sách giao dịch của mình.

### **Tác nhân**

- User

### **Input**

- Bộ lọc (thời gian, loại giao dịch)

### **Luồng chính**

1.  Người dùng yêu cầu xem lịch sử.

2.  Hệ thống truy vấn DB.

3.  Hiển thị danh sách theo thời gian giảm dần.

### **Output**

- Danh sách giao dịch

## 3.8. FR-08 --- Quản lý người dùng (Admin Management) {#fr-08-quản-lý-người-dùng-admin-management}

### **Mô tả**

Admin quản lý trạng thái tài khoản người dùng.

### **Tác nhân**

- Admin

### **Chức năng bao gồm**

- Xem danh sách user

- Khóa tài khoản (LOCK)

- Mở khóa tài khoản (UNLOCK)

- Đóng băng tài khoản (FREEZE)

- Gỡ đóng băng (UNFREEZE)

- Xem báo cáo tổng quan

### **Điều kiện tiên quyết**

- Admin đăng nhập

### **Luồng chính**

1.  Admin mở trang quản trị.

2.  Chọn tài khoản cần thao tác.

3.  Cập nhật trạng thái.

4.  Lưu log hành động.

### **Output**

- Trạng thái tài khoản thay đổi

## 3.9. FR-09 --- Người dùng tự đóng băng tài khoản (User Self-Freeze) {#fr-09-người-dùng-tự-đóng-băng-tài-khoản-user-self-freeze}

### **Mô tả**

Người dùng tự đóng băng tài khoản để ngăn giao dịch khi nghi ngờ bị xâm
nhập hoặc vì lý do cá nhân.

### **Tác nhân**

- User

### **Input**

- Mật khẩu (để xác nhận)

- Hoặc OTP (tuỳ yêu cầu bảo mật)

### **Điều kiện tiên quyết**

- Tài khoản đang **ACTIVE** (không được LOCKED hoặc FROZEN)

- Người dùng đang đăng nhập

### **Luồng chính**

1.  Người dùng mở trang "Quản lý tài khoản".

2.  Chọn "Tự đóng băng tài khoản".

3.  Xác nhận bằng mật khẩu hoặc OTP.

4.  Hệ thống đổi trạng thái sang **FROZEN**.

5.  Hệ thống tự động đăng xuất user.

### **Luồng thay thế**

- Nhập sai mật khẩu

- Tài khoản đang FROZEN → không thể đóng băng tiếp

### **Output**

- Tài khoản chuyển sang trạng thái FROZEN

# PHẦN 4 --- YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS) {#phần-4-yêu-cầu-phi-chức-năng-non-functional-requirements}

Yêu cầu phi chức năng mô tả các đặc tính về hiệu năng, bảo mật, khả năng
mở rộng và chất lượng hệ thống. Đây là phần quan trọng vì ứng dụng liên
quan đến giao dịch tài chính cần độ tin cậy và an toàn cao.

## 4.1. Hiệu năng (Performance Requirements) {#hiệu-năng-performance-requirements}

### **4.1.1. Thời gian phản hồi** {#thời-gian-phản-hồi}

- Tất cả tác vụ giao dịch (nạp, rút, chuyển) phải phản hồi trong **≤ 2
  > giây**.

- Trang lịch sử giao dịch tải trong **≤ 3 giây** với tối đa 500 bản ghi.

### **4.1.2. Số lượng người dùng** {#số-lượng-người-dùng}

- Hệ thống hỗ trợ tối thiểu **10.000 người dùng đồng thời**.

- Phải đảm bảo không bị nghẽn khi nhiều giao dịch chạy song song.

### **4.1.3. Tối ưu truy vấn** {#tối-ưu-truy-vấn}

- Mọi giao dịch cập nhật số dư phải sử dụng **transaction DB ACID** để
  > đảm bảo nhất quán.

- Lịch sử giao dịch phải được phân trang (pagination) để tránh truy vấn
  > nặng.

## 4.2. Bảo mật (Security Requirements) {#bảo-mật-security-requirements}

### **4.2.1. Xác thực** {#xác-thực}

- Mật khẩu phải được mã hóa bằng **bcrypt hoặc Argon2**.

- Mật khẩu không bao giờ được lưu dạng plaintext.

- Token đăng nhập sử dụng **JWT** và có thời hạn.

### **4.2.2. Reset mật khẩu** {#reset-mật-khẩu}

- Reset token/OTP có hiệu lực tối đa **5 phút**.

- Token reset chỉ được dùng **1 lần**.

- Giới hạn 5 lượt nhập OTP sai.

### **4.2.3. Kiểm soát truy cập** {#kiểm-soát-truy-cập}

- User chỉ truy cập được tài nguyên của chính họ.

- Admin có quyền truy cập toàn hệ thống.

- Tài khoản bị **FROZEN** không thể thực hiện giao dịch tài chính.

### **4.2.4. Chống tấn công** {#chống-tấn-công}

Hệ thống phải bảo vệ trước:

- SQL Injection

- XSS

- CSRF

- Brute-force (lock tạm thời sau 5 lần nhập sai)

- Replay attack (JWT phải có exp và iat)

### **4.2.5. Ghi log** {#ghi-log}

- Tất cả hành động quan trọng (login, reset password, freeze account,
  > giao dịch) phải được ghi log.

- Log không được chứa dữ liệu nhạy cảm (password, token).

## 4.3. Khả năng mở rộng (Scalability Requirements) {#khả-năng-mở-rộng-scalability-requirements}

### **4.3.1. Mở rộng theo chiều ngang / dọc** {#mở-rộng-theo-chiều-ngang-dọc}

- Backend có thể scale-out bằng nhiều instance.

- Database hỗ trợ replica để tăng tốc đọc.

### **4.3.2. Khả năng thêm tính năng mới** {#khả-năng-thêm-tính-năng-mới}

- Kiến trúc Microservice-ready (nếu muốn tách sau này).

- Dễ thêm module mới như: OTP nâng cao, giao dịch QR, v.v.

## 4.4. Khả năng sử dụng (Usability Requirements) {#khả-năng-sử-dụng-usability-requirements}

### **4.4.1. Dễ sử dụng** {#dễ-sử-dụng}

- Giao diện trực quan, phù hợp người không có kỹ thuật.

- Tất cả lỗi hiển thị rõ ràng, có hướng dẫn cách xử lý.

### **4.4.2. Hỗ trợ thiết bị** {#hỗ-trợ-thiết-bị}

- Giao diện responsive cho PC, laptop, điện thoại.

- Tương thích các trình duyệt phổ biến.

### **4.4.3. Ngôn ngữ** {#ngôn-ngữ}

- Hệ thống hỗ trợ UI tiếng Việt (có thể mở rộng đa ngôn ngữ).

## 4.5. Độ tin cậy (Reliability Requirements) {#độ-tin-cậy-reliability-requirements}

### **4.5.1. Độ sẵn sàng** {#độ-sẵn-sàng}

- Hệ thống cần đạt uptime **≥ 99%**.

### **4.5.2. Lưu trữ an toàn** {#lưu-trữ-an-toàn}

- Không mất dữ liệu khi restart server.

- Cơ chế backup DB hằng ngày.

### **4.5.3. Tính toàn vẹn giao dịch** {#tính-toàn-vẹn-giao-dịch}

- Mỗi giao dịch nạp/rút/chuyển phải là **atomic**:

  - Thực hiện hoàn toàn hoặc không thực hiện.

## 4.6. Khả năng phục hồi (Recoverability Requirements) {#khả-năng-phục-hồi-recoverability-requirements}

### **4.6.1. Khôi phục hệ thống** {#khôi-phục-hệ-thống}

- Khi xảy ra lỗi nghiêm trọng, hệ thống phải khởi động lại trong **≤ 30
  > giây**.

- Dữ liệu không bị mất sau khi phục hồi.

### **4.6.2. Quản lý lỗi** {#quản-lý-lỗi}

- Các lỗi hệ thống được log đầy đủ.

- Người dùng được thông báo lỗi thân thiện, không lộ thông tin kỹ thuật.

## 4.7. Khả năng bảo trì (Maintainability Requirements) {#khả-năng-bảo-trì-maintainability-requirements}

### **4.7.1. Mã nguồn dễ mở rộng** {#mã-nguồn-dễ-mở-rộng}

- Tách lớp rõ ràng: Controller -- Service -- Repository.

- Tuân thủ coding convention và clean architecture.

### **4.7.2. Tài liệu** {#tài-liệu}

- Mỗi API phải có tài liệu rõ ràng (Swagger/OpenAPI).

## 4.8. Tương thích (Compatibility Requirements) {#tương-thích-compatibility-requirements}

### **4.8.1. API** {#api}

- Hệ thống cung cấp API RESTful chuẩn.

- Frontend React giao tiếp qua JSON.

### **4.8.2. Browser** {#browser}

- Hỗ trợ Chrome, Firefox, Edge, Safari bản mới nhất.

# **PHẦN 5 --- RÀNG BUỘC THIẾT KẾ (DESIGN CONSTRAINTS)** {#phần-5-ràng-buộc-thiết-kế-design-constraints}

Phần này mô tả các hạn chế về công nghệ, kỹ thuật, quy định và môi
trường mà hệ thống phải tuân theo.  
Đây là những ràng buộc *không thể thay đổi* trong quá trình thiết kế &
phát triển.

## 5.1. Ràng buộc về công nghệ (Technological Constraints) {#ràng-buộc-về-công-nghệ-technological-constraints}

### **5.1.1. Ngôn ngữ & Framework** {#ngôn-ngữ-framework}

- Backend **bắt buộc** sử dụng **Java + Spring Boot**.

- Frontend **bắt buộc** dùng **ReactJS**.

- API giao tiếp theo chuẩn **RESTful**.

### **5.1.2. Hệ quản trị cơ sở dữ liệu** {#hệ-quản-trị-cơ-sở-dữ-liệu}

- Database sử dụng **PostgreSQL** ≥ phiên bản 13.

- Phải hỗ trợ giao dịch ACID (Atomicity -- Consistency -- Isolation --
  > Durability).

### **5.1.3. Email Service** {#email-service}

- Chức năng quên mật khẩu phụ thuộc vào SMTP server hoặc API như Gmail,
  > Mailgun, SendGrid.

## 5.2. Ràng buộc về môi trường triển khai (Deployment Constraints) {#ràng-buộc-về-môi-trường-triển-khai-deployment-constraints}

### **5.2.1. Máy chủ** {#máy-chủ}

- Ứng dụng phải chạy được trên môi trường Linux (Ubuntu/CentOS).

- Cổng API mặc định: **8080**.

- Cổng UI (frontend): **3000**.

### **5.2.2. Hỗ trợ trình duyệt** {#hỗ-trợ-trình-duyệt}

Ứng dụng cần chạy ổn định trên:

- Google Chrome

- Firefox

- Microsoft Edge

- Safari

### **5.2.3. HTTPS bắt buộc** {#https-bắt-buộc}

- Toàn bộ giao tiếp phải sử dụng HTTPS, đặc biệt là đăng nhập, reset mật
  > khẩu và giao dịch tài chính.

## 5.3. Ràng buộc theo quy trình (Process Constraints) {#ràng-buộc-theo-quy-trình-process-constraints}

### **5.3.1. Kiểm thử** {#kiểm-thử}

- Mỗi tính năng phải có test case tương ứng (Unit test, Integration
  > test).

- Giao dịch phải được kiểm thử đồng thời (concurrency test).

### **5.3.2. Quy trình phát triển** {#quy-trình-phát-triển}

- Tuân theo mô hình Agile/Scrum hoặc mô hình do nhóm quy định.

- Mọi thay đổi yêu cầu phải được review code trước khi merge.

## 5.4. Ràng buộc về bảo mật (Security Constraints) {#ràng-buộc-về-bảo-mật-security-constraints}

### **5.4.1. Mã hóa mật khẩu** {#mã-hóa-mật-khẩu}

- Mật khẩu **bắt buộc** sử dụng bcrypt hoặc Argon2.

### **5.4.2. Chính sách đăng nhập** {#chính-sách-đăng-nhập}

- Lock tạm thời sau nhiều lần đăng nhập sai.

- Session timeout sau 30 phút không hoạt động.

### **5.4.3. Transaction Freeze** {#transaction-freeze}

- Mọi giao dịch phải kiểm tra trạng thái tài khoản:

  - Nếu FROZEN → Không được phép giao dịch.

### **5.4.4. Quy tắc truy cập dữ liệu** {#quy-tắc-truy-cập-dữ-liệu}

- User chỉ xem được dữ liệu của chính họ.

- Admin có quyền truy cập toàn bộ dữ liệu.

## 5.5. Ràng buộc về giao diện người dùng (UI Constraints) {#ràng-buộc-về-giao-diện-người-dùng-ui-constraints}

### **5.5.1. Bố cục** {#bố-cục}

- Giao diện phải responsive để hoạt động trên cả máy tính và điện thoại.

- Các nút hành động nguy hiểm (Freeze, Lock, Withdraw) phải có cảnh báo
  > xác nhận.

### **5.5.2. Khả năng truy cập** {#khả-năng-truy-cập}

- Font chữ dễ đọc.

- Màu sắc rõ ràng, hỗ trợ chế độ sáng/tối (nếu có).

## 5.6. Ràng buộc lưu trữ dữ liệu (Data Storage Constraints) {#ràng-buộc-lưu-trữ-dữ-liệu-data-storage-constraints}

### **5.6.1. Lưu trữ giao dịch** {#lưu-trữ-giao-dịch}

- Bảng Transaction **không được** phép xóa dữ liệu (chỉ có thể thêm).

- Log phải lưu tối thiểu **90 ngày**.

### **5.6.2. Tính toàn vẹn số dư** {#tính-toàn-vẹn-số-dư}

- Số dư phải được tính dựa trên cơ chế update atomic, không cho phép kết
  > quả không đồng nhất.

## 5.7. Ràng buộc pháp lý (Regulatory Constraints) {#ràng-buộc-pháp-lý-regulatory-constraints}

*(Dù là hệ thống mô phỏng, nhưng để theo chuẩn SRS thì đây vẫn cần ghi
rõ)*

### **5.7.1. Bảo vệ dữ liệu cá nhân** {#bảo-vệ-dữ-liệu-cá-nhân}

- Không được lưu email hoặc thông tin nhạy cảm dưới dạng plaintext.

- Mọi dữ liệu cá nhân phải được xử lý theo nguyên tắc an toàn.

### **5.7.2. Định danh tài khoản** {#định-danh-tài-khoản}

- Mỗi tài khoản ngân hàng phải có ID duy nhất, không trùng lặp.

# PHẦN 6 --- YÊU CẦU DỮ LIỆU (DATA REQUIREMENTS) {#phần-6-yêu-cầu-dữ-liệu-data-requirements}

Phần này mô tả đầy đủ các bảng dữ liệu trong hệ thống, mối quan hệ và
các ràng buộc nhằm đảm bảo tính toàn vẹn giao dịch.

## 6.1. Mô hình dữ liệu tổng quan {#mô-hình-dữ-liệu-tổng-quan}

Hệ thống có 4 bảng chính:

1.  **User** -- thông tin đăng nhập và hồ sơ người dùng

2.  **Account** -- số dư và trạng thái tài khoản

3.  **Transaction** -- lịch sử giao dịch

4.  **Log** -- nhật ký hoạt động

Mối quan hệ chính:

- 1 User → 1 Account

- 1 Account → nhiều Transaction

- 1 User → nhiều Log

## 6.2. Bảng User {#bảng-user}

### **Tên bảng: users**

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc**    | **Mô tả**                |
|----------------|------------------|------------------|--------------------------|
| user_id        | UUID             | PK               | Định danh duy nhất       |
| email          | VARCHAR(100)     | UNIQUE, NOT NULL | Email đăng ký            |
| password       | VARCHAR(255)     | NOT NULL         | Mật khẩu mã hóa (bcrypt) |
| full_name      | VARCHAR(100)     | NULL             | Họ tên người dùng        |
| created_at     | TIMESTAMP        | NOT NULL         | Ngày tạo tài khoản       |
| last_login     | TIMESTAMP        | NULL             | Lần đăng nhập gần nhất   |

### **Ghi chú**

- Mật khẩu **không được** lưu dạng plaintext.

- Email phải hợp lệ theo regex chuẩn.

## 6.3. Bảng Account {#bảng-account}

### **Tên bảng: account**

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc**            | **Mô tả**              |
|----------------|------------------|--------------------------|------------------------|
| account_id     | UUID             | PK                       | Mã tài khoản ngân hàng |
| user_id        | UUID             | FK → users.user_id       | Chủ sở hữu             |
| balance        | DECIMAL(18,2)    | DEFAULT 0                | Số dư hiện tại         |
| status         | VARCHAR(20)      | ACTIVE / LOCKED / FROZEN | Trạng thái             |
| created_at     | TIMESTAMP        | NOT NULL                 | Ngày tạo               |

### **Ràng buộc tài khoản**

- Số dư **không được âm**.

- Trạng thái FROZEN → chặn mọi giao dịch.

## 6.4. Bảng Transaction {#bảng-transaction}

### **Tên bảng: transaction**

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc**                 | **Mô tả**                          |
|----------------|------------------|-------------------------------|------------------------------------|
| trans_id       | UUID             | PK                            | ID giao dịch                       |
| from_acc       | UUID             | NULL                          | Tài khoản gửi (NULL nếu nạp tiền)  |
| to_acc         | UUID             | NULL                          | Tài khoản nhận (NULL nếu rút tiền) |
| amount         | DECIMAL(18,2)    | NOT NULL                      | Số tiền                            |
| type           | VARCHAR(20)      | DEPOSIT / WITHDRAW / TRANSFER | Loại giao dịch                     |
| timestamp      | TIMESTAMP        | NOT NULL                      | Thời gian giao dịch                |
| status         | VARCHAR(20)      | SUCCESS / FAILED              | Trạng thái giao dịch               |

### **Ràng buộc giao dịch**

- amount \> 0

- Nếu type = TRANSFER → from_acc và to_acc đều NOT NULL

- Nếu type = DEPOSIT → to_acc NOT NULL và from_acc phải NULL

- Nếu type = WITHDRAW → from_acc NOT NULL và to_acc phải NULL

- Mọi giao dịch phải là **atomic**

- CHECK constraint đảm bảo logic đúng:
  ```sql
  CHECK (
    (type = 'DEPOSIT' AND from_acc IS NULL AND to_acc IS NOT NULL) OR
    (type = 'WITHDRAW' AND from_acc IS NOT NULL AND to_acc IS NULL) OR
    (type = 'TRANSFER' AND from_acc IS NOT NULL AND to_acc IS NOT NULL)
  )
  ```

## 6.5. Bảng Log {#bảng-log}

### **Tên bảng: log**

| **Thuộc tính** | **Kiểu dữ liệu** | **Ràng buộc** | **Mô tả**                               |
|----------------|------------------|---------------|-----------------------------------------|
| log_id         | UUID             | PK            | ID log                                  |
| user_id        | UUID             | FK → users    | Ai thực hiện                            |
| action         | VARCHAR(255)     | NOT NULL      | Hành động (login, withdraw, freeze\...) |
| detail         | TEXT             | NULL          | Chi tiết bổ sung                        |
| time           | TIMESTAMP        | NOT NULL      | Thời gian ghi log                       |

### **Các hành động bắt buộc phải log**

- Login / Logout

- Failed login

- Reset password

- Nạp / rút / chuyển tiền

- Self-Freeze

- Admin Freeze / Unfreeze / Lock / Unlock

## 6.6. Trạng thái tài khoản (Account State Model) {#trạng-thái-tài-khoản-account-state-model}

### **Các trạng thái hợp lệ**

| **Trạng thái** | **Ý nghĩa**                               |
|----------------|-------------------------------------------|
| ACTIVE         | Có thể giao dịch                          |
| LOCKED         | Không thể đăng nhập                       |
| FROZEN         | Đăng nhập được nhưng không giao dịch được |

### **Luật chuyển trạng thái**

- User → Self-Freeze → ACTIVE → FROZEN

- Admin → có thể chuyển đổi giữa tất cả các trạng thái

- User **không thể tự UNFREEZE** (chỉ Admin làm được)

## 6.7. Ràng buộc dữ liệu tổng quát {#ràng-buộc-dữ-liệu-tổng-quát}

### **6.7.1. Toàn vẹn dữ liệu** {#toàn-vẹn-dữ-liệu}

- Sử dụng ràng buộc FK để tránh giao dịch vào tài khoản không tồn tại.

- Số dư cập nhật phải dùng **transaction DB** để tránh double spending.

### **6.7.2. Kiểu dữ liệu tiền tệ** {#kiểu-dữ-liệu-tiền-tệ}

- Mọi số tiền dùng kiểu **DECIMAL(18,2)** nhằm tránh lỗi số thực.

### **6.7.3. Lưu trữ lịch sử** {#lưu-trữ-lịch-sử}

- Dữ liệu giao dịch không được phép xoá.

- Có thể thêm tính năng lưu trữ (archive) nếu bảng quá lớn.

## 6.8. Các API liên quan đến dữ liệu (Overview) {#các-api-liên-quan-đến-dữ-liệu-overview}

*(Phần chi tiết API có thể sang tài liệu riêng nếu cần --- bạn muốn tôi
thêm vào không?)*

### **User APIs**

- POST /register

- POST /login

- POST /forgot-password

- POST /self-freeze

### **Transaction APIs**

- POST /deposit

- POST /withdraw

- POST /transfer

- GET /transactions

### **Admin APIs**

- GET /admin/users

- PATCH /admin/lock

- PATCH /admin/unlock

- PATCH /admin/freeze

- PATCH /admin/unfreeze

# **PHẦN 7 --- GIAO DIỆN MẪU (WIREFRAME / USER INTERFACE SPECIFICATION)** {#phần-7-giao-diện-mẫu-wireframe-user-interface-specification}

Phần này mô tả các màn hình chính của hệ thống Mini Banking System.  
Mỗi màn hình nêu rõ thành phần giao diện, trường dữ liệu, nút bấm, hành
vi và thông báo lỗi.

## 7.1. Màn hình Đăng ký (Register Page) {#màn-hình-đăng-ký-register-page}

### **Thành phần giao diện**

- Input: Email

- Input: Mật khẩu

- Input: Xác nhận mật khẩu

- Button: Đăng ký

- Link: "Đã có tài khoản? Đăng nhập"

### **Luồng người dùng**

- Nhập thông tin → bấm "Đăng ký" → hiển thị thông báo thành công hoặc
  > lỗi.

### **Thông báo lỗi**

- "Email đã tồn tại"

- "Mật khẩu không hợp lệ"

- "Xác nhận mật khẩu không trùng khớp"

## 7.2. Màn hình Đăng nhập (Login Page) {#màn-hình-đăng-nhập-login-page}

### **Thành phần giao diện**

- Input: Email

- Input: Mật khẩu

- Button: Đăng nhập

- Link: "Quên mật khẩu?"

- Link: "Tạo tài khoản mới"

### **Thông báo lỗi**

- "Sai mật khẩu hoặc email"

- "Tài khoản bị khóa"

## 7.3. Màn hình Quên mật khẩu (Forgot Password Page) {#màn-hình-quên-mật-khẩu-forgot-password-page}

### **Thành phần giao diện**

- Input: Email

- Button: Gửi mã OTP / Liên kết reset

### **Trạng thái tiếp theo**

**Màn hình Reset Password** gồm:

- Input: OTP hoặc Token auto-fill

- Input: Mật khẩu mới

- Input: Xác nhận mật khẩu

- Button: Đặt lại mật khẩu

### **Thông báo lỗi**

- "Email không tồn tại"

- "Token hết hạn"

- "OTP sai quá số lần cho phép"

## 7.4. Trang Dashboard người dùng (User Dashboard) {#trang-dashboard-người-dùng-user-dashboard}

### **Thành phần**

- Hiển thị thông tin người dùng (tên, email)

- Hiển thị số dư hiện tại

- Các nút chức năng:

  - Nạp tiền

  - Rút tiền

  - Chuyển tiền

  - Lịch sử giao dịch

  - **Đóng băng tài khoản (Self-Freeze)  
    > **

### **Lưu ý UI về Self-Freeze**

- Nút "Đóng băng tài khoản" phải màu đỏ hoặc cảnh báo.

- Khi bấm → popup xác nhận + yêu cầu nhập mật khẩu/OTP.

## 7.5. Màn hình Nạp tiền (Deposit Page) {#màn-hình-nạp-tiền-deposit-page}

### **Thành phần**

- Input: Số tiền cần nạp

- Button: Xác nhận nạp

- Text: Số dư sau nạp

### **Thông báo lỗi**

- "Số tiền không hợp lệ"

- "Tài khoản đang bị đóng băng, không thể giao dịch"

## 7.6. Màn hình Rút tiền (Withdraw Page) {#màn-hình-rút-tiền-withdraw-page}

### **Thành phần**

- Input: Số tiền muốn rút

- Button: Xác nhận

- Text: Số dư sau rút

### **Thông báo lỗi**

- "Số dư không đủ"

- "Tài khoản đang bị đóng băng"

## 7.7. Màn hình Chuyển tiền (Transfer Page) {#màn-hình-chuyển-tiền-transfer-page}

### **Thành phần**

- Input: Số tài khoản nhận

- Input: Số tiền chuyển

- Button: Chuyển tiền

### **Thông báo lỗi**

- "Tài khoản nhận không tồn tại"

- "Số dư không đủ"

- "Tài khoản đang bị đóng băng"

## 7.8. Màn hình Lịch sử giao dịch (Transaction History Page) {#màn-hình-lịch-sử-giao-dịch-transaction-history-page}

### **Thành phần**

- Dropdown / Filter:

  - Loại giao dịch (nạp, rút, chuyển)

  - Khoảng thời gian

- Bảng danh sách giao dịch:

  - Mã giao dịch

  - Loại giao dịch

  - Số tiền

  - Tài khoản liên quan

  - Thời gian

  - Trạng thái (SUCCESS/FAILED)

### **Hỗ trợ**

- Phân trang (pagination)

- Tìm kiếm theo ID hoặc ngày

## 7.9. Màn hình Quản lý tài khoản dành cho User (User Account Settings) {#màn-hình-quản-lý-tài-khoản-dành-cho-user-user-account-settings}

### **Thành phần**

- Thông tin tài khoản

- Button: Đổi mật khẩu

- Button: **Tự đóng băng tài khoản (Self-Freeze)  
  > **

- Button: Đăng xuất

### **Self-Freeze UI**

- Popup có nội dung:  
  >   
  >   
  > "Việc đóng băng tài khoản sẽ vô hiệu hóa mọi giao dịch. Bạn có chắc
  > chắn?"

- Yêu cầu:

  - Nhập mật khẩu *hoặc* OTP

  - Button: Xác nhận đóng băng

## 7.10. Màn hình Admin Dashboard (Admin Dashboard) {#màn-hình-admin-dashboard-admin-dashboard}

### **Thành phần**

- Danh sách người dùng:

  - Email

  - Trạng thái (ACTIVE / LOCKED / FROZEN)

  - Số dư

  - Ngày tạo

- Các nút thao tác:

  - Khóa tài khoản

  - Mở khóa

  - Đóng băng

  - Gỡ đóng băng

### **Thông báo**

- Popup xác nhận khi thực hiện thao tác với user.

## 7.11. Màn hình báo cáo (Admin Report Page) {#màn-hình-báo-cáo-admin-report-page}

### **Thành phần**

- Tổng số người dùng

- Tổng số giao dịch trong ngày

- Tổng tiền giao dịch

- Giao dịch thất bại

- Các biểu đồ (nếu có):

  - Biểu đồ giao dịch theo ngày

  - Tỷ lệ giao dịch thành công

# PHẦN 8 --- TIÊU CHÍ CHẤP NHẬN (ACCEPTANCE CRITERIA) {#phần-8-tiêu-chí-chấp-nhận-acceptance-criteria}

Mỗi chức năng (FR) đều có tiêu chí xác nhận rõ ràng để đảm bảo hệ thống
hoạt động đúng yêu cầu.  
Tiêu chí được chia thành:

- **Trường hợp hợp lệ (Valid Case)  
  > **

- **Trường hợp lỗi (Invalid Case)  
  > **

- **Kết quả mong đợi (Expected Result)  
  > **

## 8.1. Tiêu chí chấp nhận cho FR-01 --- Đăng ký tài khoản {#tiêu-chí-chấp-nhận-cho-fr-01-đăng-ký-tài-khoản}

| **Mã**    | **Trường hợp**                         | **Kết quả mong đợi**         |
|-----------|----------------------------------------|------------------------------|
| FR01-AC01 | Đăng ký với email mới, mật khẩu hợp lệ | Tài khoản được tạo           |
| FR01-AC02 | Email trùng                            | Thông báo "Email đã tồn tại" |
| FR01-AC03 | Mật khẩu yếu                           | Báo lỗi theo quy tắc độ mạnh |
| FR01-AC04 | Xác nhận mật khẩu không khớp           | Thông báo lỗi                |

## 8.2. Tiêu chí chấp nhận cho FR-02 --- Đăng nhập {#tiêu-chí-chấp-nhận-cho-fr-02-đăng-nhập}

| **Mã**    | **Trường hợp**                    | **Kết quả mong đợi**                          |
|-----------|-----------------------------------|-----------------------------------------------|
| FR02-AC01 | Email + mật khẩu đúng             | Đăng nhập thành công                          |
| FR02-AC02 | Sai mật khẩu                      | Báo lỗi                                       |
| FR02-AC03 | Tài khoản bị khóa                 | Báo "Tài khoản bị khóa"                       |
| FR02-AC04 | Tài khoản tồn tại nhưng bị freeze | Vẫn đăng nhập được nhưng không giao dịch được |

## 8.3. Tiêu chí chấp nhận cho FR-03 --- Quên mật khẩu {#tiêu-chí-chấp-nhận-cho-fr-03-quên-mật-khẩu}

| **Mã**    | **Trường hợp**               | **Kết quả mong đợi**        |
|-----------|------------------------------|-----------------------------|
| FR03-AC01 | Email hợp lệ → gửi OTP/token | Email reset được gửi        |
| FR03-AC02 | Email không tồn tại          | Thông báo lỗi               |
| FR03-AC03 | Token hợp lệ                 | Đặt lại mật khẩu thành công |
| FR03-AC04 | Token hết hạn                | Thông báo "Token hết hạn"   |
| FR03-AC05 | OTP sai quá 5 lần            | Khóa tạm tính năng reset    |

## 8.4. Tiêu chí chấp nhận cho FR-04 --- Nạp tiền {#tiêu-chí-chấp-nhận-cho-fr-04-nạp-tiền}

| **Mã**    | **Trường hợp**       | **Kết quả mong đợi**   |
|-----------|----------------------|------------------------|
| FR04-AC01 | Nhập số tiền hợp lệ  | Số dư tăng đúng        |
| FR04-AC02 | Số tiền không hợp lệ | Báo lỗi                |
| FR04-AC03 | Tài khoản FROZEN     | Không cho nạp, báo lỗi |

## 8.5. Tiêu chí chấp nhận cho FR-05 --- Rút tiền {#tiêu-chí-chấp-nhận-cho-fr-05-rút-tiền}

| **Mã**    | **Trường hợp**                  | **Kết quả mong đợi** |
|-----------|---------------------------------|----------------------|
| FR05-AC01 | Số tiền nhỏ hơn hoặc bằng số dư | Rút thành công       |
| FR05-AC02 | Số dư không đủ                  | Báo lỗi              |
| FR05-AC03 | Tài khoản đang FROZEN           | Không cho rút        |
| FR05-AC04 | Nhập số âm                      | Báo lỗi              |

## 8.6. Tiêu chí chấp nhận cho FR-06 --- Chuyển tiền {#tiêu-chí-chấp-nhận-cho-fr-06-chuyển-tiền}

| **Mã**    | **Trường hợp**                    | **Kết quả mong đợi**                  |
|-----------|-----------------------------------|---------------------------------------|
| FR06-AC01 | Tài khoản nhận tồn tại + số dư đủ | Chuyển tiền thành công                |
| FR06-AC02 | Tài khoản nhận không tồn tại      | Báo lỗi                               |
| FR06-AC03 | Số dư không đủ                    | Báo lỗi                               |
| FR06-AC04 | Tài khoản bị FROZEN               | Không cho chuyển                      |
| FR06-AC05 | Thực hiện chuyển đồng thời        | DB đảm bảo ACID, không sai lệch số dư |

## 8.7. Tiêu chí chấp nhận cho FR-07 --- Lịch sử giao dịch {#tiêu-chí-chấp-nhận-cho-fr-07-lịch-sử-giao-dịch}

| **Mã**    | **Trường hợp**     | **Kết quả mong đợi**                   |
|-----------|--------------------|----------------------------------------|
| FR07-AC01 | User xem lịch sử   | Hiển thị đúng danh sách theo thời gian |
| FR07-AC02 | Dùng bộ lọc        | Trả về dữ liệu đúng điều kiện          |
| FR07-AC03 | Không có giao dịch | Hiển thị trạng thái "Không có dữ liệu" |

## 8.8. Tiêu chí chấp nhận cho FR-08 --- Admin quản lý người dùng {#tiêu-chí-chấp-nhận-cho-fr-08-admin-quản-lý-người-dùng}

| **Mã**    | **Trường hợp**     | **Kết quả mong đợi**                      |
|-----------|--------------------|-------------------------------------------|
| FR08-AC01 | Khóa tài khoản     | User không đăng nhập được                 |
| FR08-AC02 | Mở khóa            | User đăng nhập lại bình thường            |
| FR08-AC03 | Freeze tài khoản   | User đăng nhập được nhưng không giao dịch |
| FR08-AC04 | Unfreeze           | User giao dịch lại bình thường            |
| FR08-AC05 | Xem danh sách user | Hiển thị đúng thông tin                   |
| FR08-AC06 | Ghi log admin      | Mọi thao tác đều được lưu log             |

## 8.9. Tiêu chí chấp nhận cho FR-09 --- Người dùng tự đóng băng tài khoản {#tiêu-chí-chấp-nhận-cho-fr-09-người-dùng-tự-đóng-băng-tài-khoản}

| **Mã**    | **Trường hợp**                          | **Kết quả mong đợi**            |
|-----------|-----------------------------------------|---------------------------------|
| FR09-AC01 | User xác nhận Self-Freeze               | Tài khoản chuyển sang FROZEN    |
| FR09-AC02 | Nhập sai mật khẩu xác nhận              | Báo lỗi                         |
| FR09-AC03 | Tài khoản đang FROZEN mà cố freeze tiếp | Báo lỗi                         |
| FR09-AC04 | Freeze xong → hệ thống logout           | Người dùng bị đăng xuất tự động |
| FR09-AC05 | Giao dịch sau khi FROZEN                | Bị chặn đúng quy định           |

# **PHẦN 9 --- TỔNG KẾT (CONCLUSION)** {#phần-9-tổng-kết-conclusion}

Tài liệu SRS này mô tả đầy đủ các yêu cầu chức năng, yêu cầu phi chức
năng, mô hình dữ liệu, ràng buộc thiết kế, giao diện người dùng và tiêu
chí chấp nhận cho hệ thống **Mini Banking System**.

SRS đã trình bày:

- **Phạm vi và mục tiêu hệ thống  
  > **

- **Chức năng của người dùng và admin  
  > **

- **Toàn bộ nghiệp vụ ngân hàng mô phỏng** gồm đăng ký, đăng nhập, quên
  > mật khẩu, nạp/rút/chuyển tiền, lịch sử giao dịch

- **Nghiệp vụ bổ sung nâng cao**, gồm:

  - Đóng băng tài khoản (Admin)

  - Người dùng tự đóng băng tài khoản (Self-Freeze)

- **Tính toàn vẹn giao dịch, bảo mật, và chống gian lận** trong môi
  > trường mô phỏng

- **Mô hình dữ liệu & ràng buộc ACID  
  > **

- **Yêu cầu UI & Acceptence Criteria để kiểm thử  
  > **

Hệ thống sau khi triển khai cần đảm bảo:

- Hoạt động đúng theo đặc tả

- Đáp ứng các tiêu chí bảo mật và hiệu năng

- Cung cấp trải nghiệm người dùng rõ ràng, dễ hiểu

- Đảm bảo dữ liệu nhất quán và không thất thoát

Tài liệu SRS này là nền tảng để phát triển:

- Tài liệu thiết kế hệ thống (SDD)

- Tài liệu API (API Spec)

- Tài liệu kiểm thử (Test Plan)

- Kế hoạch triển khai hệ thống
