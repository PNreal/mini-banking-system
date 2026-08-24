# API Gateway - MiniBank System

API Gateway là **điểm truy cập duy nhất (Single Entry Point)** cho toàn bộ hệ thống Mini Banking, kết nối 2 ứng dụng Frontend (Customer Web & Admin Hub) với các Microservices phía sau.

---

## 🚀 Thông tin Kỹ thuật & Cổng

* **Cổng dịch vụ (Port):** `http://localhost:8080`
* **Công nghệ:** Spring Boot 3.3.6, Spring Cloud Gateway MVC, JJWT

---

## 🗺️ Bảng Định Tuyến (Routing Table)

API Gateway tiếp nhận các request có prefix `/api/v1/**` và chuyển tiếp (Forward) tương ứng:

| Tiền tố Gateway (Prefix) | Dịch vụ Đích (Downstream Service) | Cổng Nội bộ | Cổng Host | Vai trò |
| :--- | :--- | :---: | :---: | :--- |
| `/api/v1/users/**` | **`user-service`** | `user-service:8081` | `8081` | Quản lý người dùng, đăng ký, đăng nhập |
| `/api/v1/kyc/**` | **`user-service`** | `user-service:8081` | `8081` | Xác minh danh tính KYC |
| `/api/v1/account/**` | **`core-banking-service`** | `core-banking-service:8082` | `8082` | Tra cứu số dư, trạng thái tài khoản |
| `/api/v1/transactions/**` | **`core-banking-service`** | `core-banking-service:8082` | `8082` | Nạp, rút, chuyển khoản, lịch sử |
| `/api/v1/counters/**` | **`core-banking-service`** | `core-banking-service:8082` | `8082` | Quản lý quầy giao dịch |
| `/api/v1/counter/**` | **`core-banking-service`** | `core-banking-service:8082` | `8082` | Giao dịch quầy & Dashboard nhân viên |
| `/api/v1/logs/**` | **`log-service`** | `log-service:8083` | `8083` | Nhật ký hệ thống |
| `/api/v1/admin/logs/**` | **`log-service`** | `log-service:8083` | `8083` | Nhật ký kiểm toán Admin |
| `/api/v1/notifications/**` | **`notification-service`** | `notification-service:8084` | `8084` | Quản lý và xem lịch sử thông báo |

---

## 🔐 Các Tính Năng Cốt Lõi

1. **Header Enrichment (Tự động giải mã & Bổ sung thông tin User):**
   * Khi Frontend gửi request kèm `Authorization: Bearer <token>`, Gateway sẽ tự động giải mã JWT và bổ sung các header downstream:
     * `X-User-Email`: Email của người dùng
     * `X-User-Id`: UUID của người dùng (truy vấn nhanh qua cache/internal)
     * `X-User-Role`: Quyền hạn (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_CUSTOMER`)
2. **Hỗ trợ Multipart/Form-Data:**
   * Tự động nhận diện và chuyển tiếp file upload (ảnh CCCD, KYC, avatar) mà không làm hỏng định dạng nhị phân.
3. **Cấu hình CORS toàn cục:**
   * Cho phép các domain Frontend (`http://localhost:3000`, `http://localhost:3001`) gọi API mà không bị chặn trình duyệt.
4. **Health Check & Actuator:**
   * Endpoint kiểm tra trạng thái: `GET http://localhost:8080/actuator/health`
